import { LLMClient, Stagehand } from '@browserbasehq/stagehand';
import OpenAI from 'openai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as dotenv from 'dotenv';

dotenv.config();

function toBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

class GroqLLMClient extends LLMClient {
  private groqModel: string;
  private client: OpenAI;

  constructor(modelName: string, apiKey: string) {
    super('gpt-4o'); // placeholder requerido por el tipado de LLMClient
    this.groqModel = modelName;
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createChatCompletion<T = any>(params: any): Promise<T> {
    const { options } = params;
    const messages = options.messages ?? [];

    const hasTools  = options.tools && options.tools.length > 0;
    const hasSchema = !!options.response_model;

    // extract(): inyectamos el schema en el prompt y pedimos JSON puro
    if (hasSchema) {
      const jsonSchema = zodToJsonSchema(options.response_model.schema);
      messages.push({
        role: 'user',
        content: `Respond ONLY with a valid JSON object that matches this schema:\n${JSON.stringify(jsonSchema, null, 2)}\n\nDo not include markdown, code blocks, or any other text. Just the JSON object.`,
      });
    }

    const body: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model: this.groqModel,
      messages,
      temperature: options.temperature ?? 0.1,
      stream: false,
      ...(hasSchema && !hasTools ? { response_format: { type: 'json_object' } } : {}),
    };

    // act(): Stagehand envía tools y espera choices[0].message.tool_calls
    if (hasTools) {
      (body as any).tools = options.tools.map((t: any) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    const response = await this.client.chat.completions.create(body);
    const choice   = response.choices[0];

    // act/observe con tools → devolver respuesta completa para que Stagehand
    // acceda a choices[0].message.tool_calls
    if (hasTools) {
      return response as unknown as T;
    }

    // extract() con schema Zod → devolver el objeto JSON parseado
    if (hasSchema && choice.message.content) {
      try {
        return JSON.parse(choice.message.content) as T;
      } catch {
        const match = choice.message.content.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]) as T;
        return choice.message.content as unknown as T;
      }
    }

    return response as unknown as T;
  }
}

export function createGroqStagehand(): Stagehand {
  const apiKey    = process.env.GROQ_API_KEY || '';
  const modelName = process.env.GROQ_MODEL   || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    throw new Error('¡Error! No se encontró GROQ_API_KEY en el archivo .env');
  }

  const llmClient = new GroqLLMClient(modelName, apiKey);

  return new Stagehand({
    env: 'LOCAL',
    verbose: 2,
    llmClient,
    localBrowserLaunchOptions: {
      headless: toBoolean(process.env.HEADLESS, false),
    },
  } as any);
}

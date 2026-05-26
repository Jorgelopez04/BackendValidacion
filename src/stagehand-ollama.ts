import { Stagehand } from '@browserbasehq/stagehand';

function toBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

export function createOllamaStagehand(): Stagehand {
  const modelName = process.env.OLLAMA_MODEL || 'llama3.1';

  return new Stagehand({
    env: 'LOCAL',
    verbose: 2,
    llmProvider: {
      // Agregamos el nombre del modelo para que la librería sepa qué usar
      modelName: modelName,
      createChatStream: async (options: any) => {
        try {
          const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: modelName,
              messages: options.messages,
              stream: false,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Error de Ollama: ${response.statusText}`);
          }

          const data = await response.json();
          
          return {
            text: data.message?.content || '',
            // Algunos proveedores de Stagehand requieren un objeto de uso estructurado
            usage: {
              promptTokens: data.prompt_tokens || 0,
              completionTokens: data.completion_tokens || 0,
            },
          };
        } catch (error) {
          console.error("Error en la llamada a Ollama:", error);
          throw error;
        }
      },
    } as any, // Mantenemos el as any para ignorar discrepancias menores de tipo en el objeto
    localBrowserLaunchOptions: {
      headless: toBoolean(process.env.HEADLESS, false),
    },
  });
}
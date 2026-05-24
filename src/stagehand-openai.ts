import { Stagehand } from '@browserbasehq/stagehand';
import * as dotenv from 'dotenv';

dotenv.config();

export function createOpenAIStagehand(): Stagehand {
  const apiKey = process.env.OPENAI_API_KEY;
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('¡Error! No se encontró la OPENAI_API_KEY en el archivo .env');
  }

  return new Stagehand({
    env: 'LOCAL',
    verbose: 2,
    // Usamos 'llmProvider' para pasar el modelo y la configuración
    llmProvider: {
        modelName: modelName,
        // Al dejar el proveedor vacío aquí, Stagehand intentará usar 
        // el cliente de OpenAI que ya instalamos en tus node_modules
    } as any,
    // Si necesitas configurar el cliente de forma explícita:
    modelClientOptions: {
      apiKey: apiKey,
    },
    localBrowserLaunchOptions: {
      headless: process.env.HEADLESS === 'true',
    },
  });
}
import { createOpenAIStagehand } from '../src/stagehand-openai';
import { assertIncludes } from '../src/assert';
import * as dotenv from 'dotenv';

// Cargamos la configuración del .env
dotenv.config();

describe('Prueba E2E de Autenticación - OpenAI', () => {
  let stagehand;

  beforeAll(async () => {
    stagehand = createOpenAIStagehand();
    await stagehand.init();
  }, 30000);

  afterAll(async () => {
    await stagehand.close();
  });

  it('Debería ingresar credenciales del administrador y verificar el acceso', async () => {
    const { page, act, extract } = stagehand;

    // 1. Navegamos al frontend de tu aplicativo local
    await page.goto('http://localhost:3000');

    // 2. Acción dirigida por lenguaje natural usando GPT
    await act({
      action: 'Escribir el documento "1001132363" en el campo de identificación, ingresar la contraseña "Jorge12" y hacer clic en el botón de ingresar.'
    });

    // Esperamos un momento a que el backend responda y cargue la vista
    await page.waitForTimeout(3000);

    // 3. Extraemos el texto de la UI para evaluar la aserción
    const resultado = await extract({
      instruction: 'Extraer el texto de bienvenida o el nombre de usuario que aparece en el panel principal',
      schema: {
        type: 'object',
        properties: {
          textoVisible: { type: 'string' }
        },
        required: ['textoVisible']
      }
    });

    // 4. Tu aserción estricta de src/assert.ts con sus 3 parámetros
    assertIncludes(
      resultado.textoVisible,
      'Jorge',
      'El panel de administración no muestra el nombre del usuario esperado'
    );
  }, 60000);
});
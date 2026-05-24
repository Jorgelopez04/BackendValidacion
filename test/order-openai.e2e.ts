import { createOpenAIStagehand } from '../src/stagehand-openai';
import { assertIncludes } from '../src/assert';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Funcionalidad: Órdenes de Producción', () => {
  let stagehand;

  beforeAll(async () => {
    stagehand = createOpenAIStagehand();
    await stagehand.init();
  }, 30000);

  afterAll(async () => {
    await stagehand.close();
  });

  it('Debería generar una nueva orden de producción para el taller', async () => {
    const { page, act, extract } = stagehand;

    await page.goto('http://localhost:3000');
    await act({ action: 'Iniciar sesión con la cédula "1001132363" y clave "Jorge12"' });
    await page.waitForTimeout(3000);

    // Navegar a Órdenes
    await act({ action: 'Hacer clic en "Órdenes de Producción" en el menú' });
    await act({ action: 'Hacer clic en el botón para crear una nueva orden' });

    // Llenar datos de la orden (Asignar lote y cantidad)
    await act({ 
      action: 'Seleccionar el producto "Jean Clásico Azul", digitar la cantidad "50" unidades y seleccionar la fecha de entrega para fin de mes' 
    });
    await act({ action: 'Pulsar en "Generar Órden" o "Enviar a Taller"' });

    await page.waitForTimeout(3000);

    // Extraer el estado asignado automáticamente por el backend (ej: "Pendiente" o "En Proceso")
    const resultado = await extract({
      instruction: 'Extraer el estado o estado actual de la orden recién creada en la pantalla',
      schema: {
        type: 'object',
        properties: { estadoOrden: { type: 'string' } },
        required: ['estadoOrden']
      }
    });

    // Validar con tu assert que la orden quedó registrada en el sistema
    assertIncludes(
      resultado.estadoOrden,
      'Pendiente', // O el estado inicial de tu negocio ('En Proceso', 'Creado', etc)
      'La orden de producción no quedó en el estado inicial correcto.'
    );
  }, 60000);
});
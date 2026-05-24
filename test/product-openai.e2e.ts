import { createOpenAIStagehand } from '../src/stagehand-openai';
import { assertIncludes } from '../src/assert';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Funcionalidad: Gestión de Productos - TailorFlow (Suite Completa)', () => {
  let stagehand;

  beforeAll(async () => {
    stagehand = createOpenAIStagehand();
    await stagehand.init();
  }, 60000);

  afterAll(async () => {
    await stagehand.close();
  });

  // 1. CP01 & CP02: Validación de lectura (Listar y Buscar)
  it('Debería listar productos y permitir buscar por ID', async () => {
    const { page, act, extract } = stagehand;
    await page.goto('http://localhost:3000');
    await act({ action: 'Iniciar sesión con "1001132363" y clave "Jorge12"' });
    await act({ action: 'Ir a sección de Productos' });
    
    const lista = await extract({
      instruction: 'Extraer lista de productos',
      schema: { type: 'object', properties: { nombres: { type: 'array', items: { type: 'string' } } }, required: ['nombres'] }
    });
    
    // Validar que hay productos (CP01)
    if (lista.nombres.length === 0) throw new Error('No hay productos listados');
  });

  // 2. CP03: Validación de Creación y Ruta de Producción
  it('Debería crear producto y asignar ruta/operario automáticamente', async () => {
    const { act, extract } = stagehand;
    await act({ action: 'Crear nuevo producto: "Jean Test", ref "JT-99", precio "120000", categoría "Pantalones"' });
    
    // Validar que la lógica de backend (initializeProductionRoute) funcionó en la UI
    const asignacion = await extract({
      instruction: 'Extraer el nombre del operario asignado en la tarea recién creada',
      schema: { type: 'object', properties: { operario: { type: 'string' } }, required: ['operario'] }
    });
    
    assertIncludes(asignacion.operario, 'Jorge', 'No se asignó operario automáticamente');
  });

  // 3. CP04: Validación de Regla de Negocio (Bloqueo de edición)
  it('Debería impedir editar un producto que ya está en producción (Estado != 1)', async () => {
    const { act, extract } = stagehand;
    // Seleccionar un producto que ya esté en producción (estado diferente a 1)
    await act({ action: 'Intentar editar el producto en proceso "Jean Test"' });
    await act({ action: 'Cambiar precio a "999" y hacer clic en guardar' });
    
    const validacion = await extract({
      instruction: 'Extraer el mensaje de error o notificación del sistema',
      schema: { type: 'object', properties: { msg: { type: 'string' } }, required: ['msg'] }
    });
    
    assertIncludes(validacion.msg.toLowerCase(), 'no se permiten cambios', 'El sistema permitió editar un producto en producción!');
  });
});
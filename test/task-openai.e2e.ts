import { createOpenAIStagehand } from '../src/stagehand-openai';
import { assertIncludes } from '../src/assert';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Funcionalidad: Control de Tareas de Confección - Validación de Reglas', () => {
  let stagehand;

  beforeAll(async () => {
    stagehand = createOpenAIStagehand();
    await stagehand.init();
  }, 60000);

  afterAll(async () => {
    stagehand.close();
  });

  it('Debería validar la asignación y el bloqueo de flujo (Seguridad)', async () => {
    const { page, act, extract } = stagehand;

    await page.goto('http://localhost:3000');
    await act({ action: 'Iniciar sesión con "1001132363" y clave "Jorge12"' });

    // 1. Validar Asignación (CP05 del Service)
    await act({ action: 'Ir a "Tareas", clic en "Asignar", elegir "Costura de Pretina" y asignar a "Jorge"' });
    
    const asignacion = await extract({
      instruction: 'Extraer el nombre del operario en la última fila',
      schema: { type: 'object', properties: { nombre: { type: 'string' } }, required: ['nombre'] }
    });
    assertIncludes(asignacion.nombre, 'Jorge', 'Falló la asignación de operario');

    // 2. Validar Bloqueo de Flujo (CP10 del Service: No permitir inicio si la anterior no está lista)
    // Esto prueba la lógica de 'ensurePreviousTaskCompleted' en tu TasksService
    await act({ action: 'Intentar iniciar una tarea cuya tarea predecesora está pendiente' });
    
    const error = await extract({
      instruction: 'Extraer el mensaje de error de bloqueo de flujo',
      schema: { type: 'object', properties: { msg: { type: 'string' } }, required: ['msg'] }
    });

    assertIncludes(
      error.msg.toLowerCase(), 
      'no ha sido completada', 
      '¡Falla de Seguridad! El sistema permitió saltarse el orden de tareas.'
    );
  }, 90000);
});
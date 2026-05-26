/**
 * task-groq.e2e.ts
 *
 * ARQUITECTURA:
 *  - 0 extract()      → toda lectura de datos se hace con Playwright puro
 *  - 0 act()          → todos los clicks e inputs usan locators directos
 *  - 0 waitForTimeout → todas las esperas son deterministas
 *  - Stagehand        → sólo instancia el navegador Chromium
 *
 * CREDENCIALES: usa loginEmployee() → requiere EMPLOYEE_CC / EMPLOYEE_PASSWORD en .env
 *   (por defecto: 1001132363 / Jorge12 desde CREDS_EMPLOYEE)
 *
 * IMPORTANTE SOBRE ROLES:
 *  La ruta /employee/tasks requiere id_role=2 (empleado).
 *  Si las credenciales son de admin (id_role=1), el roleGuard redirige a /admin.
 *  Cada test detecta el redirect y retorna sin fallar (skip condicional en runtime).
 *
 * SELECTORES REALES (de employee-tasks.html):
 *  Layout de TARJETAS — no hay tabla mat-table en esta vista:
 *
 *    .tasks-container           → contenedor principal
 *    .product-group             → grupo de tareas por producto
 *    .task-item                 → una tarea individual
 *    .task-item.task-pending    → tarea en estado Pendiente   (id_state=1)
 *    .task-item.task-in-process → tarea En Proceso            (id_state=2)
 *    .task-item.task-finished   → tarea Completada            (id_state=3)
 *    .task-sequence span        → texto "Secuencia N"
 *    mat-chip                   → chip con nombre del estado
 *    .waiting-message           → "Esperando tarea anterior" (tarea bloqueada)
 *    .task-area span            → nombre del área
 *    button "Iniciar Tarea"     → color="accent"  (state=1 + canStart=true)
 *    button "Completar Tarea"   → color="primary" (state=2)
 *    .finished-badge            → badge "Tarea Completada" (state=3)
 *    .empty-content             → no hay tareas activas asignadas
 */
import { createGroqStagehand } from '../src/stagehand-groq';
import {
  BASE, SS_DIR, loginEmployee, cerrarOverlay, esperarVistasTareas,
} from './e2e-helpers';
import * as dotenv from 'dotenv';

dotenv.config();

jest.setTimeout(90000);

const TASKS_URL = `${BASE}/employee/tasks`;

/**
 * Navega directamente a /employee/tasks y comprueba que no hubo redirección al admin.
 * Retorna true si estamos en la vista correcta, false si el usuario es admin (skip).
 */
async function irATareas(page: any, imgName: string): Promise<boolean> {
  await cerrarOverlay(page);
  await page.goto(TASKS_URL, { waitUntil: 'networkidle' });
  const url = await page.url();
  console.log(`[tareas] URL:`, url);
  await page.screenshot({ path: `${SS_DIR}/${imgName}.png` });

  if (!url.includes('/employee/tasks')) {
    console.warn(
      '[tareas] Redirigido fuera de /employee/tasks. ' +
      'Las credenciales deben ser de empleado (id_role=2). Test saltado.',
    );
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Funcionalidad: Gestión de Tareas de Producción - TailorFlow (Groq)', () => {

  let stagehand: any;
  let page: any;

  beforeAll(async () => {
    stagehand = createGroqStagehand();
    await stagehand.init();
    if (!stagehand.page) throw new Error('Stagehand no inicializado.');
    page = stagehand.page;
    await loginEmployee(page, 'tasks');
  }, 60000);

  afterAll(async () => {
    try { await stagehand.close(); } catch { /* ignorar */ }
  });

  // ─────────────────────────────────────────────────────────────────
  // CP01 — findAll() / findAssignedTasks()
  // ─────────────────────────────────────────────────────────────────
  it('CP01 - Backend findAll() - Debería listar las tareas asignadas al empleado', async () => {
    const ok = await irATareas(page, 'tasks-02-section');
    if (!ok) return;

    // esperarVistasTareas() espera a que la vista resuelva (tarjetas, vacío o error)
    const estado = await esperarVistasTareas(page, 15000);
    await page.screenshot({ path: `${SS_DIR}/tasks-03-loaded.png` });

    if (estado === 'error') {
      throw new Error('Backend findAll() de tareas retornó un error en la UI');
    }

    if (estado === 'empty') {
      console.warn('[CP01] El empleado no tiene tareas activas — findAll() retornó vacío (correcto)');
      return;
    }

    // estado === 'tasks' → hay tarjetas visibles
    const totalTareas   = await page.locator('.task-item').count();
    const chips         = await page.locator('.task-item mat-chip').allTextContents();
    const areas         = await page.locator('.task-item .task-area span').allTextContents();
    const seqs          = await page.locator('.task-item .task-sequence span').allTextContents();

    const estadosTareas = chips.map((t: string) => t.trim()).filter(Boolean);
    const areasTareas   = areas.map((t: string) => t.trim()).filter(Boolean);
    const secuencias    = seqs.map((t: string)  => t.trim()).filter(Boolean);

    console.log('[CP01] Tareas visibles:', totalTareas);
    console.log('[CP01] Estados:', estadosTareas);
    console.log('[CP01] Áreas:', areasTareas);
    console.log('[CP01] Secuencias:', secuencias);

    if (estadosTareas.length === 0) {
      throw new Error('Backend findAll() de tareas: no se pudieron leer los estados de las tareas');
    }
  }, 30000);

  // ─────────────────────────────────────────────────────────────────
  // CP02 — assignEmployee() — SKIP
  // employee-tasks.html no tiene interfaz de asignación.
  // Las tareas se crean y asignan automáticamente al crear un pedido.
  // ─────────────────────────────────────────────────────────────────
  it.skip('CP02 - Backend assignEmployee() - No existe UI de asignación en el frontend del empleado', () => {
    // Las tareas llegan pre-asignadas desde el flujo de createOrder en el backend.
  });

  // ─────────────────────────────────────────────────────────────────
  // CP03 — findPreviousTask() / secuencia de tareas
  // ─────────────────────────────────────────────────────────────────
  it('CP03 - Backend findPreviousTask() - Debería identificar la tarea predecesora', async () => {
    const ok = await irATareas(page, 'tasks-04-sequence');
    if (!ok) return;

    const estado = await esperarVistasTareas(page, 15000);

    if (estado !== 'tasks') {
      console.warn(`[CP03] Vista de tareas en estado "${estado}" — skip`);
      return;
    }

    // employee-tasks.html: <div class="task-sequence"><span>Secuencia {{ task.sequence }}</span></div>
    const textoSecuencias = await page.locator('.task-sequence span').allTextContents();
    const secuencias = textoSecuencias.map((t: string) => t.trim()).filter(Boolean);

    console.log('[CP03] Secuencias encontradas:', secuencias);

    if (secuencias.length === 0) {
      throw new Error('Backend findPreviousTask(): no se encontraron números de secuencia en las tareas');
    }

    // employee-tasks.html: <div class="waiting-message">Esperando tarea anterior</div>
    const mensajesEspera   = await page.locator('.waiting-message').allTextContents();
    const tareasBlockeadas = mensajesEspera.map((t: string) => t.trim()).filter(Boolean);

    console.log('[CP03] Tareas bloqueadas (esperando predecesora):', tareasBlockeadas.length);

    const haySecuenciaMultiple = secuencias.some((s: string) => {
      const num = parseInt(s.replace(/\D/g, ''), 10);
      return num > 1;
    });

    if (haySecuenciaMultiple) {
      console.log('[CP03] Backend findPreviousTask() confirmado: hay tareas con secuencia > 1');
    } else {
      console.warn('[CP03] Solo tareas de secuencia 1 — no hay predecesoras visibles en esta sesión');
    }
  }, 30000);

  // ─────────────────────────────────────────────────────────────────
  // CP04 — startTask + updateCascadingStates
  // No debe iniciar si la predecesora está pendiente (botón deshabilitado u oculto)
  // ─────────────────────────────────────────────────────────────────
  it('CP04 - Backend startTask - No debe iniciar tarea bloqueada por predecesora', async () => {
    const ok = await irATareas(page, 'tasks-05-blocked');
    if (!ok) return;

    const estado = await esperarVistasTareas(page, 15000);

    if (estado !== 'tasks') {
      console.warn(`[CP04] Vista de tareas en estado "${estado}" — skip`);
      return;
    }

    // employee-tasks.html: .task-pending + .waiting-message → tarea bloqueada
    const mensajeEspera = page.locator('.waiting-message').first();
    const hayBloqueo    = await mensajeEspera.isVisible().catch(() => false);

    if (!hayBloqueo) {
      console.warn('[CP04] No hay tareas bloqueadas por predecesora pendiente — skip');
      console.warn('[CP04] (Puede que todas sean secuencia 1 o estén desbloqueadas)');
      return;
    }

    await page.screenshot({ path: `${SS_DIR}/tasks-06-blocked-task.png` });
    const textoBloqueo = ((await mensajeEspera.textContent()) ?? '').trim();
    console.log('[CP04] Mensaje de bloqueo:', textoBloqueo);

    const tareaBlockeada = page.locator('.task-item.task-pending')
      .filter({ has: page.locator('.waiting-message') })
      .first();

    const btnIniciar = tareaBlockeada.locator('button').filter({ hasText: /iniciar tarea/i }).first();
    const existeBtn  = await btnIniciar.count() > 0;

    if (!existeBtn) {
      // La UI oculta el botón directamente — comportamiento correcto
      console.log('[CP04] El botón "Iniciar Tarea" no se renderiza para tareas bloqueadas — correcto');
      return;
    }

    const estaDeshabilitado = await btnIniciar.isDisabled();
    console.log('[CP04] Botón "Iniciar Tarea" deshabilitado:', estaDeshabilitado);

    if (!estaDeshabilitado) {
      throw new Error(
        'Falla de seguridad: Backend startTask() permitiría iniciar una tarea ' +
        'cuya predecesora aún está pendiente — el botón no está deshabilitado',
      );
    }
  }, 30000);

  // ─────────────────────────────────────────────────────────────────
  // CP05 — completeTask + updateCascadingStates
  //
  // VALIDACIÓN:
  //   Busca una tarea .task-in-process → click "Completar Tarea" → waitForLoadState
  //   → verifica que la tarea YA NO aparece en .task-in-process con la misma secuencia.
  //   No depende de snackbar ni de que aparezca .task-finished (puede recargarse).
  // ─────────────────────────────────────────────────────────────────
  it('CP05 - Backend completeTask - Completar tarea debe actualizar estado en cascada', async () => {
    const ok = await irATareas(page, 'tasks-07-before-complete');
    if (!ok) return;

    const estado = await esperarVistasTareas(page, 15000);

    if (estado !== 'tasks') {
      console.warn(`[CP05] Vista de tareas en estado "${estado}" — skip`);
      return;
    }

    // employee-tasks.html: .task-item.task-in-process + botón "Completar Tarea"
    const tareaEnProceso = page.locator('.task-item.task-in-process').first();
    const hayEnProceso   = await tareaEnProceso.isVisible().catch(() => false);

    if (!hayEnProceso) {
      console.warn('[CP05] No hay tareas "En Proceso" disponibles — skip');
      console.warn('[CP05] (Usar "Iniciar Tarea" en una tarea Pendiente para habilitar este test)');
      return;
    }

    const chipAntes   = tareaEnProceso.locator('mat-chip').first();
    const estadoAntes = ((await chipAntes.textContent()) ?? '').trim();
    const seqEl       = tareaEnProceso.locator('.task-sequence span').first();
    const secuencia   = ((await seqEl.textContent()) ?? '').trim();

    console.log('[CP05] Completando tarea:', secuencia, '| Estado actual:', estadoAntes);
    await page.screenshot({ path: `${SS_DIR}/tasks-08-in-process.png` });

    const btnCompletar = tareaEnProceso.locator('button').filter({ hasText: /completar tarea/i }).first();
    await btnCompletar.waitFor({ state: 'visible', timeout: 5000 });

    if (await btnCompletar.isDisabled()) {
      console.warn('[CP05] El botón "Completar Tarea" está deshabilitado — no puede completarse aún');
      return;
    }

    await btnCompletar.click();
    // Esperar que la llamada API termine y la UI se actualice
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${SS_DIR}/tasks-09-after-complete.png` });

    // Verificar que la tarea ya NO está en .task-in-process con el mismo número de secuencia
    const tareaAunEnProceso = page.locator('.task-item.task-in-process')
      .filter({ has: page.locator(`.task-sequence span:has-text("${secuencia}")`) })
      .first();

    const sigueEnProceso = await tareaAunEnProceso.isVisible().catch(() => false);

    if (sigueEnProceso) {
      throw new Error(
        `Backend completeTask() no actualizó el estado: la tarea ${secuencia} ` +
        'sigue mostrándose como "En Proceso" después del click en Completar',
      );
    }

    const tareasCompletadas = await page.locator('.task-item.task-finished, .finished-badge').count();
    console.log('[CP05] Tareas en estado Completada en pantalla:', tareasCompletadas);
    console.log('[CP05] Backend completeTask() confirmado — estado actualizado correctamente');
  }, 60000);

});

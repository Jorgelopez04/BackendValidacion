/**
 * e2e-helpers.ts — Helpers reutilizables para la suite E2E TailorFlow
 *
 * PRINCIPIOS:
 *  • Cero waitForTimeout() — cada espera es determinista
 *  • Cero extract() / act() — 100% Playwright puro
 *  • loginAdmin()    → para tests de /admin/*  (ADMIN_CC / ADMIN_PASSWORD en .env)
 *  • loginEmployee() → para tests de /employee/* (EMPLOYEE_CC / EMPLOYEE_PASSWORD)
 *  • Validación de persistencia real (reload + verificar valor) en lugar de snackbar/redirect
 *  • Columnas con fallback wildcard para Angular Material MDC
 *
 * SOBRE EL LOGIN:
 *  El formulario (login.html) usa:
 *    input[formcontrolname="cc"]       → campo cédula
 *    input[type="password"]            → campo contraseña
 *    button.login-button               → "Entrar" (mat-raised-button)
 *
 *  El error de credenciales se muestra como alert() nativo del navegador
 *  (login.ts línea 47), NO como mat-error. Playwright lo intercepta con page.on('dialog').
 *
 *  El éxito se confirma:
 *    1. URL cambia a /admin o /employee (Angular router navega)
 *    2. O localStorage['token'] contiene el JWT (backend OK, router puede tardar)
 *
 *  Si el backend respondió con token pero la navegación no ocurrió,
 *  _doLogin() navega manualmente a la ruta correcta decodificando el JWT.
 */
import * as path from 'path';

export const BASE   = 'http://localhost:4200';
export const SS_DIR = path.resolve(__dirname, '..', 'test-results');

interface Credentials { cc: string; password: string; }

// ── Credenciales por rol ────────────────────────────────────────────────────
// Configurar en .env:
//   ADMIN_CC / ADMIN_PASSWORD      → cuenta con id_role=1 (redirige a /admin)
//   EMPLOYEE_CC / EMPLOYEE_PASSWORD → cuenta con id_role=2 (redirige a /employee)

export const CREDS_ADMIN: Credentials = {
  cc:       process.env.ADMIN_CC       ?? '',
  password: process.env.ADMIN_PASSWORD ?? '',
};

export const CREDS_EMPLOYEE: Credentials = {
  cc:       process.env.EMPLOYEE_CC       ?? '1001132363',
  password: process.env.EMPLOYEE_PASSWORD ?? 'Jorge12',
};

// ── Detección de placeholders ─────────────────────────────────────────────────

// Palabras clave que identifican valores sin configurar.
// No valida formato ni longitud — solo detecta texto de instrucción.
const PLACEHOLDER_KEYWORDS = ['COMPLETAR', 'PLACEHOLDER', 'TU_PASSWORD', 'TU_CC', 'PON_AQUI'];

/**
 * Devuelve true SOLO si el valor está vacío o contiene una palabra clave de placeholder.
 * No rechaza contraseñas con letras, números especiales ni ningún formato real.
 */
function esPlaceholder(valor: string): boolean {
  if (!valor) return true;
  const upper = valor.toUpperCase();
  return PLACEHOLDER_KEYWORDS.some(k => upper.includes(k));
}

// ── Login interno ─────────────────────────────────────────────────────────────

/**
 * Ejecuta el flujo completo de login en el formulario Angular.
 *
 * Manejo del alert() nativo:
 *   login.ts usa `alert('Cédula o contraseña incorrecta')` en el error handler.
 *   Playwright auto-acepta el alert pero no lanza excepción — debemos registrar
 *   el texto con page.on('dialog') ANTES del click para capturarlo.
 *
 * Fallback localStorage:
 *   Si waitForURL() agota el timeout pero el JWT ya está en localStorage,
 *   el backend aceptó las credenciales pero Angular router tardó o falló.
 *   En ese caso decodificamos el JWT para saber la ruta y navegamos manualmente.
 */
async function _doLogin(page: any, prefix: string, creds: Credentials): Promise<void> {
  // ── Verificar si ya hay sesión activa ────────────────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const urlInicial = await page.url();
  console.log(`[login/${prefix}] URL inicial: ${urlInicial}`);

  if (urlInicial.includes('/admin') || urlInicial.includes('/employee')) {
    console.log(`[login/${prefix}] Sesión activa encontrada — omitiendo login`);
    return;
  }

  // ── Esperar formulario visible ───────────────────────────────────────────
  await page.waitForSelector('input[formcontrolname="cc"]', { timeout: 10000 })
    .catch(() => {
      throw new Error(
        `[login/${prefix}] El formulario de login no apareció en 10 s.\n` +
        `Verificar que la app está corriendo en ${BASE}.`,
      );
    });

  // ── Registrar handler para alert() ANTES del click ──────────────────────
  // login.ts: error: (err) => { alert('Cédula o contraseña incorrecta'); }
  let alertMensaje = '';
  const onDialog = async (dialog: any) => {
    alertMensaje = dialog.message();
    console.warn(`[login/${prefix}] Alert del frontend: "${alertMensaje}"`);
    await dialog.dismiss();
  };
  page.on('dialog', onDialog);

  try {
    // ── Rellenar formulario ────────────────────────────────────────────────
    // Selector por formcontrolname (más robusto que input[type="text"])
    console.log(`[login/${prefix}] Rellenando formulario con CC: "${creds.cc.slice(0, 4)}..."`);
    await page.fill('input[formcontrolname="cc"]', creds.cc);
    await page.fill('input[type="password"]', creds.password);
    await page.screenshot({ path: `${SS_DIR}/${prefix}-00-pre-login.png` });

    // ── Verificar que el botón está habilitado (form válido) ─────────────
    const btnEntrar = page.getByRole('button', { name: 'Entrar' }).first();
    await btnEntrar.waitFor({ state: 'visible', timeout: 5000 });

    const deshabilitado = await btnEntrar.isDisabled();
    if (deshabilitado) {
      // Puede pasar si fill() no disparó los eventos de Angular reactive forms
      // Intentar con pressSequentially() como fallback
      console.warn(`[login/${prefix}] Botón deshabilitado tras fill() — intentando pressSequentially()`);
      const ccInput = page.locator('input[formcontrolname="cc"]').first();
      await ccInput.click({ clickCount: 3 });
      await ccInput.pressSequentially(creds.cc, { delay: 20 });
      const pwInput = page.locator('input[type="password"]').first();
      await pwInput.click({ clickCount: 3 });
      await pwInput.pressSequentially(creds.password, { delay: 20 });
      await btnEntrar.waitFor({ state: 'enabled', timeout: 3000 }).catch(() => {});
    }

    // ── Click en "Entrar" ────────────────────────────────────────────────
    await btnEntrar.click();

    // ── Esperar redirección o detectar fallo ─────────────────────────────
    const navegoOk = await page
      .waitForURL(/\/(admin|employee)/, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    const urlPost = await page.url();
    console.log(`[login/${prefix}] URL post-click: ${urlPost} | navegó: ${navegoOk}`);

    if (navegoOk) {
      // ── Caso 1: Login + redirect exitosos ─────────────────────────────
      console.log(`[login/${prefix}] Login exitoso — URL: ${urlPost}`);
      await page.screenshot({ path: `${SS_DIR}/${prefix}-01-login.png` });
      return;
    }

    // ── Caso 2: URL no cambió — verificar localStorage como fallback ─────
    const token: string | null = await page
      .evaluate(() => localStorage.getItem('token'))
      .catch(() => null);

    console.log(`[login/${prefix}] JWT en localStorage: ${token ? 'ENCONTRADO' : 'AUSENTE'}`);

    if (token) {
      // Backend aceptó las credenciales pero Angular router no completó la navegación
      // Decodificar JWT para obtener la ruta correcta
      let homeRoute = '/admin'; // default
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.id_role ?? payload.id_rol ?? 2;
        homeRoute = role === 1 ? '/admin' : '/employee';
        console.log(`[login/${prefix}] JWT id_role=${role} → ruta: ${homeRoute}`);
      } catch {
        console.warn(`[login/${prefix}] No se pudo decodificar JWT — usando /admin por defecto`);
      }

      await page.goto(`${BASE}${homeRoute}`, { waitUntil: 'networkidle' });
      const urlManual = await page.url();
      console.log(`[login/${prefix}] URL tras navegación manual: ${urlManual}`);
      await page.screenshot({ path: `${SS_DIR}/${prefix}-01-login.png` });
      return;
    }

    // ── Caso 3: Login real fallido ────────────────────────────────────────
    // alertMensaje viene del handler registrado arriba
    await page.screenshot({ path: `${SS_DIR}/${prefix}-01-login-error.png` });

    if (alertMensaje) {
      throw new Error(
        `Login fallido — Credenciales incorrectas.\n` +
        `Frontend alert: "${alertMensaje}"\n` +
        `CC utilizado: "${creds.cc.slice(0, 4)}..." | URL: ${urlPost}\n` +
        `Verifica ADMIN_CC / ADMIN_PASSWORD en el archivo .env`,
      );
    }

    throw new Error(
      `Login fallido — URL no cambió y no hay JWT en localStorage.\n` +
      `CC utilizado: "${creds.cc.slice(0, 4)}..." | URL: ${urlPost}\n` +
      `Posibles causas:\n` +
      `  • El backend no está corriendo\n` +
      `  • Las credenciales son incorrectas\n` +
      `  • El formulario no se llenó correctamente`,
    );

  } finally {
    // Remover el handler de dialogs para no interferir con tests posteriores
    page.off('dialog', onDialog);
  }
}

// ─── Login por rol ────────────────────────────────────────────────────────────

/**
 * Autentica con credenciales de ADMIN (id_role=1).
 *
 * Requiere en .env:
 *   ADMIN_CC=<cedula_numerica_admin>
 *   ADMIN_PASSWORD=<password_admin>
 *
 * Lanza con mensaje claro si:
 *  - Las variables no están configuradas o son placeholders
 *  - El login falla (credenciales incorrectas, backend caído)
 *  - El login redirige a /employee en lugar de /admin (rol incorrecto)
 */
export async function loginAdmin(page: any, prefix: string): Promise<void> {
  if (esPlaceholder(CREDS_ADMIN.cc) || esPlaceholder(CREDS_ADMIN.password)) {
    throw new Error(
      `Credenciales de admin no configuradas o tienen valor placeholder.\n\n` +
      `Abre el archivo .env y reemplaza:\n` +
      `  ADMIN_CC=COMPLETAR_CEDULA_ADMIN  →  ADMIN_CC=<tu_cedula_admin>\n` +
      `  ADMIN_PASSWORD=COMPLETAR_PASSWORD_ADMIN  →  ADMIN_PASSWORD=<tu_password>\n\n` +
      `La CC debe ser la de un usuario con id_role=1 en tu base de datos.\n` +
      `Valor actual ADMIN_CC: "${CREDS_ADMIN.cc}"`,
    );
  }

  await _doLogin(page, prefix, CREDS_ADMIN);

  // Verificar que aterrizamos en el área de admin
  const url = await page.url();
  if (url.includes('/employee') && !url.includes('/admin')) {
    throw new Error(
      `loginAdmin() autenticó correctamente pero aterrizó en "${url}".\n` +
      `Esto indica que ADMIN_CC="${CREDS_ADMIN.cc.slice(0, 4)}..." tiene id_role=2 (empleado).\n` +
      `Usa la CC de un usuario con id_role=1 en tu base de datos Supabase.`,
    );
  }

  if (!url.includes('/admin') && !url.includes('/employee')) {
    throw new Error(
      `loginAdmin() no pudo determinar la ruta final — URL: "${url}"\n` +
      `Verificar que la app redirige correctamente tras el login.`,
    );
  }

  console.log(`[loginAdmin/${prefix}] Autenticación exitosa — URL: ${url}`);
}

/**
 * Autentica con credenciales de EMPLOYEE (id_role=2).
 *
 * Por defecto usa 1001132363/Jorge12 si EMPLOYEE_CC no está configurado.
 */
export async function loginEmployee(page: any, prefix: string): Promise<void> {
  if (esPlaceholder(CREDS_EMPLOYEE.cc)) {
    throw new Error(
      `Credenciales de empleado no configuradas.\n` +
      `Añade en .env:\n  EMPLOYEE_CC=<cedula_empleado>\n  EMPLOYEE_PASSWORD=<password>`,
    );
  }

  await _doLogin(page, prefix, CREDS_EMPLOYEE);

  const url = await page.url();
  console.log(`[loginEmployee/${prefix}] Autenticación — URL: ${url}`);
}

/** @deprecated Usar loginAdmin() o loginEmployee() según el rol requerido. */
export const login = loginAdmin;

// ─── Sesión (verificación y recuperación) ────────────────────────────────────

/**
 * Verifica si la sesión sigue activa y re-autentica si expiró.
 * Por defecto usa loginAdmin; pasar loginEmployee para rutas /employee/*.
 */
export async function verificarSesion(
  page: any,
  prefix: string,
  loginFn: (p: any, pref: string) => Promise<void> = loginAdmin,
): Promise<void> {
  const url     = await page.url();
  const enLogin = !url.includes('/admin') && !url.includes('/employee');
  if (enLogin) {
    console.warn(`[sesión] Sesión perdida (URL: ${url}), re-autenticando...`);
    await loginFn(page, prefix);
  }
}

// ─── Overlays Angular Material ────────────────────────────────────────────────

/**
 * Cierra overlays/dialogs/panels abiertos antes de navegar.
 * Orden: dialogs → panels de select/autocomplete → backdrops residuales.
 */
export async function cerrarOverlay(page: any): Promise<void> {
  const dialog = page.locator('mat-dialog-container');
  if (await dialog.count() > 0) {
    await page.keyboard.press('Escape');
    await dialog.first().waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }

  const panel = page.locator('.cdk-overlay-pane:visible');
  if (await panel.count() > 0) {
    await page.keyboard.press('Escape');
    await page.waitForSelector('.cdk-overlay-pane', { state: 'hidden', timeout: 2000 }).catch(() => {});
  }

  const backdrop = page.locator('.cdk-overlay-backdrop');
  if (await backdrop.count() > 0) {
    await page.keyboard.press('Escape');
    await backdrop.first().waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
  }
}

/**
 * Cierra un mat-dialog explícitamente.
 * Busca botón "Cerrar/Close/Cancelar"; si no existe, usa Escape.
 */
export async function cerrarDialog(page: any): Promise<void> {
  const dialog = page.locator('mat-dialog-container');
  if (await dialog.count() === 0) return;

  const btnCerrar = dialog.locator('button')
    .filter({ hasText: /cerrar|close|cancelar/i })
    .first();

  if (await btnCerrar.count() > 0) {
    await btnCerrar.click();
  } else {
    await page.keyboard.press('Escape');
  }

  await dialog.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

// ─── Navegación ───────────────────────────────────────────────────────────────

/**
 * Navega a una sección usando el link del sidebar (href generado por Angular Router).
 * Cierra overlays, verifica sesión, espera networkidle, toma screenshot.
 */
export async function navegar(
  page: any,
  href: string,
  label: string,
  imgName: string,
  loginFn: (p: any, pref: string) => Promise<void> = loginAdmin,
): Promise<void> {
  await cerrarOverlay(page);
  await verificarSesion(page, label, loginFn);

  const link = page.locator(`a[href="${href}"]`).first();
  await link.waitFor({ state: 'visible', timeout: 8000 });
  await link.click();
  await page.waitForLoadState('networkidle');

  const urlFinal = await page.url();
  if (!urlFinal.includes('/admin') && !urlFinal.includes('/employee')) {
    console.warn(`[${label}] Redirección al login durante navegación, re-autenticando...`);
    await loginFn(page, label);
    await link.waitFor({ state: 'visible', timeout: 8000 });
    await link.click();
    await page.waitForLoadState('networkidle');
  }

  console.log(`[${label}] URL:`, await page.url());
  await page.screenshot({ path: `${SS_DIR}/${imgName}.png` });
}

// ─── Tabla Angular Material ───────────────────────────────────────────────────

/**
 * Espera a que la tabla mat-table tenga al menos una fila de datos.
 * Selector tr[mat-row]: atributo preservado en el HTML renderizado por Angular.
 */
export async function esperarFilas(page: any, timeout = 15000): Promise<void> {
  await page.waitForSelector('tr[mat-row]', { timeout });
}

/**
 * Espera a que la tabla cargue O a que aparezca un mensaje de vacío.
 * Retorna true si hay filas, false si hay mensaje de vacío.
 */
export async function esperarTablaOVacia(
  page: any,
  selectorVacio: string,
  timeout = 15000,
): Promise<boolean> {
  await Promise.race([
    page.waitForSelector('tr[mat-row]', { timeout }),
    page.waitForSelector(selectorVacio, { timeout }),
  ]);
  return (await page.locator('tr[mat-row]').count()) > 0;
}

/**
 * Espera a que al menos una celda de la columna indicada tenga texto visible.
 *
 * Por qué es necesario:
 *   esperarFilas() confirma que tr[mat-row] existe, pero Angular puede renderizar
 *   filas vacías antes de que el data binding llene los <td>. Esta función espera
 *   el contenido real usando waitForFunction() (evaluado en el DOM del browser).
 *
 * No lanza si la columna permanece vacía — registra un warning.
 */
export async function esperarContenidoColumna(
  page: any,
  columnDef: string,
  timeout = 10000,
): Promise<void> {
  const selector = `td.mat-column-${columnDef}, td[class*="mat-column-${columnDef}"]`;
  await page.waitForFunction(
    (sel: string) => {
      const cells = document.querySelectorAll(sel);
      return cells.length > 0 &&
        Array.from(cells).some(c => (c.textContent ?? '').trim().length > 0);
    },
    selector,
    { timeout },
  ).catch(() => {
    console.warn(
      `[esperarContenidoColumna] Columna "${columnDef}" sin texto visible ` +
      `tras ${timeout}ms — puede estar vacía o el columnDef no coincide`,
    );
  });
}

/** Cuenta las filas de datos de la tabla. */
export async function contarFilas(page: any): Promise<number> {
  return page.locator('tr[mat-row]').count();
}

/**
 * Lee el texto de todas las celdas de una columna.
 *
 * Estrategia dual:
 *  1. Exacto: td.mat-column-{columnDef}          (Angular Material estándar)
 *  2. Wildcard: td[class*="mat-column-{columnDef}"] (variantes Angular Material MDC v15+)
 */
export async function leerColumna(page: any, columnDef: string): Promise<string[]> {
  const textos = await page.locator(`td.mat-column-${columnDef}`).allTextContents();
  const resultado = textos.map((t: string) => t.trim()).filter(Boolean);

  if (resultado.length === 0) {
    const textosFb = await page
      .locator(`td[class*="mat-column-${columnDef}"]`)
      .allTextContents();
    return textosFb.map((t: string) => t.trim()).filter(Boolean);
  }

  return resultado;
}

/** Lee el texto de una celda en la primera fila. */
export async function leerCeldaPrimeraFila(page: any, columnDef: string): Promise<string> {
  const celda = page.locator('tr[mat-row]').first()
    .locator(`td.mat-column-${columnDef}`).first();
  return ((await celda.textContent()) ?? '').trim();
}

/**
 * Localiza la primera fila que contenga el texto indicado en la columna dada.
 * Siempre incluye .first() para evitar strict mode errors.
 */
export function filaConTexto(
  page: any,
  columnDef: string,
  texto: RegExp | string,
) {
  return page.locator('tr[mat-row]')
    .filter({ has: page.locator(`td.mat-column-${columnDef}`, { hasText: texto }) })
    .first();
}

/**
 * Localiza un botón por el icono de Angular Material que contiene.
 * Más robusto que buscar por clase CSS (mat-primary / mat-accent pueden variar).
 *
 * Ejemplo: btnConIcono(fila, 'visibility') → botón con <mat-icon>visibility</mat-icon>
 */
export function btnConIcono(contenedor: any, icono: string) {
  return contenedor
    .locator('button', {
      has: contenedor.page().locator('mat-icon', { hasText: icono }),
    })
    .first();
}

// ─── Formularios Angular Material ─────────────────────────────────────────────

/** Rellena un campo por formControlName usando fill() (dispara eventos de Angular). */
export async function fillField(
  page: any,
  formControlName: string,
  valor: string,
): Promise<void> {
  const el = page.locator(`[formcontrolname="${formControlName}"]`).first();
  await el.waitFor({ state: 'visible', timeout: 5000 });
  await el.fill(valor);
}

/** Selecciona la primera opción de un mat-select. Espera el panel de forma determinista. */
export async function selectPrimeraOpcion(
  page: any,
  formControlName: string,
): Promise<void> {
  const select = page.locator(`mat-select[formcontrolname="${formControlName}"]`).first();
  await select.waitFor({ state: 'visible', timeout: 5000 });
  await select.click();

  const opcion = page.locator('mat-option, .mat-mdc-option').first();
  await opcion.waitFor({ state: 'visible', timeout: 8000 });
  await opcion.click();

  await page.waitForSelector(
    '.mat-mdc-select-panel, .mat-select-panel',
    { state: 'hidden', timeout: 3000 },
  ).catch(() => {});
}

/**
 * Rellena un campo Angular Material Datepicker.
 *
 * Usa pressSequentially() (teclas reales) en lugar de fill() (evento sintético)
 * porque el Datepicker escucha keydown/keypress para parsear la fecha.
 * Formato: DD/MM/YYYY (locale es-CO de Angular Material).
 */
export async function rellenarFecha(
  page: any,
  formControlName: string,
  fecha: string,
): Promise<void> {
  const input = page.locator(`input[formcontrolname="${formControlName}"]`).first();
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.click({ clickCount: 3 });
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
  await input.pressSequentially(fecha, { delay: 30 });
  await input.press('Tab');
}

// ─── Snackbar ─────────────────────────────────────────────────────────────────

/**
 * Espera un snackbar de Angular Material y retorna su texto.
 * Retorna null si no aparece (no lanza — el snackbar es UI opcional, no indicador de éxito).
 */
export async function leerSnackbar(page: any, timeout = 4000): Promise<string | null> {
  const snack = page.locator('.mat-mdc-snack-bar-container, mat-snack-bar-container').first();
  try {
    await snack.waitFor({ state: 'visible', timeout });
    return ((await snack.textContent()) ?? '').trim();
  } catch {
    return null;
  }
}

// ─── Layout de tarjetas (employee-tasks) ─────────────────────────────────────

/**
 * Espera a que la vista de tareas del empleado resuelva su estado de carga.
 * Retorna: 'tasks' | 'empty' | 'error'
 */
export async function esperarVistasTareas(
  page: any,
  timeout = 15000,
): Promise<'tasks' | 'empty' | 'error'> {
  await page.waitForSelector(
    '.task-item, .empty-content, .error-content, .loading-container',
    { timeout },
  );

  const loading = page.locator('.loading-container, mat-spinner');
  if (await loading.isVisible().catch(() => false)) {
    await loading.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  if (await page.locator('.error-content').isVisible().catch(() => false)) return 'error';
  if (await page.locator('.empty-content').isVisible().catch(() => false))  return 'empty';
  return 'tasks';
}

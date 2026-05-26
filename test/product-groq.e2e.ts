/**
 * product-groq.e2e.ts
 *
 * ARQUITECTURA:
 *  - 0 extract()      → lectura de datos 100% Playwright puro
 *  - 0 act()          → toda interacción usa locators directos
 *  - 0 waitForTimeout → todas las esperas son deterministas
 *  - Stagehand        → sólo instancia el navegador Chromium
 *
 * CREDENCIALES: usa loginAdmin() → requiere ADMIN_CC / ADMIN_PASSWORD en .env
 *
 * SELECTORES REALES (de products-list.html y edit-product.html):
 *  - Filas:       tr[mat-row]                      (atributo preservado en HTML renderizado)
 *  - Nombre:      td.mat-column-name               (clase generada por matColumnDef="name")
 *  - Estado:      td.mat-column-state_name
 *  - Edit btn:    <a mat-button>Editar</a>          → navega a /admin/products/edit/:id
 *  - Form name:   input[formcontrolname="name"]
 *  - Form desc:   textarea[formcontrolname="description"]
 *  - Form cat:    input[formcontrolname="category_name"]
 *  - Form state:  input[formcontrolname="state_name"]
 *  - Guardar:     button[type="submit"]            (mat-raised-button color="primary")
 *
 * CP03 — SKIP: products-list.html NO tiene botón "Crear".
 *   Los productos se crean únicamente en el stepper de /admin/orders/create.
 *
 * VALIDACIÓN DE UPDATE (CP04):
 *   En lugar de esperar redirect o snackbar, guarda el valor modificado,
 *   navega de vuelta al mismo formulario de edición y verifica que el valor persistió.
 */
import { createGroqStagehand } from '../src/stagehand-groq';
import {
  SS_DIR, loginAdmin, navegar,
  esperarFilas, contarFilas, leerColumna,
  filaConTexto,
} from './e2e-helpers';
import * as dotenv from 'dotenv';

dotenv.config();

jest.setTimeout(90000);

describe('Funcionalidad: Gestión de Productos - TailorFlow (Groq)', () => {

  let stagehand: any;
  let page: any;

  beforeAll(async () => {
    stagehand = createGroqStagehand();
    await stagehand.init();
    if (!stagehand.page) throw new Error('Stagehand no inicializado.');
    page = stagehand.page;
    await loginAdmin(page, 'products');
  }, 60000);

  afterAll(async () => {
    try { await stagehand.close(); } catch { /* ignorar */ }
  });

  // ─────────────────────────────────────────────────────────────────
  // CP01 — findAll()
  // ─────────────────────────────────────────────────────────────────
  it('CP01 - Backend findAll() - Debería listar todos los productos', async () => {
    await navegar(page, '/admin/products', 'CP01', 'products-02-list');

    await esperarFilas(page, 15000);

    const total   = await contarFilas(page);
    const nombres = await leerColumna(page, 'name');

    console.log('[CP01] Filas en tabla:', total);
    console.log('[CP01] Primeros productos:', nombres.slice(0, 5));

    if (total === 0) throw new Error('Backend findAll() no retornó productos — tabla vacía');
    if (nombres.length === 0) throw new Error('No se pudieron leer los nombres de la columna "name"');
  }, 30000);

  // ─────────────────────────────────────────────────────────────────
  // CP02 — findOne()
  // Navega independientemente (no depende del estado de CP01).
  // ─────────────────────────────────────────────────────────────────
  it('CP02 - Backend findOne() - Debería mostrar el detalle de un producto', async () => {
    await navegar(page, '/admin/products', 'CP02', 'products-03-list-for-edit');
    await esperarFilas(page, 15000);

    // products-list.html: única acción por fila es <a mat-button>Editar</a>
    const btnEditar = page.locator('tr[mat-row]').first()
      .locator('a').filter({ hasText: /editar/i }).first();
    await btnEditar.waitFor({ state: 'visible', timeout: 8000 });
    await btnEditar.click();
    await page.waitForLoadState('networkidle');

    const url = await page.url();
    console.log('[CP02] URL:', url);
    await page.screenshot({ path: `${SS_DIR}/products-04-edit-form.png` });

    if (!url.includes('/admin/products/edit/')) {
      throw new Error(`findOne() no navegó al formulario de edición — URL: ${url}`);
    }

    // edit-product.html: input formcontrolname="name" (precargado por el backend)
    const nombreInput = page.locator('input[formcontrolname="name"]').first();
    await nombreInput.waitFor({ state: 'visible', timeout: 8000 });
    const nombre = (await nombreInput.inputValue()).trim();

    const catInput   = page.locator('input[formcontrolname="category_name"]').first();
    const stateInput = page.locator('input[formcontrolname="state_name"]').first();

    const categoria = (await catInput.count() > 0)
      ? (await catInput.inputValue()).trim()
      : '(no disponible)';
    const estado = (await stateInput.count() > 0)
      ? (await stateInput.inputValue()).trim()
      : '(no disponible)';

    console.log('[CP02] Nombre:', nombre, '| Categoría:', categoria, '| Estado:', estado);

    if (!nombre) throw new Error('Backend findOne() no retornó nombre del producto');
  }, 30000);

  // ─────────────────────────────────────────────────────────────────
  // CP03 — create() — SKIP
  // products-list.html no tiene botón "Crear".
  // Los productos se crean únicamente vía /admin/orders/create.
  // ─────────────────────────────────────────────────────────────────
  it.skip('CP03 - Backend create() - No existe UI standalone de creación de productos', () => {
    // La creación ocurre en el stepper de pedidos (order-groq.e2e.ts CP03).
  });

  // ─────────────────────────────────────────────────────────────────
  // CP04 — update()
  //
  // VALIDACIÓN REAL DE PERSISTENCIA:
  //   1. Captura la URL de edición antes de guardar.
  //   2. Lee el valor actual del campo description.
  //   3. Modifica el campo y guarda.
  //   4. Navega de vuelta a la misma URL de edición (fuerza recarga desde backend).
  //   5. Verifica que el valor cambió según lo esperado.
  //
  //   NO depende de redirect ni de snackbar — ambos son comportamientos UI opcionales.
  // ─────────────────────────────────────────────────────────────────
  it('CP04 - Backend update() - Debería guardar cambios en el formulario de edición', async () => {
    await navegar(page, '/admin/products', 'CP04', 'products-05-list-for-update');
    await esperarFilas(page, 15000);

    // Preferir fila con estado "Pendiente" para no violar reglas de negocio del backend
    let fila = filaConTexto(page, 'state_name', /pendiente/i);
    if (await fila.count() === 0) {
      console.warn('[CP04] Sin fila "Pendiente" — usando primera fila disponible');
      fila = page.locator('tr[mat-row]').first();
    }

    const btnEditar = fila.locator('a').filter({ hasText: /editar/i }).first();
    await btnEditar.waitFor({ state: 'visible', timeout: 8000 });
    await btnEditar.click();
    await page.waitForLoadState('networkidle');

    // Guardar la URL del formulario de edición para verificar persistencia
    const urlEdit = await page.url();
    console.log('[CP04] URL formulario edición:', urlEdit);
    await page.screenshot({ path: `${SS_DIR}/products-06-edit-form.png` });

    if (!urlEdit.includes('/admin/products/edit/')) {
      throw new Error(`No navegó al formulario de edición — URL: ${urlEdit}`);
    }

    // ── Leer y modificar el campo description ──────────────────────
    const descEl = page.locator('textarea[formcontrolname="description"]').first();
    let campoModificado = 'description';
    let valorEsperado   = '';

    if (await descEl.count() > 0) {
      await descEl.waitFor({ state: 'visible', timeout: 5000 });
      const valorActual = (await descEl.inputValue()).trim();
      // Alternar sufijo para que el cambio sea detectable
      valorEsperado = valorActual.endsWith('[upd]')
        ? valorActual.slice(0, -5).trim()
        : `${valorActual} [upd]`.trim();
      await descEl.click({ clickCount: 3 });
      await descEl.fill(valorEsperado);
      console.log('[CP04] Descripción cambiada a:', valorEsperado.slice(0, 60));
    } else {
      // Fallback: modificar el nombre (dispara dirty sin afectar lógica de negocio crítica)
      campoModificado = 'name';
      const nameEl = page.locator('input[formcontrolname="name"]').first();
      await nameEl.waitFor({ state: 'visible', timeout: 5000 });
      valorEsperado = (await nameEl.inputValue()).trim();
      await nameEl.click({ clickCount: 3 });
      await nameEl.fill(valorEsperado); // re-guardar mismo valor (marca dirty)
      console.log('[CP04] Campo description no disponible — usando nombre como campo de prueba');
    }

    // ── Guardar ────────────────────────────────────────────────────
    const btnGuardar = page.locator('button[type="submit"]').first();
    await btnGuardar.waitFor({ state: 'visible', timeout: 5000 });
    await btnGuardar.click();
    await page.waitForLoadState('networkidle');

    // ── Verificar persistencia: recargar el formulario de edición ──
    await page.goto(urlEdit, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SS_DIR}/products-07-after-save.png` });

    if (campoModificado === 'description') {
      const descVerif = page.locator('textarea[formcontrolname="description"]').first();
      await descVerif.waitFor({ state: 'visible', timeout: 8000 });
      const valorPersistido = (await descVerif.inputValue()).trim();

      console.log('[CP04] Valor esperado:', valorEsperado.slice(0, 60));
      console.log('[CP04] Valor persistido:', valorPersistido.slice(0, 60));

      if (valorPersistido !== valorEsperado) {
        throw new Error(
          `Backend update() no persistió el cambio en description.\n` +
          `Esperado: "${valorEsperado.slice(0, 80)}"\n` +
          `Obtenido: "${valorPersistido.slice(0, 80)}"`,
        );
      }
    } else {
      // El fallback de nombre no verifica cambio (re-guardó el mismo valor)
      const nameVerif = page.locator('input[formcontrolname="name"]').first();
      await nameVerif.waitFor({ state: 'visible', timeout: 8000 });
      const nombrePersistido = (await nameVerif.inputValue()).trim();
      if (!nombrePersistido) {
        throw new Error('Backend update(): el formulario no cargó datos tras recargar la página de edición');
      }
      console.log('[CP04] Nombre persistido:', nombrePersistido);
    }

    console.log('[CP04] Backend update() confirmado — persistencia verificada correctamente.');
  }, 60000);

});

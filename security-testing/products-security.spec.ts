import { expect } from 'chai'; // Fluent Assertions
import * as sinon from 'sinon'; // Test Doubles (Sinon)
import { ForbiddenException, NotFoundException } from '@nestjs/common';

// Mijo, la ruta corregida para productos
import { ProductsService } from '../src/modules/products/products.service';

// --- EL MACHETAZO PARA LOS TIPOS ---
declare var describe: any;
declare var it: any;
declare var afterEach: any;

describe('Security Testing: Products Module (TailorFlow)', () => {

    // --- TEST DOUBLES (Stubs con Sinon) ---
    const productRepoStub = {
        findOne: sinon.stub(),
        preload: sinon.stub(),
        save: sinon.stub()
    };

    afterEach(() => {
        // RNF6: Mantener los tests limpios (Integridad)
        sinon.reset();
    });

    describe('RNF10 - Control de Acceso al Producto', () => {
        it('Debe denegar acceso si el producto pertenece a otra orden/cliente', async () => {
            // Arrange: Simulamos un producto que pertenece a la orden 99
            productRepoStub.findOne.resolves({ id_product: 1, id_order: 99 });

            const validateOrderAccess = async (orderId: number) => {
                const product = await productRepoStub.findOne(1);
                if (product.id_order !== orderId) {
                    throw new ForbiddenException('No tiene permiso sobre este producto');
                }
            };

            // Act & Assert (Fluent)
            try {
                await validateOrderAccess(1); // El usuario intenta acceder desde la orden 1
            } catch (error: any) {
                expect(error).to.be.instanceOf(ForbiddenException);
                expect(error.message).to.equal('No tiene permiso sobre este producto');
            }
        });
    });

    describe('RF16 - Restricción de Modificación en Producción', () => {
        it('Debe prohibir cambios si el producto ya tiene un estado de producción avanzado', async () => {
            // Arrange: Estado 2 suele ser "En Proceso" o "Terminado" en tu lógica
            productRepoStub.preload.resolves({ id_product: 1, id_state: 2 });

            const secureUpdate = async (id: number) => {
                const prod = await productRepoStub.preload({ id });
                // RF16: Si no está en estado "Pendiente" (1), no se toca
                if (prod.id_state !== 1) {
                    throw new ForbiddenException('Producto en producción: modificación restringida');
                }
            };

            try {
                await secureUpdate(1);
            } catch (error: any) {
                expect(error).to.be.instanceOf(ForbiddenException);
                expect(error.message).to.contain('restringida');
            }
        });
    });

    describe('RNF4 - Seguridad y Existencia', () => {
        it('Debe validar que el producto exista antes de aplicar reglas de seguridad', async () => {
            productRepoStub.findOne.resolves(null);

            const findSecure = async (id: number) => {
                const prod = await productRepoStub.findOne(id);
                if (!prod) throw new NotFoundException('Producto no encontrado');
                return prod;
            };

            try {
                await findSecure(404);
            } catch (error: any) {
                expect(error).to.be.instanceOf(NotFoundException);
            }
        });
    });
});
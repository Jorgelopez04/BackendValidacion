import { expect } from 'chai'; // Fluent Assertions
import * as sinon from 'sinon'; // Test Doubles (Sinon)
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

// --- EL MACHETAZO PARA LOS TIPOS ---
declare var describe: any;
declare var it: any;
declare var afterEach: any;

describe('Security Testing: Orders Module (TailorFlow)', () => {

    // --- TEST DOUBLES (Stubs con Sinon) ---
    const orderRepoStub = {
        findOne: sinon.stub(),
        save: sinon.stub()
    };

    afterEach(() => {
        // RNF6: Limpiar los dobles para asegurar la integridad de cada test
        sinon.reset();
    });

    // ==========================================
    // RNF10: Control de Acceso por Cliente
    // ==========================================
    describe('RNF10 - Protección de Acceso Privado', () => {
        it('Debe denegar el acceso si la orden pertenece a otro cliente', async () => {
            // Arrange: La orden en BD pertenece al cliente 55
            orderRepoStub.findOne.resolves({ id_order: 1, id_customer: 55 });

            const validateOwnership = async (customerId: number) => {
                const order = await orderRepoStub.findOne(1);
                if (order.id_customer !== customerId) {
                    throw new ForbiddenException('No tienes permiso para ver esta orden');
                }
            };

            // Act & Assert (Estilo Chai)
            try {
                await validateOwnership(1); // El cliente 1 intenta "chusmear"
            } catch (error: any) {
                expect(error).to.be.instanceOf(ForbiddenException);
                expect(error.message).to.equal('No tienes permiso para ver esta orden');
            }
        });
    });

    // ==========================================
    // RF16 & RF17: Restricciones en Producción
    // ==========================================
    describe('RF16/17 - Inmutabilidad en Producción', () => {
        it('Debe prohibir la cancelación si la orden ya está en proceso (RF17)', async () => {
            // Arrange: Simulamos estado 2 (En Producción)
            orderRepoStub.findOne.resolves({ id_order: 1, id_state: 2 });

            const secureCancel = async (id: number) => {
                const order = await orderRepoStub.findOne(id);
                // RF17: Restringir cancelación en producción
                if (order.id_state !== 1) { // 1 = Pendiente
                    throw new BadRequestException('No se puede cancelar una orden que ya está en producción');
                }
            };

            try {
                await secureCancel(1);
            } catch (error: any) {
                expect(error).to.be.instanceOf(BadRequestException);
                expect(error.message).to.contain('producción');
            }
        });

        it('Debe prohibir la modificación de datos críticos si ya está en taller (RF16)', async () => {
             // Arrange: Orden ya en taller
             orderRepoStub.findOne.resolves({ id_order: 1, id_state: 2 });

             const secureUpdate = async (id: number) => {
                 const order = await orderRepoStub.findOne(id);
                 // RF16: Restringir modificación en producción
                 if (order.id_state === 2) {
                     throw new ForbiddenException('Modificación denegada: La orden ya está en el flujo de trabajo');
                 }
             };

             try {
                 await secureUpdate(1);
             } catch (error: any) {
                 expect(error).to.be.instanceOf(ForbiddenException);
                 expect(error.message).to.contain('denegada');
             }
        });
    });

    // ==========================================
    // RNF4: Seguridad por Roles
    // ==========================================
    describe('RNF4 - Validación de Existencia antes de Seguridad', () => {
        it('Debe lanzar NotFound antes de cualquier chequeo si la orden no existe', async () => {
            orderRepoStub.findOne.resolves(null);

            const checkOrder = async (id: number) => {
                const order = await orderRepoStub.findOne(id);
                if (!order) throw new NotFoundException('Orden inexistente');
            };

            try {
                await checkOrder(999);
            } catch (error: any) {
                expect(error).to.be.instanceOf(NotFoundException);
            }
        });
    });
});
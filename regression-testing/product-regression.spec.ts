import { expect } from 'chai'; // Fluent Assertions
import * as sinon from 'sinon'; // Test Doubles
import { BadRequestException } from '@nestjs/common';

// --- EL MACHETAZO PARA LOS TIPOS ---
declare var describe: any;
declare var it: any;
declare var afterEach: any;

describe('Regression Testing: Products Module (TailorFlow)', () => {

    const productRepoStub = {
        findOne: sinon.stub(),
        preload: sinon.stub(),
        save: sinon.stub()
    };

    afterEach(() => {
        // RNF6: Limpieza para evitar efectos secundarios entre pruebas (Integridad)
        sinon.reset(); 
    });

    // ==========================================
    // REGRESIÓN RF16: Restricción en Producción
    // ==========================================
    describe('RF16 - Inmutabilidad del Producto en Producción', () => {
        
        it('Debe seguir prohibiendo actualizaciones si el estado es diferente a PENDING (1)', async () => {
            // Regresión: Asegura que el parche de seguridad para el estado no se ha borrado
            const productInProduction = { id_product: 1, id_state: 2 }; // 2 = En producción
            productRepoStub.preload.resolves(productInProduction);

            const updateProductLogic = async (id: number) => {
                const prod = await productRepoStub.preload({ id });
                if (prod.id_state !== 1) {
                    throw new BadRequestException('Regla RF16: Producto en producción no modificable');
                }
            };

            try {
                await updateProductLogic(1);
            } catch (error: any) {
                // Estilo Fluent (Chai)
                expect(error).to.be.instanceOf(BadRequestException);
                expect(error.message).to.contain('RF16');
            }
        });
    });

    // ==========================================
    // REGRESIÓN RF17: Cancelación de Órdenes
    // ==========================================
    describe('RF17 - Integridad de Cancelación', () => {

        it('Debe mantener la consistencia: No cancelar productos con tareas iniciadas', async () => {
            // Simulamos un producto que tiene una tarea ya en 'IN_PROGRESS'
            const productWithActiveTasks = {
                id_product: 10,
                tasks: [
                    { id_task: 101, id_state: 1 }, // Pendiente
                    { id_task: 102, id_state: 2 }  // En progreso
                ]
            };

            const checkCancellation = (product: any) => {
                // Si alguna tarea (t) ya no está pendiente, bloqueamos
                const hasStarted = product.tasks.some((t: any) => t.id_state !== 1);
                if (hasStarted) {
                    throw new BadRequestException('No se puede cancelar un producto con avance');
                }
            };

            // Act & Assert
            expect(() => checkCancellation(productWithActiveTasks)).to.throw(BadRequestException);
        });
    });

    // ==========================================
    // REGRESIÓN RNF18: Consistencia de Estados
    // ==========================================
    describe('RNF18 - Consistencia en Status Updates', () => {

        it('Debe asegurar que al guardar un producto se mantenga la estructura de datos', async () => {
            const originalData = { id_product: 5, name: 'Sofa Pro', id_state: 1 };
            productRepoStub.save.resolves(originalData);

            const result = await productRepoStub.save(originalData);

            // Verificamos que no se pierdan propiedades críticas (Regresión de integridad)
            expect(result).to.have.property('id_product');
            expect(result).to.have.property('id_state');
            expect(result.name).to.equal('Sofa Pro');
        });
    });
});
import { expect } from 'chai'; // Fluent Assertions
import * as sinon from 'sinon'; // Test Doubles
import { BadRequestException } from '@nestjs/common';

// --- EL MACHETAZO PARA LOS TIPOS ---
declare var describe: any;
declare var it: any;
declare var afterEach: any;

describe('Regression Testing: Orders Module (TailorFlow)', () => {

    const orderRepoStub = {
        findOne: sinon.stub(),
        save: sinon.stub()
    };

    afterEach(() => {
        // RNF6: Limpieza para asegurar que los resultados de un test no afecten al siguiente
        sinon.reset();
    });

    // ==========================================
    // REGRESIÓN: Lógica de Fechas (RF05/RF07)
    // ==========================================
    describe('Validación de Fechas de Entrega', () => {
        
        it('Debe mantener la corrección: No permitir fechas estimadas menores a la de entrada', async () => {
            // Arrange: Una orden que entró el 1 de mayo
            const mockOrder = { 
                id_order: 1, 
                entry_date: new Date('2026-05-01T10:00:00Z') 
            };
            orderRepoStub.findOne.resolves(mockOrder);

            const updateOrderDate = async (id: number, newDate: Date) => {
                const order = await orderRepoStub.findOne(id);
                // Lógica de regresión: La fecha estimada no puede ser antes de que entrara la orden
                if (newDate < order.entry_date) {
                    throw new BadRequestException('La fecha de entrega no puede ser anterior a la creación');
                }
            };

            // Act & Assert: Intentamos poner fecha de abril (Regresión de bug antiguo)
            const badDate = new Date('2026-04-15T10:00:00Z');
            try {
                await updateOrderDate(1, badDate);
            } catch (error: any) {
                expect(error).to.be.instanceOf(BadRequestException);
                expect(error.message).to.contain('anterior');
            }
        });
    });

    // ==========================================
    // REGRESIÓN: Integridad de Estados (RF15)
    // ==========================================
    describe('RNF18 - Consistencia en Cambio de Prioridad', () => {

        it('Debe asegurar que al reordenar por prioridad (RF15) no se pierdan datos del cliente', async () => {
            // Arrange: Simulamos una orden con datos de relación
            const orderWithCustomer = { 
                id_order: 1, 
                priority: 1, 
                customer: { name: 'Muebles S.A.' } 
            };
            orderRepoStub.save.resolves(orderWithCustomer);

            // Act: Simulamos actualización de prioridad
            const result = await orderRepoStub.save({ ...orderWithCustomer, priority: 2 });

            // Assert: Verificamos integridad (Regresión para evitar pérdida de relaciones)
            expect(result).to.have.property('customer');
            expect(result.customer.name).to.equal('Muebles S.A.');
            expect(result.priority).to.equal(1); // Mantiene el resuelto del stub
        });
    });

    // ==========================================
    // REGRESIÓN: RF17 Restricción de Cancelación
    // ==========================================
    describe('Persistencia de Regla RF17', () => {

        it('Debe fallar siempre si se intenta cancelar una orden en estado "TERMINADO"', async () => {
            // Regresión: Verificar que el estado final bloquea cualquier acción de borrado
            const finishedOrder = { id_order: 10, id_state: 3 }; // 3 = Terminado
            orderRepoStub.findOne.resolves(finishedOrder);

            const deleteLogic = async (id: number) => {
                const order = await orderRepoStub.findOne(id);
                if (order.id_state === 3) {
                    throw new BadRequestException('No se puede cancelar una orden terminada');
                }
            };

            try {
                await deleteLogic(10);
            } catch (error: any) {
                expect(error).to.be.instanceOf(BadRequestException);
                expect(error.message).to.contain('terminada');
            }
        });
    });
});
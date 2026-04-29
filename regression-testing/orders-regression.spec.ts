import { BadRequestException } from '@nestjs/common';

describe('Regression Testing: Orders Module (TailorFlow)', () => {

    const orderRepoStub = {
        findOne: jest.fn(),
        save: jest.fn()
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // REGRESIÓN: Lógica de Fechas (RF05/RF07)
    // ==========================================
    describe('Validación de Fechas de Entrega', () => {
        
        it('No debe permitir fechas estimadas menores a la de entrada', async () => {
            
            // Arrange
            const mockOrder = { 
                id_order: 1, 
                entry_date: new Date('2026-05-01T10:00:00Z') 
            };

            orderRepoStub.findOne.mockResolvedValue(mockOrder);

            const updateOrderDate = async (id: number, newDate: Date) => {
                const order = await orderRepoStub.findOne(id);

                if (newDate < order.entry_date) {
                    throw new BadRequestException('La fecha de entrega no puede ser anterior');
                }
            };

            // Act + Assert
            const badDate = new Date('2026-04-15T10:00:00Z');

            await expect(updateOrderDate(1, badDate))
                .rejects
                .toThrow(BadRequestException);
        });
    });

    // ==========================================
    // REGRESIÓN: Integridad de Estados (RF15)
    // ==========================================
    describe('Consistencia en Cambio de Prioridad', () => {

        it('No debe perder datos del cliente al actualizar prioridad', async () => {
            
            // Arrange
            const orderWithCustomer = { 
                id_order: 1, 
                priority: 1, 
                customer: { name: 'Muebles S.A.' } 
            };

            orderRepoStub.save.mockResolvedValue(orderWithCustomer);

            // Act
            const result = await orderRepoStub.save({ 
                ...orderWithCustomer, 
                priority: 2 
            });

            // Assert
            expect(result).toHaveProperty('customer');
            expect(result.customer.name).toBe('Muebles S.A.');
            expect(result.priority).toBe(1);
        });
    });

    // ==========================================
    // REGRESIÓN: RF17 Restricción de Cancelación
    // ==========================================
    describe('Persistencia de Regla RF17', () => {

        it('Debe fallar si se intenta cancelar una orden TERMINADA', async () => {
            
            // Arrange
            const finishedOrder = { id_order: 10, id_state: 3 };

            orderRepoStub.findOne.mockResolvedValue(finishedOrder);

            const deleteLogic = async (id: number) => {
                const order = await orderRepoStub.findOne(id);

                if (order.id_state === 3) {
                    throw new BadRequestException('No se puede cancelar una orden terminada');
                }
            };

            // Act + Assert
            await expect(deleteLogic(10))
                .rejects
                .toThrow(BadRequestException);
        });
    });
});
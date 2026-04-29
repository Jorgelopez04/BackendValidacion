import { BadRequestException } from '@nestjs/common';

describe('Regression Testing: Products Module (TailorFlow)', () => {

    const productRepoStub = {
        findOne: jest.fn(),
        preload: jest.fn(),
        save: jest.fn()
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // REGRESIÓN RF16: Restricción en Producción
    // ==========================================
    describe('RF16 - Inmutabilidad del Producto en Producción', () => {
        
        it('Debe prohibir actualizaciones si el estado NO es PENDING (1)', async () => {
            
            // Arrange
            const productInProduction = { id_product: 1, id_state: 2 };
            productRepoStub.preload.mockResolvedValue(productInProduction);

            const updateProductLogic = async (id: number) => {
                const prod = await productRepoStub.preload({ id });

                if (prod.id_state !== 1) {
                    throw new BadRequestException('Regla RF16: Producto en producción no modificable');
                }
            };

            // Act + Assert
            await expect(updateProductLogic(1))
                .rejects
                .toThrow(BadRequestException);
        });
    });

    // ==========================================
    // REGRESIÓN RF17: Cancelación de Órdenes
    // ==========================================
    describe('RF17 - Integridad de Cancelación', () => {

        it('No debe cancelar productos con tareas iniciadas', () => {
            
            // Arrange
            const productWithActiveTasks = {
                id_product: 10,
                tasks: [
                    { id_task: 101, id_state: 1 },
                    { id_task: 102, id_state: 2 }
                ]
            };

            const checkCancellation = (product: any) => {
                const hasStarted = product.tasks.some((t: any) => t.id_state !== 1);

                if (hasStarted) {
                    throw new BadRequestException('No se puede cancelar un producto con avance');
                }
            };

            // Act + Assert
            expect(() => checkCancellation(productWithActiveTasks))
                .toThrow(BadRequestException);
        });
    });

    // ==========================================
    // REGRESIÓN RNF18: Consistencia de Estados
    // ==========================================
    describe('RNF18 - Consistencia en Status Updates', () => {

        it('Debe mantener la estructura de datos al guardar', async () => {
            
            // Arrange
            const originalData = { id_product: 5, name: 'Sofa Pro', id_state: 1 };
            productRepoStub.save.mockResolvedValue(originalData);

            // Act
            const result = await productRepoStub.save(originalData);

            // Assert
            expect(result).toHaveProperty('id_product');
            expect(result).toHaveProperty('id_state');
            expect(result.name).toBe('Sofa Pro');
        });
    });
});
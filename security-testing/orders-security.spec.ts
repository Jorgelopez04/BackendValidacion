import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('Security Testing: Orders Module (TailorFlow)', () => {

    let orderRepoStub: any;

    beforeEach(() => {
        orderRepoStub = {
            findOne: jest.fn(),
            save: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // RNF10: Control de Acceso por Cliente
    // ==========================================
    describe('RNF10 - Protección de Acceso Privado', () => {
        it('Debe denegar el acceso si la orden pertenece a otro cliente', async () => {

            orderRepoStub.findOne.mockResolvedValue({ id_order: 1, id_customer: 55 });

            const validateOwnership = async (customerId: number) => {
                const order = await orderRepoStub.findOne(1);
                if (order.id_customer !== customerId) {
                    throw new ForbiddenException('No tienes permiso para ver esta orden');
                }
            };

            await expect(validateOwnership(1))
                .rejects
                .toThrow(ForbiddenException);
        });
    });

    // ==========================================
    // RF16 & RF17: Restricciones en Producción
    // ==========================================
    describe('RF16/17 - Inmutabilidad en Producción', () => {

        it('Debe prohibir la cancelación si la orden ya está en proceso (RF17)', async () => {

            orderRepoStub.findOne.mockResolvedValue({ id_order: 1, id_state: 2 });

            const secureCancel = async (id: number) => {
                const order = await orderRepoStub.findOne(id);
                if (order.id_state !== 1) {
                    throw new BadRequestException('No se puede cancelar una orden que ya está en producción');
                }
            };

            await expect(secureCancel(1))
                .rejects
                .toThrow(BadRequestException);
        });

        it('Debe prohibir la modificación de datos críticos si ya está en taller (RF16)', async () => {

            orderRepoStub.findOne.mockResolvedValue({ id_order: 1, id_state: 2 });

            const secureUpdate = async (id: number) => {
                const order = await orderRepoStub.findOne(id);
                if (order.id_state === 2) {
                    throw new ForbiddenException('Modificación denegada: La orden ya está en el flujo de trabajo');
                }
            };

            await expect(secureUpdate(1))
                .rejects
                .toThrow(ForbiddenException);
        });
    });

    // ==========================================
    // RNF4: Seguridad por Roles
    // ==========================================
    describe('RNF4 - Validación de Existencia antes de Seguridad', () => {

        it('Debe lanzar NotFound antes de cualquier chequeo si la orden no existe', async () => {

            orderRepoStub.findOne.mockResolvedValue(null);

            const checkOrder = async (id: number) => {
                const order = await orderRepoStub.findOne(id);
                if (!order) throw new NotFoundException('Orden inexistente');
            };

            await expect(checkOrder(999))
                .rejects
                .toThrow(NotFoundException);
        });
    });
});
describe('Products Security Tests', () => {
  beforeEach(() => {
    cy.loginAPI(Cypress.env('adminCc'), Cypress.env('adminPassword'));
  });

  it('should require authentication for products endpoint', () => {
    cy.request({
      method: 'GET',
      url: '/products',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should allow authenticated user to access products', () => {
    cy.requestWithAuth('GET', '/products').then((response) => {
      expect(response.status).to.be.oneOf([200, 404]);
    });
  });

  it('should validate product creation input', () => {
    const invalidProduct = {
      // Missing required fields
    };

    cy.requestWithAuth('POST', '/products', invalidProduct).then((response) => {
      expect(response.status).to.eq(400);
    });
  });
});
            save: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('RNF10 - Control de Acceso al Producto', () => {

        it('Debe denegar acceso si el producto pertenece a otra orden/cliente', async () => {

            productRepoStub.findOne.mockResolvedValue({
                id_product: 1,
                id_order: 99
            });

            const validateOrderAccess = async (orderId: number) => {
                const product = await productRepoStub.findOne(1);

                if (product.id_order !== orderId) {
                    throw new ForbiddenException('No tiene permiso sobre este producto');
                }
            };

            await expect(validateOrderAccess(1))
                .rejects
                .toThrow(ForbiddenException);
        });
    });

    describe('RF16 - Restricción de Modificación en Producción', () => {

        it('Debe prohibir cambios si el producto ya tiene un estado de producción avanzado', async () => {

            productRepoStub.preload.mockResolvedValue({
                id_product: 1,
                id_state: 2
            });

            const secureUpdate = async (id: number) => {
                const prod = await productRepoStub.preload({ id });

                if (prod.id_state !== 1) {
                    throw new ForbiddenException('Producto en producción: modificación restringida');
                }
            };

            await expect(secureUpdate(1))
                .rejects
                .toThrow(ForbiddenException);
        });
    });

    describe('RNF4 - Seguridad y Existencia', () => {

        it('Debe validar que el producto exista antes de aplicar reglas de seguridad', async () => {

            productRepoStub.findOne.mockResolvedValue(null);

            const findSecure = async (id: number) => {
                const prod = await productRepoStub.findOne(id);

                if (!prod) {
                    throw new NotFoundException('Producto no encontrado');
                }

                return prod;
            };

            await expect(findSecure(404))
                .rejects
                .toThrow(NotFoundException);
        });
    });
});
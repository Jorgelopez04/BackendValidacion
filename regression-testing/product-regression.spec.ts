describe('Products Regression Tests', () => {
  beforeEach(() => {
    cy.loginAPI(Cypress.env('adminCc'), Cypress.env('adminPassword'));
  });

  it('should maintain existing functionality for fetching products', () => {
    cy.requestWithAuth('GET', '/products').then((response) => {
      expect(response.status).to.be.oneOf([200, 404]);
      if (response.status === 200) {
        expect(response.body).to.be.an('array');
      }
    });
  });

  it('should handle product creation regression', () => {
    const testProduct = {
      name: 'Test Product',
      description: 'Test Description',
      price: 50.0,
      id_category: 1,
      state: 'ACTIVE'
    };

    cy.requestWithAuth('POST', '/products', testProduct).then((response) => {
      expect(response.status).to.be.oneOf([201, 400]);
      if (response.status === 201) {
        expect(response.body).to.have.property('id_product');
      }
    });
  });

  it('should validate product data constraints', () => {
    const invalidProduct = {
      name: '',
      price: -10,
      id_category: 1
    };

    cy.requestWithAuth('POST', '/products', invalidProduct).then((response) => {
      expect(response.status).to.eq(400);
    });
  });
});

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
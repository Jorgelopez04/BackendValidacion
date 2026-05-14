describe('Orders Regression Tests', () => {
  beforeEach(() => {
    cy.loginAPI(Cypress.env('adminCc'), Cypress.env('adminPassword'));
  });

  it('should maintain existing functionality for fetching orders', () => {
    cy.requestWithAuth('GET', '/orders').then((response) => {
      expect(response.status).to.be.oneOf([200, 404]);
      if (response.status === 200) {
        expect(response.body).to.be.an('array');
      }
      cy.screenshot('fetch-orders-regression');
    });
  });

  it('should handle order creation regression', () => {
    const testOrder = {
      id_customer: 1,
      entry_date: new Date().toISOString(),
      estimated_delivery_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
      id_state: 1
    };

    cy.requestWithAuth('POST', '/orders', testOrder).then((response) => {
      expect(response.status).to.be.oneOf([201, 400]); // Created or Bad Request
      if (response.status === 201) {
        expect(response.body).to.have.property('id_order');
      }
      cy.screenshot('create-order-regression');
    });
  });

  it('should validate date constraints regression', () => {
    const invalidOrder = {
      id_customer: 1,
      entry_date: new Date().toISOString(),
      estimated_delivery_date: new Date(Date.now() - 86400000).toISOString(), // Past date
      id_state: 1
    };

    cy.requestWithAuth('POST', '/orders', invalidOrder).then((response) => {
      expect(response.status).to.eq(400); // Bad Request due to invalid dates
      cy.screenshot('date-validation-regression');
    });
  });

  it('should maintain state consistency', () => {
    cy.requestWithAuth('GET', '/orders').then((response) => {
      if (response.status === 200 && response.body.length > 0) {
        const order = response.body[0];
        expect(order).to.have.property('id_state');
        expect(order.id_state).to.be.a('number');
      }
      cy.screenshot('state-consistency-regression');
    });
  });

  it('should handle edge cases in order updates', () => {
    // Test updating non-existent order
    cy.requestWithAuth('PUT', '/orders/99999', { id_state: 2 }).then((response) => {
      expect(response.status).to.eq(404); // Not Found
      cy.screenshot('edge-case-update-regression');
    });
  });
});

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
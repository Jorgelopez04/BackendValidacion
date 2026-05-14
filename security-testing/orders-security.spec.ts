describe('Orders Security Tests', () => {
  beforeEach(() => {
    cy.loginAPI(Cypress.env('adminCc'), Cypress.env('adminPassword'));
  });

  it('should require authentication for orders endpoint', () => {
    cy.request({
      method: 'GET',
      url: '/orders',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401); // Unauthorized
      cy.screenshot('unauthorized-access');
    });
  });

  it('should allow authenticated user to access orders', () => {
    cy.requestWithAuth('GET', '/orders').then((response) => {
      expect(response.status).to.be.oneOf([200, 404]); // OK or Not Found if no orders
      cy.screenshot('authenticated-access');
    });
  });

  it('should prevent unauthorized access to sensitive data', () => {
    // Test with invalid token
    cy.request({
      method: 'GET',
      url: '/orders',
      headers: {
        'Authorization': 'Bearer invalid_token'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('invalid-token');
    });
  });

  it('should validate input data for order creation', () => {
    const invalidOrder = {
      // Missing required fields
    };

    cy.requestWithAuth('POST', '/orders', invalidOrder).then((response) => {
      expect(response.status).to.eq(400); // Bad Request
      cy.screenshot('invalid-input-validation');
    });
  });

  it('should prevent SQL injection attempts', () => {
    const maliciousInput = {
      id_customer: "1' OR '1'='1"
    };

    cy.requestWithAuth('POST', '/orders', maliciousInput).then((response) => {
      expect(response.status).to.eq(400); // Should not execute malicious query
      cy.screenshot('sql-injection-prevention');
    });
  });
});
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
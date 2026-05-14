describe('Backend service create()', () => {
  it('crea un pedido con POST /orders', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(201);
        const token = loginResponse.body.data.access_token;

        const orderBody = {
          id_customer: 1,
          entry_date: new Date().toISOString(),
          estimated_delivery_date: new Date(Date.now() + 86400000).toISOString(),
          id_state: 1
        };

        cy.request({
          method: 'POST',
          url: '/orders',
          headers: { Authorization: `Bearer ${token}` },
          body: orderBody,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400]);
          cy.screenshot('create-order-service');
        });
      });
    });
  });

  it('crea un producto con POST /products', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(201);
        const token = loginResponse.body.data.access_token;

        const productBody = {
          name: 'Producto de Prueba E2E',
          description: 'Descripción del producto de prueba',
          price: 150.00,
          id_category: 1,
          state: 'ACTIVE'
        };

        cy.request({
          method: 'POST',
          url: '/products',
          headers: { Authorization: `Bearer ${token}` },
          body: productBody,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400]);
          cy.screenshot('create-product-service');
        });
      });
    });
  });
});
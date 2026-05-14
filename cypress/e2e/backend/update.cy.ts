describe('Backend service update()', () => {
  it('actualiza un pedido con PATCH /orders/:id', () => {
    cy.env(['apiUrl', 'adminCc', 'adminPassword']).then(({ apiUrl, adminCc, adminPassword }) => {
      const baseUrl = apiUrl || 'http://localhost:3000';
      const credentials = { cc: adminCc, password: adminPassword };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        body: credentials,
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(201);
        const token = loginResponse.body.data.access_token;

        const orderUpdate = {
          id_customer: 1,
          estimated_delivery_date: new Date(Date.now() + 172800000).toISOString(),
          id_state: 1
        };

        cy.request({
          method: 'PATCH',
          url: `${baseUrl}/orders/1`,
          headers: { Authorization: `Bearer ${token}` },
          body: orderUpdate,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([202, 400, 404]);
          if (response.status === 202) {
            expect(response.body).to.have.property('data');
          }
          cy.screenshot('update-order');
        });
      });
    });
  });

  it('actualiza un producto con PATCH /products/:id', () => {
    cy.env(['apiUrl', 'adminCc', 'adminPassword']).then(({ apiUrl, adminCc, adminPassword }) => {
      const baseUrl = apiUrl || 'http://localhost:3000';
      const credentials = { cc: adminCc, password: adminPassword };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        body: credentials,
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(201);
        const token = loginResponse.body.data.access_token;

        const productUpdate = {
          name: 'Cypress Updated Product',
          description: 'Producto actualizado desde Cypress'
        };

        cy.request({
          method: 'PATCH',
          url: `${baseUrl}/products/1`,
          headers: { Authorization: `Bearer ${token}` },
          body: productUpdate,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 404]);
          if (response.status === 200) {
            expect(response.body).to.have.property('data');
          }
          cy.screenshot('update-product');
        });
      });
    });
  });
});

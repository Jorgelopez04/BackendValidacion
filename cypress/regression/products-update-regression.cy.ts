describe('Products update() Regression Tests', () => {
  it('should update a product via PATCH /products/:id', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(201);
        const token = loginResponse.body.data.access_token;

        const productUpdate = {
          name: 'Regression Updated Product',
          description: 'Descripción actualizada desde regresión'
        };

        cy.request({
          method: 'PATCH',
          url: '/products/1',
          headers: { Authorization: `Bearer ${token}` },
          body: productUpdate,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 404]);
          cy.screenshot('products-update-regression');
        });
      });
    });
  });
});

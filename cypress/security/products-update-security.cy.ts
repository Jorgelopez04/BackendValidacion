describe('Products update() Security Tests', () => {
  it('should require authentication to update products', () => {
    cy.request({
      method: 'PATCH',
      url: '/products/1',
      body: { name: 'NoAuth' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('products-update-unauthorized');
    });
  });

  it('should allow authenticated product update', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(201);
        const token = loginResponse.body.data.access_token;

        cy.request({
          method: 'PATCH',
          url: '/products/1',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            name: 'Security Updated Product',
            description: 'Actualizado en prueba de seguridad'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 404]);
          cy.screenshot('products-update-authenticated');
        });
      });
    });
  });

  it('should reject product update with invalid token', () => {
    cy.request({
      method: 'PATCH',
      url: '/products/1',
      headers: { Authorization: 'Bearer invalid_token' },
      body: { name: 'InvalidToken' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('products-update-invalid-token');
    });
  });
});

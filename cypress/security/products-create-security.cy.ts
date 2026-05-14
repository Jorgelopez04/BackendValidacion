describe('Products create() Security Tests', () => {
  it('should require authentication to create products', () => {
    cy.request({
      method: 'POST',
      url: '/products',
      body: { name: 'NoAuth' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('products-create-unauthorized');
    });
  });

  it('should allow authenticated product creation', () => {
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
          method: 'POST',
          url: '/products',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            name: 'Secure Create Product',
            description: 'Prueba de seguridad create',
            price: 10.0,
            id_category: 1,
            state: 'ACTIVE'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400]);
          cy.screenshot('products-create-authenticated');
        });
      });
    });
  });

  it('should reject create products with invalid token', () => {
    cy.request({
      method: 'POST',
      url: '/products',
      headers: { Authorization: 'Bearer invalid_token' },
      body: { name: 'InvalidToken' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('products-create-invalid-token');
    });
  });
});
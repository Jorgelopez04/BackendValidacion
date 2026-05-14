describe('Orders create() Security Tests', () => {
  it('should require authentication to create orders', () => {
    cy.request({
      method: 'POST',
      url: '/orders',
      body: { id_customer: 1 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('orders-create-unauthorized');
    });
  });

  it('should allow authenticated order creation', () => {
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
          url: '/orders',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            id_customer: 1,
            entry_date: new Date().toISOString(),
            estimated_delivery_date: new Date(Date.now() + 86400000).toISOString(),
            id_state: 1
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400]);
          cy.screenshot('orders-create-authenticated');
        });
      });
    });
  });

  it('should reject create orders with invalid token', () => {
    cy.request({
      method: 'POST',
      url: '/orders',
      headers: { Authorization: 'Bearer invalid_token' },
      body: { id_customer: 1 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('orders-create-invalid-token');
    });
  });
});
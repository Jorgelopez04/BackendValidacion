describe('Orders update() Security Tests', () => {
  it('should require authentication to update orders', () => {
    cy.request({
      method: 'PATCH',
      url: '/orders/1',
      body: { id_customer: 1 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('orders-update-unauthorized');
    });
  });

  it('should allow authenticated order update', () => {
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
          url: '/orders/1',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            id_customer: 1,
            estimated_delivery_date: new Date(Date.now() + 172800000).toISOString(),
            id_state: 1
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([202, 400, 404]);
          cy.screenshot('orders-update-authenticated');
        });
      });
    });
  });

  it('should reject order update with invalid token', () => {
    cy.request({
      method: 'PATCH',
      url: '/orders/1',
      headers: { Authorization: 'Bearer invalid_token' },
      body: { id_customer: 1 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('orders-update-invalid-token');
    });
  });
});

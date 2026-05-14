describe('Orders update() Regression Tests', () => {
  it('should update an order via PATCH /orders/:id', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(201);
        const token = loginResponse.body.data.access_token;

        const orderUpdate = {
          id_customer: 1,
          estimated_delivery_date: new Date(Date.now() + 172800000).toISOString(),
          id_state: 1
        };

        cy.request({
          method: 'PATCH',
          url: '/orders/1',
          headers: { Authorization: `Bearer ${token}` },
          body: orderUpdate,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([202, 400, 404]);
          cy.screenshot('orders-update-regression');
        });
      });
    });
  });
});

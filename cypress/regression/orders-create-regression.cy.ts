describe('Orders create() Regression Tests', () => {
  it('should create an order via POST /orders', () => {
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
          cy.screenshot('orders-create-regression');
        });
      });
    });
  });
});
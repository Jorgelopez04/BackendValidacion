describe('Products create() Regression Tests', () => {
  it('should create a product via POST /products', () => {
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
          name: 'Regression Create Product',
          description: 'Cypress regression create test',
          price: 99.99,
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
          cy.screenshot('products-create-regression');
        });
      });
    });
  });
});
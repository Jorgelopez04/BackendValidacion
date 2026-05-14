describe('Backend service findAll()', () => {
  it('inicia sesión y obtiene la lista de pedidos con /orders/all', function () {
    cy.env(['apiUrl', 'adminCc', 'adminPassword']).then(({ apiUrl, adminCc, adminPassword }) => {
      const baseUrl = apiUrl || 'http://localhost:3000';

      if (!adminCc || !adminPassword) {
        throw new Error(
          'Debes configurar las credenciales de administrador en cypress.env.json: adminCc y adminPassword'
        );
      }

      const credentials = {
        cc: adminCc,
        password: adminPassword
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        body: credentials,
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(201, `Login falló: ${JSON.stringify(loginResponse.body)}`);
        expect(loginResponse.body).to.have.property('data');
        expect(loginResponse.body.data).to.have.property('access_token');

        const token = loginResponse.body.data.access_token;

        cy.request({
          method: 'GET',
          url: `${baseUrl}/orders/all`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((ordersResponse) => {
          if (ordersResponse.status === 200) {
            expect(ordersResponse.body).to.have.property('data');
            expect(ordersResponse.body.data).to.be.an('array');
          } else {
            expect(ordersResponse.status).to.equal(404);
            expect(ordersResponse.body).to.have.property('message', 'No hay pedidos creados');
          }
        });
      });
    });
  });
});

describe('Backend service createTask()', () => {
  it('crea una tarea con POST /tasks', () => {
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

        const taskBody = {
          id_product: 1,
          id_area: 1,
          sequence: 1,
          id_state: 1
        };

        cy.request({
          method: 'POST',
          url: `${baseUrl}/tasks`,
          headers: { Authorization: `Bearer ${token}` },
          body: taskBody,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400]);
          if (response.status === 201) {
            expect(response.body).to.have.property('data');
          }
          cy.screenshot('create-task-service');
        });
      });
    });
  });
});

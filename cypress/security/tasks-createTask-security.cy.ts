describe('Tasks createTask() Security Tests', () => {
  it('should require authentication to create tasks', () => {
    cy.request({
      method: 'POST',
      url: '/tasks',
      body: { description: 'NoAuth' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('tasks-createtask-unauthorized');
    });
  });

  it('should allow authenticated task creation', () => {
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
          url: '/tasks',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            id_product: 1,
            id_area: 1,
            sequence: 1,
            id_state: 1
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400]);
          cy.screenshot('tasks-createtask-authenticated');
        });
      });
    });
  });

  it('should reject createTask with invalid token', () => {
    cy.request({
      method: 'POST',
      url: '/tasks',
      headers: { Authorization: 'Bearer invalid_token' },
      body: {
        id_product: 1,
        id_area: 1,
        sequence: 1,
        id_state: 1
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('tasks-createtask-invalid-token');
    });
  });
});

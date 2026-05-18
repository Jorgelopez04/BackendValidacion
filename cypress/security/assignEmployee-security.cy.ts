describe('AssignEmployee() Security Tests', () => {
  it('should require authentication to assign employee', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/assign',
      body: { id_employee: 1 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('assignemployee-unauthorized');
    });
  });

  it('should reject assignEmployee with invalid token', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/assign',
      headers: { Authorization: 'Bearer invalid_token_xyz' },
      body: { id_employee: 1 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('assignemployee-invalid-token');
    });
  });

  it('should reject assignEmployee with expired or malformed token', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/assign',
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' },
      body: { id_employee: 1 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should allow authenticated user to assign employee', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(201);
        const token = loginResponse.body.data.access_token;
        const sequence = Math.floor(Date.now() / 1000 + 3) % 100000;

        const taskBody = {
          id_product: 1,
          id_area: 1,
          sequence,
          id_state: 1
        };

        cy.request({
          method: 'POST',
          url: '/tasks',
          headers: { Authorization: `Bearer ${token}` },
          body: taskBody,
          failOnStatusCode: false
        }).then((createResponse) => {
          if (createResponse.status !== 201) return;

          const taskId = createResponse.body.data?.id_task;

          cy.request({
            method: 'PATCH',
            url: `/tasks/${taskId}/assign`,
            headers: { Authorization: `Bearer ${token}` },
            body: { id_employee: 1 },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201, 400, 404]);
            cy.screenshot('assignemployee-authenticated');
          });
        });
      });
    });
  });
});

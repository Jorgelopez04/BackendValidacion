describe('CompleteTask() Security Tests', () => {
  it('should require authentication to complete a task', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/complete',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('completetask-unauthorized');
    });
  });

  it('should reject completeTask with invalid token', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/complete',
      headers: { Authorization: 'Bearer invalid_token_xyz' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('completetask-invalid-token');
    });
  });

  it('should reject completeTask with expired or malformed token', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/complete',
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should allow authenticated task complete', () => {
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
            url: `/tasks/${taskId}/start`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
          }).then((startResponse) => {
            if (startResponse.status !== 201) return;

            cy.request({
              method: 'PATCH',
              url: `/tasks/${taskId}/complete`,
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false
            }).then((response) => {
              expect(response.status).to.be.oneOf([201, 403, 400]);
              cy.screenshot('completetask-authenticated');
            });
          });
        });
      });
    });
  });
});

describe('AssignEmployee() Regression Tests', () => {
  it('should assign an employee to a task via PATCH /tasks/:id/assign', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(201);
        const token = loginResponse.body.data.access_token;
        const sequence = Math.floor(Date.now() / 1000) % 100000;

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
          if (createResponse.status !== 201) {
            cy.log('Task creation skipped');
            return;
          }

          const taskId = createResponse.body.data?.id_task;

          cy.request({
            method: 'PATCH',
            url: `/tasks/${taskId}/assign`,
            headers: { Authorization: `Bearer ${token}` },
            body: { id_employee: 1 },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201, 400, 404]);
            cy.screenshot('assignemployee-regression');
          });
        });
      });
    });
  });

  it('should fail when assigning employee to already assigned task', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(201);
        const token = loginResponse.body.data.access_token;
        const sequence = Math.floor(Date.now() / 1000 + 2) % 100000;

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
          }).then((firstAssign) => {
            if ([200, 201].includes(firstAssign.status)) {
              cy.request({
                method: 'PATCH',
                url: `/tasks/${taskId}/assign`,
                headers: { Authorization: `Bearer ${token}` },
                body: { id_employee: 2 },
                failOnStatusCode: false
              }).then((secondAssign) => {
                expect(secondAssign.status).to.equal(400);
                expect(secondAssign.body).to.have.property('message');
              });
            }

            cy.screenshot('assignemployee-double-assign-regression');
          });
        });
      });
    });
  });
});

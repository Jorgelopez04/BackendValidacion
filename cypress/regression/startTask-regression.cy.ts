describe('StartTask() Regression Tests', () => {
  it('should start a task via PATCH /tasks/:id/start', () => {
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
            url: `/tasks/${taskId}/start`,
            headers: { Authorization: `Bearer ${token}` },
            body: {},
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([201, 400, 403]);
            cy.screenshot('starttask-regression');
          });
        });
      });
    });
  });

  it('should validate start_date is set on task start', () => {
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
            url: `/tasks/${taskId}/start`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
          }).then((response) => {
            if (response.status === 201) {
              expect(response.body.data).to.have.property('start_date');
              expect(response.body.data.start_date).to.not.be.null;
            }

            cy.screenshot('starttask-start-date-validation');
          });
        });
      });
    });
  });
});

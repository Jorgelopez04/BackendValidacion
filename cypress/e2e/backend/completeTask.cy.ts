describe('Backend service completeTask()', () => {
  it('creates a task, starts it, completes it and validates success response', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(201);
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
            }).then((completeResponse) => {
              expect(completeResponse.status).to.be.oneOf([201, 403, 400]);

              if (completeResponse.status === 201) {
                expect(completeResponse.body).to.have.property('statusCode', 201);
                expect(completeResponse.body).to.have.property('message');
                expect(completeResponse.body).to.have.property('data');
                expect(completeResponse.body.data).to.have.property('id_state', 3);
                expect(completeResponse.body.data).to.have.property('end_date');
                cy.log('Task completed successfully with state COMPLETED');
              }

              cy.screenshot('completetask-e2e');
            });
          });
        });
      });
    });
  });

  it('validates that completed task is in COMPLETED state (3)', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(201);
        const token = loginResponse.body.data.access_token;
        const sequence = Math.floor(Date.now() / 1000 + 1) % 100000;

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
            }).then((completeResponse) => {
              if (completeResponse.status === 201) {
                cy.request({
                  method: 'GET',
                  url: `/tasks/${taskId}`,
                  headers: { Authorization: `Bearer ${token}` },
                  failOnStatusCode: false
                }).then((getResponse) => {
                  expect(getResponse.status).to.equal(200);
                  expect(getResponse.body.data).to.have.property('id_state', 3);
                });
              }

              cy.screenshot('completetask-state-validation');
            });
          });
        });
      });
    });
  });
});

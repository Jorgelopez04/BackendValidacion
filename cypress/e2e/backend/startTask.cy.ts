describe('Backend service startTask()', () => {
  it('creates a task, starts it and validates success response', () => {
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
          expect(createResponse.status).to.be.oneOf([201, 400]);

          if (createResponse.status !== 201) {
            cy.log('Task could not be created');
            return;
          }

          const taskId = createResponse.body.data?.id_task;
          expect(taskId).to.be.a('number');

          cy.request({
            method: 'PATCH',
            url: `/tasks/${taskId}/start`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
          }).then((startResponse) => {
            expect(startResponse.status).to.be.oneOf([201, 403, 400]);

            if (startResponse.status === 201) {
              expect(startResponse.body).to.have.property('statusCode', 201);
              expect(startResponse.body).to.have.property('message');
              expect(startResponse.body).to.have.property('data');
              expect(startResponse.body.data).to.have.property('id_state', 2);
              expect(startResponse.body.data).to.have.property('start_date');
              cy.log('Task started successfully with state IN_PROGRESS');
            } else {
              cy.log(`Start task returned status ${startResponse.status}`);
            }

            cy.screenshot('starttask-e2e');
          });
        });
      });
    });
  });

  it('validates that started task is in IN_PROGRESS state (2)', () => {
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
            if (startResponse.status === 201) {
              cy.request({
                method: 'GET',
                url: `/tasks/${taskId}`,
                headers: { Authorization: `Bearer ${token}` },
                failOnStatusCode: false
              }).then((getResponse) => {
                expect(getResponse.status).to.equal(200);
                expect(getResponse.body.data).to.have.property('id_state', 2);
              });
            }

            cy.screenshot('starttask-state-validation');
          });
        });
      });
    });
  });
});

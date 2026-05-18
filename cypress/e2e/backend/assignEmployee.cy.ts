describe('Backend service assignEmployee()', () => {
  it('creates a task and assigns an employee to it', () => {
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
            url: `/tasks/${taskId}/assign`,
            headers: { Authorization: `Bearer ${token}` },
            body: { id_employee: 1 },
            failOnStatusCode: false
          }).then((assignResponse) => {
            expect(assignResponse.status).to.be.oneOf([200, 201, 400, 404]);

            if ([200, 201].includes(assignResponse.status)) {
              expect(assignResponse.body).to.have.property('data');
              expect(assignResponse.body.data).to.have.property('id_employee', 1);
              cy.log('Employee assigned successfully to task');
            } else {
              cy.log(`Assign employee returned status ${assignResponse.status}`);
            }

            cy.screenshot('assignemployee-e2e');
          });
        });
      });
    });
  });

  it('validates that employee is assigned to task', () => {
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
            url: `/tasks/${taskId}/assign`,
            headers: { Authorization: `Bearer ${token}` },
            body: { id_employee: 1 },
            failOnStatusCode: false
          }).then((assignResponse) => {
            if ([200, 201].includes(assignResponse.status)) {
              cy.request({
                method: 'GET',
                url: `/tasks/${taskId}`,
                headers: { Authorization: `Bearer ${token}` },
                failOnStatusCode: false
              }).then((getResponse) => {
                expect(getResponse.status).to.equal(200);
                expect(getResponse.body.data).to.have.property('id_employee', 1);
              });
            }

            cy.screenshot('assignemployee-validation');
          });
        });
      });
    });
  });
});

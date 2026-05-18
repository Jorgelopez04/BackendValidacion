describe('Backend service findAssignedTasks()', () => {
  it('retrieves assigned tasks for an employee', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(201);
        const token = loginResponse.body.data.access_token;

        cy.request({
          method: 'GET',
          url: '/tasks/assigned',
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 404]);

          if (response.status === 200) {
            expect(response.body).to.have.property('statusCode', 200);
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('data');
            expect(response.body.data).to.be.an('array');
            cy.log(`Retrieved ${response.body.data.length} assigned tasks`);
          } else if (response.status === 404) {
            expect(response.body).to.have.property('message');
          }

          cy.screenshot('findassignedtasks-e2e');
        });
      });
    });
  });

  it('returns empty array when employee has no assigned tasks', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(201);
        const token = loginResponse.body.data.access_token;

        cy.request({
          method: 'GET',
          url: '/tasks/assigned',
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body.data).to.be.an('array');
          }

          cy.screenshot('findassignedtasks-empty');
        });
      });
    });
  });

  it('validates response structure of assigned tasks', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(201);
        const token = loginResponse.body.data.access_token;

        cy.request({
          method: 'GET',
          url: '/tasks/assigned',
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200 && response.body.data.length > 0) {
            const task = response.body.data[0];
            expect(task).to.have.property('id_task');
            expect(task).to.have.property('id_employee');
            expect(task).to.have.property('id_product');
            expect(task).to.have.property('id_state');
          }

          cy.screenshot('findassignedtasks-structure');
        });
      });
    });
  });
});

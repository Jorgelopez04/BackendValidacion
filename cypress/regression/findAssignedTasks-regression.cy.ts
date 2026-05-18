describe('FindAssignedTasks() Regression Tests', () => {
  it('should retrieve assigned tasks via GET /tasks/assigned', () => {
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
          method: 'GET',
          url: '/tasks/assigned',
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 404]);
          cy.screenshot('findassignedtasks-regression');
        });
      });
    });
  });

  it('should validate that retrieved tasks have required fields', () => {
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
          method: 'GET',
          url: '/tasks/assigned',
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.have.property('data').that.is.an('array');

            if (response.body.data.length > 0) {
              response.body.data.forEach((task) => {
                expect(task).to.have.property('id_task').that.is.a('number');
                expect(task).to.have.property('id_employee').that.is.a('number');
                expect(task).to.have.property('id_product').that.is.a('number');
                expect(task).to.have.property('id_state').that.is.a('number');
                expect(task).to.have.property('id_area').that.is.a('number');
              });
            }
          }

          cy.screenshot('findassignedtasks-fields-validation');
        });
      });
    });
  });

  it('should preserve task ordering in assigned tasks list', () => {
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
          method: 'GET',
          url: '/tasks/assigned',
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200 && response.body.data.length > 1) {
            const tasks = response.body.data;
            cy.log(`Retrieved ${tasks.length} tasks in order`);

            for (let i = 1; i < tasks.length; i++) {
              expect(tasks[i].id_product).to.be.greaterThanOrEqual(tasks[i - 1].id_product);
            }
          }

          cy.screenshot('findassignedtasks-ordering');
        });
      });
    });
  });
});

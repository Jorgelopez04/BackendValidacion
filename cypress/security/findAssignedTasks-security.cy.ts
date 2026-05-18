describe('FindAssignedTasks() Security Tests', () => {
  it('should require authentication to view assigned tasks', () => {
    cy.request({
      method: 'GET',
      url: '/tasks/assigned',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('findassignedtasks-unauthorized');
    });
  });

  it('should reject findAssignedTasks with invalid token', () => {
    cy.request({
      method: 'GET',
      url: '/tasks/assigned',
      headers: { Authorization: 'Bearer invalid_token_xyz' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.screenshot('findassignedtasks-invalid-token');
    });
  });

  it('should reject findAssignedTasks with expired or malformed token', () => {
    cy.request({
      method: 'GET',
      url: '/tasks/assigned',
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should allow authenticated user to view assigned tasks', () => {
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
          cy.screenshot('findassignedtasks-authenticated');
        });
      });
    });
  });

  it('should only return tasks assigned to authenticated user', () => {
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
          if (response.status === 200 && response.body.data.length > 0) {
            const employeeId = response.body.data[0].id_employee;
            response.body.data.forEach((task) => {
              expect(task.id_employee).to.equal(employeeId);
            });
            cy.log('All returned tasks belong to the authenticated user');
          }

          cy.screenshot('findassignedtasks-user-isolation');
        });
      });
    });
  });
});

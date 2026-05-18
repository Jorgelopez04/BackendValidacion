describe('Accessibility Tests for Backend findAssignedTasks()', () => {
  it('should include CORS headers for GET /tasks/assigned', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/tasks/assigned',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET'
      }
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204]);
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers).to.have.property('access-control-allow-methods');
    });
  });

  it('should return 401 for unauthorized findAssignedTasks request', () => {
    cy.request({
      method: 'GET',
      url: '/tasks/assigned',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should handle findAssignedTasks request with missing Authorization header', () => {
    cy.request({
      method: 'GET',
      url: '/tasks/assigned',
      headers: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should allow GET request with proper authentication', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        if (loginResponse.status === 201) {
          const token = loginResponse.body.data.access_token;

          cy.request({
            method: 'GET',
            url: '/tasks/assigned',
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 404]);
          });
        }
      });
    });
  });
});

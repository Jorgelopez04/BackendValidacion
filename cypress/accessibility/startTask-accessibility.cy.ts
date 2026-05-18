describe('Accessibility Tests for Backend startTask()', () => {
  it('should include CORS headers for PATCH /tasks/:id/start', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/tasks/1/start',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'PATCH'
      }
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204]);
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers).to.have.property('access-control-allow-methods');
    });
  });

  it('should return 401 for unauthorized startTask request', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/start',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should handle startTask request with missing Authorization header', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/start',
      headers: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});

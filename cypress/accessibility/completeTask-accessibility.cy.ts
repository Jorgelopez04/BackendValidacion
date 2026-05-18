describe('Accessibility Tests for Backend completeTask()', () => {
  it('should include CORS headers for PATCH /tasks/:id/complete', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/tasks/1/complete',
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

  it('should return 401 for unauthorized completeTask request', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/complete',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should handle completeTask request with missing Authorization header', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/complete',
      headers: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});

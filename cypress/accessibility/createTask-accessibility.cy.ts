describe('Accessibility Tests for Backend createTask()', () => {
  it('should include CORS headers on create task request', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/tasks',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'POST'
      }
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204]);
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers).to.have.property('access-control-allow-methods');
    });
  });

  it('should return 401 for unauthorized create task request', () => {
    cy.request({
      method: 'POST',
      url: '/tasks',
      body: { description: 'NoAuth' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });
});

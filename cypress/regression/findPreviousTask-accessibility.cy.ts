describe('Accessibility Tests for Backend findPreviousTask()', () => {
  it('should include CORS headers for OPTIONS /tasks/1/previous', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/tasks/1/previous',
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

  it('should return 401 for unauthorized findPreviousTask request', () => {
    cy.request({
      method: 'GET',
      url: '/tasks/1/previous',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should handle missing Authorization header for findPreviousTask request', () => {
    cy.request({
      method: 'GET',
      url: '/tasks/1/previous',
      headers: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
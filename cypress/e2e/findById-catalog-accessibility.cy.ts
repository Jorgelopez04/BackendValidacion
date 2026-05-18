describe('Accessibility Tests for Backend findById() catalog listing', () => {
  it('should include CORS headers for OPTIONS /catalog/1', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/catalog/1',
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

  it('should return 401 for unauthorized findById catalog request', () => {
    cy.request({
      method: 'GET',
      url: '/catalog/1',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should handle missing Authorization header for findById catalog request', () => {
    cy.request({
      method: 'GET',
      url: '/catalog/1',
      headers: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
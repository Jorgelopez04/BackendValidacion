describe('Accessibility Tests for Backend findAll() catalog listing', () => {
  it('should include CORS headers for OPTIONS /catalog', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/catalog',
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

  it('should return 401 for unauthorized findAll catalog request', () => {
    cy.request({
      method: 'GET',
      url: '/catalog',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should handle missing Authorization header for findAll catalog request', () => {
    cy.request({
      method: 'GET',
      url: '/catalog',
      headers: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
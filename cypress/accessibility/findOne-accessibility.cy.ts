describe('Accessibility Tests for Backend findOne()', () => {
  it('should include CORS headers on findOne request', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/orders/1',
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

  it('should handle unauthorized findOne access gracefully', () => {
    cy.request({
      method: 'GET',
      url: '/orders/1',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });
});
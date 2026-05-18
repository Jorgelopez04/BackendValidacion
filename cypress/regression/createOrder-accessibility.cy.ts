describe('Accessibility Tests for Backend createOrder()', () => {
  it('should include CORS headers for OPTIONS /orders', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/orders',
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

  it('should return 401 for unauthorized createOrder request', () => {
    cy.request({
      method: 'POST',
      url: '/orders',
      body: { product_id: 1, quantity: 2 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should handle missing Authorization header for createOrder request', () => {
    cy.request({
      method: 'POST',
      url: '/orders',
      headers: {},
      body: { product_id: 1, quantity: 2 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
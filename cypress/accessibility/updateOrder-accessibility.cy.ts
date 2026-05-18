describe('Accessibility Tests for Backend updateOrder()', () => {
  it('should include CORS headers for OPTIONS /orders/1', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/orders/1',
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

  it('should return 401 for unauthorized updateOrder request', () => {
    cy.request({
      method: 'PATCH',
      url: '/orders/1',
      body: { product_id: 1, quantity: 3 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should handle missing Authorization header for updateOrder request', () => {
    cy.request({
      method: 'PATCH',
      url: '/orders/1',
      headers: {},
      body: { product_id: 1, quantity: 3 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
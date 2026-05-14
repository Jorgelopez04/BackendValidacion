describe('Accessibility Tests for Backend update()', () => {
  it('should include CORS headers on update order request', () => {
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

  it('should return 401 for unauthorized update order request', () => {
    cy.request({
      method: 'PATCH',
      url: '/orders/1',
      body: { id_customer: 1 },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should include CORS headers on update product request', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/products/1',
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

  it('should return 401 for unauthorized update product request', () => {
    cy.request({
      method: 'PATCH',
      url: '/products/1',
      body: { name: 'NoAuth' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });
});

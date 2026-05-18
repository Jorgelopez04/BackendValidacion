describe('Tasks cascade security tests', () => {
  it('should return 401 when starting a task without authentication', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/start',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should return 401 when completing a task without authentication', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/complete',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message');
    });
  });

  it('should return 401 for invalid token on task cascade endpoints', () => {
    cy.request({
      method: 'PATCH',
      url: '/tasks/1/start',
      headers: { Authorization: 'Bearer invalid-token' },
      failOnStatusCode: false
    }).then((startResponse) => {
      expect(startResponse.status).to.eq(401);
    });

    cy.request({
      method: 'PATCH',
      url: '/tasks/1/complete',
      headers: { Authorization: 'Bearer invalid-token' },
      failOnStatusCode: false
    }).then((completeResponse) => {
      expect(completeResponse.status).to.eq(401);
    });
  });
});

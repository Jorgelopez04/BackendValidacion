describe('Backend findOne() API Tests', () => {
  let token = '';

  beforeEach(() => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: {
          cc: adminCc,
          password: adminPassword
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        token = response.body.data.access_token;
      });
    });
  });

  it('should find one order by ID', () => {
    cy.request({
      method: 'GET',
      url: '/orders/1',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404]);
      if (response.status === 200) {
        expect(response.body.data).to.have.property('id_order');
        expect(response.body.data.id_order).to.eq(1);
      }
      cy.screenshot('findone-order');
    });
  });

  it('should find one product by ID', () => {
    cy.request({
      method: 'GET',
      url: '/products/1',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404]);
      if (response.status === 200) {
        expect(response.body.data).to.have.property('id_product');
        expect(response.body.data.id_product).to.eq(1);
      }
      cy.screenshot('findone-product');
    });
  });

  it('should find one task by ID', () => {
    cy.request({
      method: 'GET',
      url: '/tasks/1',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404]);
      if (response.status === 200) {
        expect(response.body.data).to.have.property('id_task');
        expect(response.body.data.id_task).to.eq(1);
      }
      cy.screenshot('findone-task');
    });
  });

  it('should return 404 for non-existent order', () => {
    cy.request({
      method: 'GET',
      url: '/orders/99999',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      cy.screenshot('findone-order-not-found');
    });
  });

  it('should return 404 for non-existent product', () => {
    cy.request({
      method: 'GET',
      url: '/products/99999',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      cy.screenshot('findone-product-not-found');
    });
  });

  it('should return 404 for non-existent task', () => {
    cy.request({
      method: 'GET',
      url: '/tasks/99999',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      cy.screenshot('findone-task-not-found');
    });
  });
});
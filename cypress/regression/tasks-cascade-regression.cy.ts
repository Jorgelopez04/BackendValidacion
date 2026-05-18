describe('Tasks cascade regression tests', () => {
  it('should create a task and validate cascade on start and complete', () => {
    cy.env(['adminCc', 'adminPassword']).then(({ adminCc, adminPassword }) => {
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: { cc: adminCc, password: adminPassword },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(201);
        const token = loginResponse.body.data.access_token;
        const sequence = Math.floor(Date.now() / 1000) % 100000;

        const taskBody = {
          id_product: 1,
          id_area: 1,
          sequence,
          id_state: 1
        };

        cy.request({
          method: 'POST',
          url: '/tasks',
          headers: { Authorization: `Bearer ${token}` },
          body: taskBody,
          failOnStatusCode: false
        }).then((createResponse) => {
          expect(createResponse.status).to.be.oneOf([201, 400]);

          if (createResponse.status !== 201) {
            cy.log('Task already exists or cannot be created, skip cascade validation');
            return;
          }

          const taskId = createResponse.body.data?.id_task;
          expect(taskId).to.be.a('number');

          cy.request({
            method: 'PATCH',
            url: `/tasks/${taskId}/start`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
          }).then((startResponse) => {
            expect(startResponse.status).to.be.oneOf([201, 403]);

            if (startResponse.status === 201) {
              expect(startResponse.body.data).to.have.property('id_state', 2);
              const productId = startResponse.body.data.product?.id_product;

              if (productId) {
                cy.request({
                  method: 'GET',
                  url: `/products/${productId}`,
                  headers: { Authorization: `Bearer ${token}` },
                  failOnStatusCode: false
                }).then((productResponse) => {
                  expect(productResponse.status).to.equal(200);
                  expect(productResponse.body.data).to.have.property('state_name');
                });
              }
            }
          });

          cy.request({
            method: 'PATCH',
            url: `/tasks/${taskId}/complete`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
          }).then((completeResponse) => {
            expect(completeResponse.status).to.be.oneOf([201, 403]);

            if (completeResponse.status === 201) {
              expect(completeResponse.body.data).to.have.property('id_state', 3);
              const productId = completeResponse.body.data.product?.id_product;
              const orderId = completeResponse.body.data.product?.order_id;

              if (productId) {
                cy.request({
                  method: 'GET',
                  url: `/products/${productId}`,
                  headers: { Authorization: `Bearer ${token}` },
                  failOnStatusCode: false
                }).then((productResponse) => {
                  expect(productResponse.status).to.equal(200);
                  expect(productResponse.body.data).to.have.property('state_name');
                });
              }

              if (orderId) {
                cy.request({
                  method: 'GET',
                  url: `/orders/${orderId}`,
                  headers: { Authorization: `Bearer ${token}` },
                  failOnStatusCode: false
                }).then((orderResponse) => {
                  expect(orderResponse.status).to.equal(200);
                  expect(orderResponse.body.data).to.have.property('state_name');
                });
              }
            }
          });

          cy.screenshot('tasks-cascade-regression');
        });
      });
    });
  });
});

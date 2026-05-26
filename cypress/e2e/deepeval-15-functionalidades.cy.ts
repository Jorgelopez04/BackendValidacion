describe('DeepEval — 15 funcionalidades', () => {
  const cases = [
    { name: 'GET /health', path: '/health', expectStatus: 200, pattern: '^OK' },
    { name: 'GET /orders', path: '/orders', expectStatus: 200 },
    { name: 'POST /orders', path: '/orders', method: 'POST', body: { /* minimal body */ }, expectStatus: 201 },
    { name: 'PUT /orders/:id', path: '/orders/1', method: 'PUT', body: {}, expectStatus: 200 },
    { name: 'GET /products', path: '/products', expectStatus: 200 },
    { name: 'POST /products', path: '/products', method: 'POST', body: {}, expectStatus: 201 },
    { name: 'PUT /products/:id', path: '/products/1', method: 'PUT', body: {}, expectStatus: 200 },
    { name: 'GET /tasks', path: '/tasks', expectStatus: 200 },
    { name: 'POST /tasks', path: '/tasks', method: 'POST', body: {}, expectStatus: 201 },
    { name: 'PUT /tasks/:id', path: '/tasks/1', method: 'PUT', body: {}, expectStatus: 200 },
    { name: 'POST /tasks/:id/start', path: '/tasks/1/start', method: 'POST', expectStatus: 200 },
    { name: 'POST /tasks/:id/assign', path: '/tasks/1/assign', method: 'POST', body: { assignee: 'user' }, expectStatus: 200 },
    { name: 'GET /catalog', path: '/catalog', expectStatus: 200 },
    { name: 'GET /catalog/:id', path: '/catalog/1', expectStatus: 200 },
    { name: 'GET /tasks/previous', path: '/tasks/previous', expectStatus: 200 }
  ];

  cases.forEach((c) => {
    it(c.name, () => {
      const method = (c.method || 'GET') as any;
      const options: any = { method, url: c.path, failOnStatusCode: false };
      if (c.body) options.body = c.body;

      cy.request(options).then((resp) => {
        expect(resp.status).to.equal(c.expectStatus);

        // Build payload for DeepEval: input is endpoint, actual is status or body
        const payload: any = {
          input: `${method} ${c.path}`,
          actual: resp.status,
          pattern: c.pattern ? c.pattern : `^${c.expectStatus}$`,
          context: JSON.stringify({ status: resp.status, headers: resp.headers }),
          model: 'gemini'
        };

        cy.task('deepEval', payload).then((result: any) => {
          // Fail the test if DeepEval reports failure
          if (!result || result.success !== true) {
            throw new Error('DeepEval failed: ' + JSON.stringify(result));
          }
        });
      });
    });
  });
});

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom command for API login
Cypress.Commands.add('loginAPI', (cc, password) => {
  cy.request({
    method: 'POST',
    url: '/auth/login',
    body: {
      cc: cc,
      password: password
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
    // Store token if needed
    Cypress.env('token', response.body.token);
  });
});

// Custom command to get auth token
Cypress.Commands.add('getToken', () => {
  return Cypress.env('token');
});

// Custom command for authenticated requests
Cypress.Commands.add('requestWithAuth', (method, url, body = {}) => {
  cy.getToken().then((token) => {
    cy.request({
      method: method,
      url: url,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: body
    });
  });
});
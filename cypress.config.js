const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: [
      'cypress/e2e/**/*.cy.ts',
      'cypress/accessibility/**/*.cy.ts',
      'cypress/regression/**/*.cy.ts',
      'cypress/security/**/*.cy.ts'
    ],
  },

  component: {
    devServer: {
      framework: 'angular', 
      bundler: 'webpack',   
    },
    specPattern: '**/*.cy.ts',
  },
});
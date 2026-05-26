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
    setupNodeEvents(on, config) {
      const fs = require('fs');
      const path = require('path');
      const child_process = require('child_process');

      on('task', {
        deepEval(payload) {
          try {
            const tmp = path.join(__dirname, 'tmp_deepeval_payload.json');
            fs.writeFileSync(tmp, JSON.stringify(payload), { encoding: 'utf8' });
            const py = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
            const script = path.join(__dirname, 'cypress', 'deepeval_task.py');
            const res = child_process.spawnSync(py, [script, tmp], { encoding: 'utf8' });
            const out = (res.stdout || '') + (res.stderr || '');
            try {
              return JSON.parse((res.stdout || '').trim());
            } catch (e) {
              return { success: false, error: out };
            }
          } catch (err) {
            return { success: false, error: String(err) };
          }
        }
      });

      return config;
    }
  },

  component: {
    devServer: {
      framework: 'angular', 
      bundler: 'webpack',   
    },
    specPattern: '**/*.cy.ts',
  },
});
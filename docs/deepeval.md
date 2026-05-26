# DeepEval integration

This document explains how to run DeepEval checks within the Cypress E2E suite using a local Python wrapper.

Prerequisites

- Python virtualenv in `.venv` with `deepeval` installed (tested with `deepeval==4.0.3`).
- Node and Cypress installed (`npm install` has been run).
- Backend running at `http://localhost:3000` (Cypress `baseUrl`).

Files added

- `cypress/deepeval_task.py` — Python wrapper that builds an `LLMTestCase` and calls `deepeval.assert_test`. It accepts a JSON file path or a JSON string.
- `cypress/e2e/deepeval-15-functionalidades.cy.ts` — Cypress test suite with 15 functional endpoint checks. Each test calls the `deepEval` task.
- `cypress.config.js` — updated to add a `deepEval` Node task which writes payload to a temp JSON file and invokes the Python wrapper using `.venv/Scripts/python.exe`.

How it works

1. A test performs an HTTP request to the API.
2. The test builds a payload `{ input, actual, pattern, context, model }` describing the expectation.
3. The test calls `cy.task('deepEval', payload)`.
4. The Node task writes a temp JSON file and runs `python cypress/deepeval_task.py tmp.json`.
5. The Python wrapper calls `deepeval.assert_test(...)` and returns JSON `{ success: true }` on pass.

Run locally

Start the backend (example):

```bash
npm run start:dev
```

Activate Python venv and ensure `deepeval` is installed:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install deepeval
```

Run Cypress spec:

```bash
npx cypress run --spec "cypress/e2e/deepeval-15-functionalidades.cy.ts"
```

Notes

- The wrapper defaults to `model: gemini` but you can override by passing `model` in the payload.
- For CI, ensure `.venv` is present or adjust `cypress.config.js` to point to the system Python.

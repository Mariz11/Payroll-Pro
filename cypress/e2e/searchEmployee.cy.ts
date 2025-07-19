import { time } from 'console';
require('dotenv').config();

describe('bulk download generate reports', () => {
  Cypress.session.clearAllSavedSessions();

  const login = () => {
    cy.visit('http://localhost:3000');
    cy.get('input[id="username"]').type(Cypress.env('username'));
    cy.get('input[id="password"]').type(Cypress.env('password'));
    cy.wait(500); // wait for login button to be clickable
    cy.get('button[type="submit"]').click();

    cy.get('a[data-testid="ps-menu-button-test-id"]', {
      timeout: 30000,
    }).should('be.visible');
    cy.url().should('include', '/dashboard');
  };

  beforeEach(() => {
    cy.session('loginSession', login);
  });

  // TEST CASES
  it('payroll search Employee', () => {
    cy.visit('http://localhost:3000/page/payroll');

    cy.intercept(
      'GET',
      '/api/payrolls?status=PENDING&limit=5&offset=0&search=&departmentId=&businessMonth='
    ).as('getPendings');
    cy.intercept(
      'GET',
      '/api/payrolls?status=FAILED&limit=5&offset=0&search=&departmentName=&businessMonth='
    ).as('getFailed');
    cy.intercept(
      'GET',
      '/api/payrolls/total?status=PENDING&search=&departmentId=&businessMonth='
    ).as('getTotal');

    cy.get('input[class="p-inputtext p-component"]').type('Abrigos');
    cy.wait(1000);

    cy.get('tr[class="p-selectable-row"]')
      .find('span[class="p-button-icon p-c pi pi-eye"]')
      .click();

    cy.get('input[class="p-inputtext p-component"]').type('Abrigos');

    cy.wait(5000);
  });

  it('attendance search employee', () => {
    cy.visit('http://localhost:3000/page/attendance');

    cy.intercept(
      'GET',
      '/api/attendances?status=POSTED&limit=5&offset=0&search=Abrigos'
    ).as('getAbrogos');

    cy.get('input[class="p-inputtext p-component"]', { timeout: 30000 }).should(
      'be.visible'
    );
    cy.get('input[class="p-inputtext p-component"]').type('Abrigos');
    cy.wait('@getAbrogos');
    cy.wait(1000);

    cy.get('tr[class="p-selectable-row"]')
      .find('div[data-testid="11776"]')
      .find(
        'button[class="p-button p-component p-button-icon-only p-button-text"]'
      )
      .find('span[class="p-button-icon p-c pi pi-eye"]')
      .click();

    cy.get('input[class="p-inputtext p-component"]').type('Abrigos');

    cy.wait(5000);
  });

  it('disable search employee', () => {
    cy.visit('http://localhost:3000/page/configurations');

    cy.get('div[data-testid="enableSearchEmployee"]', {
      timeout: 30000,
    }).should('be.visible');
    cy.get('div[data-testid="enableSearchEmployee"]', { timeout: 30000 })
      .find('div[class="p-inputswitch p-component p-inputswitch-checked"]')
      .click();
    cy.wait(1000);
    cy.get(
      'button[class="p-button p-component rounded-full w-[200px] px-10 p-button"]'
    ).click();
    cy.wait(5000);

    cy.visit('http://localhost:3000/page/attendance');

    cy.intercept(
      'GET',
      '/api/attendances?status=POSTED&limit=5&offset=0&search=Abrigos'
    ).as('getAbrogos');

    cy.get('input[class="p-inputtext p-component"]', { timeout: 30000 }).should(
      'be.visible'
    );
    cy.get('input[class="p-inputtext p-component"]').type('Abrigos');
    cy.wait('@getAbrogos');
    cy.wait(1000);

    cy.get('tr[class="p-selectable-row"]')
      .find('div[data-testid="11776"]')
      .find(
        'button[class="p-button p-component p-button-icon-only p-button-text"]'
      )
      .find('span[class="p-button-icon p-c pi pi-eye"]')
      .click();

    cy.get('input[class="p-inputtext p-component"]').type('Abrigos');
  });
});

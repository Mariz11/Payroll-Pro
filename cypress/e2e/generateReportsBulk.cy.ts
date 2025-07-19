import { time } from 'console';
require('dotenv').config();

describe('bulk download generate reports', () => {
  Cypress.session.clearAllSavedSessions();

  // const login = () => {
  //   cy.visit('http://localhost:3000');
  //   cy.wait(5000); // wait for captcha
  //   cy.get('input[id="username"]').type(Cypress.env('username'));
  //   cy.get('input[id="password"]').type(Cypress.env('password'));
  //   cy.wait(1000); // wait for login button to be clickable
  //   cy.get('button[type="submit"]').click();

  //   cy.get('a[data-testid="ps-menu-button-test-id"]', {
  //     timeout: 30000,
  //   }).should('be.visible');
  //   cy.url().should('include', '/dashboard');
  // };

  // beforeEach(() => {
  //   cy.session('loginSession', login);
  //   cy.visit('http://localhost:3000/page/dashboard');

  //   cy.intercept('GET', '/api/adminDashboard/employees').as(
  //     'getDashboardEmployees'
  //   );
  //   cy.intercept('GET', '/api/adminDashboard/lineChartQuery').as(
  //     'getDashboardChart'
  //   );
  //   cy.intercept('GET', '/api/dashboard/companyLists').as(
  //     'getDashboardCompanyLists'
  //   );
  //   cy.wait(
  //     [
  //       '@getDashboardEmployees',
  //       '@getDashboardChart',
  //       '@getDashboardCompanyLists',
  //     ],
  //     { timeout: 30000 }
  //   );

  //   // click payroll
  //   cy.get('a[data-testid="ps-menu-button-test-id"]')
  //     .contains('Payroll')
  //     .click();
  //   cy.get('a[data-testid="ps-menu-button-test-id"]')
  //     .contains('Payrolls')
  //     .click();

  //   // wait for /payroll
  //   cy.get('h1', { timeout: 30000 })
  //     .contains('Payroll', { timeout: 30000 })
  //     .should('be.visible');
  //   cy.url().should('include', '/payroll');
  // });

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

    // // click payroll
    // cy.get('a[data-testid="ps-menu-button-test-id"]')
    //   .contains('Payroll')
    //   .click();
    // cy.get('a[data-testid="ps-menu-button-test-id"]')
    //   .contains('Payrolls')
    //   .click();

    // wait for /payroll
    cy.get('h1', { timeout: 30000 })
      .contains('Payroll', { timeout: 30000 })
      .should('be.visible');

    cy.wait(['@getPendings', '@getFailed', '@getTotal'], { timeout: 30000 });

    cy.url().should('include', '/payroll');
  });

  // TEST CASES
  it('downloads one department and one report', () => {
    // generate reports
    // cy.wait(5000);
    cy.get('button').contains('Generate Reports').click();
    cy.get('button').contains('Payroll Report').click();

    //department
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Department', { timeout: 30000 })
      .click();
    // IT3101 - A
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .contains('IT3101 - A')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    // business month cycle
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Business Month - Cycle')
      .click();
    // April 2023 - SECOND CYCLE  (IT3101 - A)
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .wait(500)
      .contains('April')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    cy.intercept('POST', '/api/payrolls/generateReport').as('generateReport');

    cy.get('button').contains('Download').click();
    cy.wait('@generateReport');
    cy.wait(3000);
  });

  it('downloads one department and multiple reports', () => {
    // generate reports
    // cy.wait(5000);
    cy.get('button').contains('Generate Reports').click();
    cy.get('button').contains('Payroll Report').click();

    //department
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Department', { timeout: 30000 })
      .click();
    // IT3102
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .contains('IT3102')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    // business month cycle
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Business Month - Cycle')
      .click();
    // February
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .wait(500)
      .contains('February 2022')
      .click();
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .wait(500)
      .contains('February 2023')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    cy.intercept('POST', '/api/payrolls/generateReport').as('generateReport');
    cy.get('button').contains('Download').click();
    cy.wait('@generateReport');
    cy.wait(5000);
  });

  it('multiple departments and a single report', () => {
    // generate reports
    // cy.wait(5000);
    cy.get('button').contains('Generate Reports').click();
    cy.get('button').contains('Payroll Report').click();

    // department
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Department', { timeout: 30000 })
      .click();
    // IT3102
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .contains('IT3102')
      .click();
    // IT3103
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .contains('IT3103')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    // business month cycle - August 2020
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Business Month - Cycle')
      .click();
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .wait(500)
      .contains('August 2020')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    cy.intercept('POST', '/api/payrolls/generateReport').as('generateReport');
    cy.get('button').contains('Download').click();
    cy.wait('@generateReport');
    cy.wait(5000);
  });

  it('downloads multiple department and multiple reports', () => {
    // generate reports
    // cy.wait(5000);
    cy.get('button').contains('Generate Reports').click();
    cy.get('button').contains('Payroll Report').click();

    // department
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Department', { timeout: 30000 })
      .click();
    // IT3102
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .contains('IT3102')
      .click();
    // IT3103
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .contains('IT3103')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    // business month cycle
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Business Month - Cycle')
      .click();
    // February
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .wait(500)
      .contains('August 2020')
      .click();
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]')
      .find('span')
      .wait(500)
      .contains('August 2024')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    cy.intercept('POST', '/api/payrolls/generateReport').as('generateReport');
    cy.get('button').contains('Download').click();
    cy.wait('@generateReport');
    cy.wait(5000);
  });

  it('select ALL', () => {
    // generate reports
    // cy.wait(5000);
    cy.get('button').contains('Generate Reports').click();
    cy.get('button').contains('Payroll Report').click();

    //department
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Department', { timeout: 30000 })
      .click();
    // all
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-header"]')
      .find('div[class="p-checkbox p-component"]')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    // business month cycle
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Business Month - Cycle')
      .click();
    // April 2023 - SECOND CYCLE  (IT3101 - A)
    cy.get('div[class="p-multiselect-header"]')
      .find('div[class="p-checkbox p-component"]')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    cy.intercept('POST', '/api/payrolls/generateReport').as('generateReport');

    cy.get('button').contains('Download').click();
    cy.wait('@generateReport');
    cy.wait(300000);
  });
});

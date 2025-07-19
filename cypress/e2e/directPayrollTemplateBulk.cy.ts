import { time } from 'console';
require('dotenv').config();

describe('bulk download direct payroll template', () => {
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

    // cy.url().should('include', '/dashboard');
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
      '/api/payrolls?status=POSTED&limit=5&offset=0&search=&departmentId=&businessMonth='
    ).as('getPosted');

    // wait for /payroll
    cy.get('h1', { timeout: 30000 })
      .contains('Payroll', { timeout: 30000 })
      .should('be.visible');

    cy.wait(['@getPendings', '@getFailed', '@getPosted'], { timeout: 30000 });

    cy.url().should('include', '/payroll');
  });

  // TEST CASES
  it('downloads one department and one report', () => {
    // generate reports
    // cy.wait(5000);
    cy.get('button').contains('Direct Payroll').click();
    cy.get('button').contains('Download Template').click();

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
      .find('li[class="p-multiselect-item"]', { timeout: 30000 })
      .find('span', { timeout: 30000 })
      .contains('IT3101 - A')
      .click();
    cy.get('button[class="p-multiselect-close p-link"]').click();

    // business month
    cy.get('div[class="p-sidebar-content"]')
      .find(
        'button[class="p-button p-component p-datepicker-trigger p-button-icon-only"]'
      )
      .click();
    // January
    cy.get(
      'div[class="p-datepicker p-component p-datepicker-monthpicker p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('span[class="p-monthpicker-month"]')
      .contains('Jan')
      .click();
    cy.get('div[class="p-sidebar-content"]')
      .find(
        'button[class="p-button p-component p-datepicker-trigger p-button-icon-only"]'
      )
      .click();
    cy.wait(1000);

    // cycle
    cy.get('div[class="p-sidebar-content"]')
      .find(
        'div[class="p-dropdown p-component p-inputwrapper w-full md:w-14rem"]'
      )
      .click();
    cy.get(
      'div[class="p-dropdown-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('li[class="p-dropdown-item"]')
      .contains('FIRST CYCLE')
      .click();

    cy.get(
      'button[class="p-button p-component w-full p-button-rounded p-button-secondary"]'
    )
      .contains('Download Template')
      .click();

    cy.wait(3000);
  });

  it('multiple department and one report', () => {
    // generate reports
    // cy.wait(5000);
    cy.get('button').contains('Direct Payroll').click();
    cy.get('button').contains('Download Template').click();

    //department
    cy.get('div[class="p-sidebar-content"]')
      .find('div[class="p-multiselect-label-container"]')
      .contains('Choose Department', { timeout: 30000 })
      .click();
    // IT3103
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]', { timeout: 30000 })
      .find('span', { timeout: 30000 })
      .contains('IT3103')
      .click();
    cy.get(
      'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('div[class="p-multiselect-items-wrapper"]')
      .find('li[class="p-multiselect-item"]', { timeout: 30000 })
      .find('span', { timeout: 30000 })
      .contains('IT3101 - B')
      .click();

    cy.get('button[class="p-multiselect-close p-link"]').click();

    // business month
    cy.get('div[class="p-sidebar-content"]')
      .find(
        'button[class="p-button p-component p-datepicker-trigger p-button-icon-only"]'
      )
      .click();
    // January
    cy.get(
      'div[class="p-datepicker p-component p-datepicker-monthpicker p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('span[class="p-monthpicker-month"]')
      .contains('Jan')
      .click();
    cy.get('div[class="p-sidebar-content"]')
      .find(
        'button[class="p-button p-component p-datepicker-trigger p-button-icon-only"]'
      )
      .click();
    cy.wait(1000);

    // cycle
    cy.get('div[class="p-sidebar-content"]')
      .find(
        'div[class="p-dropdown p-component p-inputwrapper w-full md:w-14rem"]'
      )
      .click();
    cy.get(
      'div[class="p-dropdown-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
    )
      .find('li[class="p-dropdown-item"]', { timeout: 10000 })
      .contains('SECOND CYCLE')
      .click();

    cy.get(
      'button[class="p-button p-component w-full p-button-rounded p-button-secondary"]'
    )
      .contains('Download Template')
      .click();

    cy.wait(3000);
  });

  // it('multiple department and  multiple reports', () => {
  //   // generate reports
  //   // cy.wait(5000);
  //   cy.get('button').contains('Direct Payroll').click();
  //   cy.get('button').contains('Download Template').click();

  //   //department
  //   cy.get('div[class="p-sidebar-content"]')
  //     .find('div[class="p-multiselect-label-container"]')
  //     .contains('Choose Department', { timeout: 30000 })
  //     .click();
  //   // IT3103
  //   cy.get(
  //     'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
  //   )
  //     .find('div[class="p-multiselect-items-wrapper"]')
  //     .find('li[class="p-multiselect-item"]', { timeout: 30000 })
  //     .find('span', { timeout: 30000 })
  //     .contains('IT3103')
  //     .click();
  //   cy.get(
  //     'div[class="p-multiselect-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
  //   )
  //     .find('div[class="p-multiselect-items-wrapper"]')
  //     .find('li[class="p-multiselect-item"]', { timeout: 30000 })
  //     .find('span', { timeout: 30000 })
  //     .contains('IT3101 - B')
  //     .click();

  //   cy.get('button[class="p-multiselect-close p-link"]').click();

  //   // business month
  //   cy.get('div[class="p-sidebar-content"]')
  //     .find(
  //       'button[class="p-button p-component p-datepicker-trigger p-button-icon-only"]'
  //     )
  //     .click();
  //   // January
  //   cy.get(
  //     'div[class="p-datepicker p-component p-datepicker-monthpicker p-ripple-disabled p-connected-overlay-enter-done"]'
  //   )
  //     .find('span[class="p-monthpicker-month"]')
  //     .contains('Jan')
  //     .click();
  //   cy.get('div[class="p-sidebar-content"]')
  //     .find(
  //       'button[class="p-button p-component p-datepicker-trigger p-button-icon-only"]'
  //     )
  //     .click();
  //   cy.wait(1000);

  //   // cycle
  //   cy.get('div[class="p-sidebar-content"]')
  //     .find(
  //       'div[class="p-dropdown p-component p-inputwrapper w-full md:w-14rem"]'
  //     )
  //     .click();
  //   cy.get(
  //     'div[class="p-dropdown-panel p-component p-ripple-disabled p-connected-overlay-enter-done"]'
  //   )
  //     .find('li[class="p-dropdown-item"]', { timeout: 10000 })
  //     .contains('SECOND CYCLE')
  //     .click();

  //   cy.get(
  //     'button[class="p-button p-component w-full p-button-rounded p-button-secondary"]'
  //   )
  //     .contains('Download Template')
  //     .click();

  //   cy.wait(3000);
  // });
});

/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
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
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<any>;
    triggerHalfDayAndPostAttendance(): Chainable<any>;
    changeHalfDayConfig(selection: number): Chainable<any>;
    openPayroll(): Chainable<any>;
    // logout(): Chainable<void>;
    // getCookie(name: string): Chainable<string>;
    // setCookie(name: string, value: string): Chainable<void>;
    // clearCookies(): Chainable<void>;
  }
}
Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:3000/');

  cy.get('.grecaptcha-badge', { timeout: 10000 }) // You can adjust the timeout
    .should('be.visible') // Wait for it to be visible
    .then(() => {
      // Perform actions after the element is visible // Example action

      cy.get('input[id="username"]')
        .should('be.visible')
        .click({ timeout: 100000 })
        .type('companya@gmail.com', { timeout: 100000 });

      cy.get('input[id="password"]')
        .should('be.visible')
        .click({ timeout: 100000 })
        .type('Killerjo123!', { timeout: 100000 });

      cy.get('button.p-button').should('be.visible').click();
      it('');
    });
});
Cypress.Commands.add('triggerHalfDayAndPostAttendance', () => {
  cy.wait(5000);
  cy.get('.p-datatable-wrapper', { timeout: 5000 }).scrollTo('right');
  cy.get('table tr')
    .first()
    .get('#view-attendances-button', {
      timeout: 5000,
    })
    .should('be.visible')
    .click();
  cy.get('#employee-attendance-datatable .p-datatable-wrapper')
    .should('be.visible')
    .scrollTo('right');
  cy.wait(5000);
  cy.get('#employee-attendance-datatable table tr', {
    timeout: 5000,
  })
    .eq(1)
    .click();
  cy.get('#individual-attendance-datatable .p-datatable-wrapper').scrollTo(
    'left'
  );
  cy.get('#individual-attendance-datatable .p-datatable-wrapper')
    .scrollTo('right')
    .scrollTo('top');
  cy.get('#individual-attendance-datatable table tr')
    .first()
    .get('#individual-attendance-edit-button', {
      timeout: 5000,
    })
    .click({
      force: true,
    });
  cy.get('#edit-attendance-dialog')
    .should('be.visible')
    .get('#status-dropdown')
    .click();
  cy.get('.p-dropdown-items li:first-child').click();

  cy.get('input[id="timeIn"]')
    .should('be.visible')
    .click({ force: true })
    .clear({ force: true })
    .wait(500)
    .type('07:00 am', { force: true })
    .wait(500);
  cy.get('input[id="timeOut"]')
    .should('be.visible')
    .click({ force: true })
    .clear({ force: true })
    .wait(500)
    .type('11:00 am', { force: true })
    .wait(500);
  cy.get('input[id="lunchTimeOut"]').then(($el) => {
    if ($el.siblings('.ant-picker-clear').length) {
      cy.get('input[id="lunchTimeOut"]')
        .siblings('.ant-picker-clear')
        .click({ force: true })
        .wait(500);
    }
  });

  cy.get('input[id="lunchTimeIn"]').then(($el) => {
    if ($el.siblings('.ant-picker-clear').length) {
      cy.get('input[id="lunchTimeIn"]')
        .siblings('.ant-picker-clear')
        .click({ force: true })
        .wait(500);
    }
  });
  cy.get('input[id="lunchTimeOut"]')
    .should('be.visible')
    .click({ force: true })
    .clear({ force: true })
    .wait(500);
  cy.get('input[id="lunchTimeIn"]')
    .should('be.visible')
    .click({ force: true })
    .clear({ force: true })
    .wait(500);
  cy.get('#edit-attendance-submit-button')
    .should('be.visible')
    .click({ force: true });
  cy.get('#individual-attendance-datatable .p-datatable-wrapper')
    .scrollTo('right', { duration: 5000 })
    .scrollTo('top');

  cy.get('button[aria-label="Update"]').eq(0).click().wait(3000);
  cy.get('button[class="p-sidebar-close p-sidebar-icon p-link"]').eq(0).click();
  cy.get('table tr').eq(2).click({ force: true });
  cy.contains('p', 'Post All').click();
  cy.get('button[aria-label="Post"]').click().wait(3000);
});

Cypress.Commands.add('openPayroll', () => {
  cy.wait(5000);
  cy.get('table tr').eq(2).find('button').eq(0).click();
  cy.wait(5000);
  cy.get('table').eq(1).find('tr').eq(1).click({
    force: true,
  });
  cy.contains('span', 'Night Differential Pay:').scrollIntoView();
  cy.contains('span', 'Allowance:')
    .trigger('mousedown')
    .trigger('mousemove', { clientX: 50, clientY: 10 }) // Adjust coordinates as needed
    .trigger('mouseup');
  cy.wait(5000);
  cy.get('button[class="p-sidebar-close p-sidebar-icon p-link"]').eq(1).click();
  cy.get('button[class="p-sidebar-close p-sidebar-icon p-link"]').eq(0).click();
  cy.get('table tr').eq(2).click({ force: true });
  cy.contains('p', 'Delete All').click();
  cy.get('button[aria-label="Delete"]').click().wait(3000);
});

Cypress.Commands.add('changeHalfDayConfig', (selection: number) => {
  cy.visit('http://localhost:3000/page/configurations');
  cy.get('div[class="p-inputswitch p-component"]').first().scrollIntoView();
  cy.get('div[class="p-dropdown-trigger"]').first().click().wait(2000);
  cy.get('.p-dropdown-items li').eq(selection).click();
  cy.wait(3000);
  cy.get('button[aria-label="Save"]')
    .scrollIntoView({ duration: 2000 })
    .eq(0)
    .click({ force: true })
    .wait(3000);
});

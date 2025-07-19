require('dotenv').config();

describe('bulk download direct payroll template', () => {
  Cypress.session.clearAllSavedSessions();

  const login = () => {
    cy.visit('http://localhost:3000');

    cy.get('input[id="username"]').type(Cypress.env('adminUsername'));

    cy.get('input[id="password"]').type(Cypress.env('adminPassword'));

    cy.wait(500); // wait for login button to be clickable

    cy.get('button[type="submit"]').click();

    cy.get('a[data-testid="ps-menu-button-test-id"]', {
      timeout: 30000,
    }).should('be.visible');

    // cy.url().should('include', '/dashboard');
  };

  beforeEach(() => {
    cy.session('loginSession', login);

    cy.visit('http://localhost:3000/superAdmin/companies');

    cy.intercept(
      'GET',

      '/api/sidebar/companies?offset=0&limit=10'
    ).as('getCompanies');
    cy.wait('@getCompanies');
  });

  // TEST CASES
  it('add a tier charge', () => {
    cy.get('tr[class="p-selectable-row"]', { timeout: 30000 })
      .find('button[data-testid="5"]', {
        timeout: 30000,
      })
      .click();
    cy.wait(1000);

    cy.get(
      'button[class="p-button p-component p-button-icon-only p-button-text"]',
      { timeout: 30000 }
    )
      .find(
        'span[class="p-button-icon p-c pi pi-plus text-[30px] font-bold text-[#009F10]"]',
        { timeout: 30000 }
      )
      .click();

    cy.get(
      'div[class="p-datatable p-component p-datatable-responsive-scroll"]',
      { timeout: 30000 }
    )
      .find('div[class=""]')
      .contains('Tier 6')
      .find('input[data-testid="tierEnd"]', { timeout: 30000 })
      .clear()
      .clear()
      .type('600000');

    cy.get('span[class="p-button-label p-c"]', { timeout: 30000 })
      .contains('Update')
      .click();
    cy.wait(1000);
  });

  it('delete a tier charge', () => {
    cy.get('tr[class="p-selectable-row"]', { timeout: 30000 })
      .find('button[data-testid="5"]', {
        timeout: 30000,
      })
      .click();
    cy.wait(1000);

    cy.get(
      'div[class="p-datatable p-component p-datatable-responsive-scroll"]',
      { timeout: 30000 }
    )
      .find('span[class="p-button-icon p-c pi pi-trash"]', {
        timeout: 30000,
      })
      .click();

    cy.get('span[class="p-button-label p-c"]', { timeout: 30000 })
      .contains('Update')
      .click();
    cy.wait(1000);
  });

  it('add new company with charge tier', () => {
    cy.get(
      'button[class="p-button p-component min-w-[200px] flex justify-center items-center gap-3 p-button-rounded"]',
      { timeout: 30000 }
    )
      .contains('Add New')
      .click();
    cy.wait(1000);

    // forms
    cy.get('input[data-testid="companyName"]', { timeout: 30000 }).type(
      'Los Ratones ' + new Date().getTime()
    );
    cy.get('input[data-testid="emailAddress"]', { timeout: 30000 }).type(
      'rats' + new Date().getTime() + '@gmail.com'
    );
    cy.get('input[data-testid="contactNumber"]', { timeout: 30000 }).type(
      '09123456789'
    );
    cy.get('input[data-testid="companyAddress"]', { timeout: 30000 }).type(
      '123 Main Street'
    );
    cy.get('input[data-testid="maxEmployee"]', { timeout: 30000 }).type('100');
    cy.get('input[data-testid="charge-per-employee"]', { timeout: 30000 }).type(
      '200'
    );

    cy.get(
      'button[class="p-button p-component p-button-icon-only p-button-text"]',
      { timeout: 30000 }
    )
      .find(
        'span[class="p-button-icon p-c pi pi-plus text-[30px] font-bold text-[#009F10]"]',
        { timeout: 30000 }
      )
      .click();

    cy.get(
      'div[class="p-datatable p-component p-datatable-responsive-scroll"]',
      { timeout: 30000 }
    )
      .find('div[class=""]')
      .contains('Tier 5')
      .find('input[data-testid="tierStart"]', { timeout: 30000 })
      .clear()
      .clear()
      .type('300000');

    cy.intercept('POST', '/api/companies').as('addCompany');
    cy.intercept('GET', '/api/companies?limit=5&offset=0&search=').as(
      'getCompany'
    );

    cy.get('span[class="p-button-label p-c"]', { timeout: 30000 })
      .contains('Create')
      .click();
    cy.wait('@addCompany', { timeout: 30000 });
    cy.wait('@getCompany', { timeout: 30000 });
    cy.wait(5000);
  });

  it('validation 1: zero tier start', () => {
    cy.get('tr[class="p-selectable-row"]', { timeout: 30000 })
      .find('button[data-testid="5"]', {
        timeout: 30000,
      })
      .click();
    cy.wait(1000);

    cy.get(
      'div[class="p-datatable p-component p-datatable-responsive-scroll"]',
      { timeout: 30000 }
    )
      .find('button[data-testid="5"]')
      .click();

    cy.get(
      'div[class="p-datatable p-component p-datatable-responsive-scroll"]',
      { timeout: 30000 }
    )
      .find('div[class=""]')
      .contains('Tier 5')
      .find('input[data-testid="tierStart"]', { timeout: 30000 })
      .clear()
      .clear()
      .type('0');

    cy.get('span[class="p-button-label p-c"]', { timeout: 30000 })
      .contains('Update')
      .click();
    cy.wait(3000);
  });

  it('validation 2: zero tier end', () => {
    cy.get('tr[class="p-selectable-row"]', { timeout: 30000 })
      .find('button[data-testid="5"]', {
        timeout: 30000,
      })
      .click();
    cy.wait(1000);

    cy.get(
      'div[class="p-datatable p-component p-datatable-responsive-scroll"]',
      { timeout: 30000 }
    )
      .find('button[data-testid="5"]')
      .click();

    cy.get(
      'div[class="p-datatable p-component p-datatable-responsive-scroll"]',
      { timeout: 30000 }
    )
      .find('div[class=""]')
      .contains('Tier 5')
      .find('input[data-testid="tierEnd"]', { timeout: 30000 })
      .clear()
      .clear()
      .type('0');

    cy.get('span[class="p-button-label p-c"]', { timeout: 30000 })
      .contains('Update')
      .click();
    cy.wait(3000);
  });

  it('validation 3: charge calculations', () => {
    cy.get('tr[class="p-selectable-row"]', { timeout: 30000 })
      .find('button[data-testid="5"]', {
        timeout: 30000,
      })
      .click();
    cy.wait(1000);

    cy.get('input[data-testid="charge-per-employee"]', { timeout: 30000 })
      .clear()
      .type('200');

    cy.wait(3000);

    cy.get('span[class="p-button-label p-c"]', { timeout: 30000 })
      .contains('Update')
      .click();
    cy.wait(5000);
  });
});

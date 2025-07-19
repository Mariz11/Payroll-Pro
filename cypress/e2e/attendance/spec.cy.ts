describe('template spec', () => {
  beforeEach(() => {
    cy.login('companya@gmail.com', 'Killerjo123!');
  });
  // it('halfday_morning', () => {
  //   cy.wait(5000);
  //   cy.visit('http://localhost:3000/page/attendance');
  //   cy.wait(7000);
  //   cy.get('.p-datatable-wrapper', { timeout: 5000 }).scrollTo('right');
  //   cy.get('table tr')
  //     .first()
  //     .get('#view-attendances-button', {
  //       timeout: 5000,
  //     })
  //     .should('be.visible')
  //     .click();
  //   cy.get('#employee-attendance-datatable .p-datatable-wrapper')
  //     .should('be.visible')
  //     .scrollTo('top');
  //   cy.get('#employee-attendance-datatable .p-datatable-wrapper')
  //     .should('be.visible')
  //     .scrollTo('right');
  //   cy.get('#employee-attendance-datatable table tr', {
  //     timeout: 5000,
  //   })
  //     .first()
  //     .should('be.visible')
  //     .wait(5000)
  //     .get('#edit-attendance-button', {
  //       timeout: 5000,
  //     })
  //     .click();
  //   let testData: inputAndResults = {
  //     timeIn: '',
  //     timeOut: '',
  //     lunchOut: '',
  //     lunchIn: '',
  //     halfDay: '',
  //     late: '',
  //     undertime: '',
  //     creditableOT: '',
  //     status: '',
  //   };
  //   cy.fixture('halfday.json').then((data: inputAndResults[]) => {
  //     data.forEach((item: inputAndResults) => {
  //       testData = item;

  //       cy.get(
  //         '#individual-attendance-datatable .p-datatable-wrapper'
  //       ).scrollTo('left');
  //       cy.get('#individual-attendance-datatable .p-datatable-wrapper')
  //         .scrollTo('right', { duration: 8000 })
  //         .scrollTo('top');
  //       cy.get('#individual-attendance-datatable table tr')
  //         .first()
  //         .get('#individual-attendance-edit-button', {
  //           timeout: 5000,
  //         })
  //         .click({
  //           force: true,
  //         });
  //       cy.get('#edit-attendance-dialog')
  //         .should('be.visible')
  //         .get('#status-dropdown')
  //         .click();
  //       cy.get('.p-dropdown-items li:first-child').click();

  //       cy.get('input[id="timeIn"]')
  //         .should('be.visible')
  //         .click({ force: true })
  //         .clear({ force: true })
  //         .wait(500)
  //         .type(testData.timeIn, { force: true })
  //         .wait(500);
  //       cy.get('input[id="timeOut"]')
  //         .should('be.visible')
  //         .click({ force: true })
  //         .clear({ force: true })
  //         .wait(500)
  //         .type(testData.timeOut, { force: true })
  //         .wait(500);
  //       cy.get('input[id="lunchTimeOut"]').then(($el) => {
  //         if ($el.siblings('.ant-picker-clear').length) {
  //           cy.get('input[id="lunchTimeOut"]')
  //             .siblings('.ant-picker-clear')
  //             .click({ force: true })
  //             .wait(500);
  //         }
  //       });

  //       cy.get('input[id="lunchTimeIn"]').then(($el) => {
  //         if ($el.siblings('.ant-picker-clear').length) {
  //           cy.get('input[id="lunchTimeIn"]')
  //             .siblings('.ant-picker-clear')
  //             .click({ force: true })
  //             .wait(500);
  //         }
  //       });

  //       cy.get('input[id="lunchTimeOut"]')
  //         .click({ force: true })
  //         .clear({ force: true })
  //         .wait(500);
  //       cy.get('input[id="lunchTimeIn"]')
  //         .click({ force: true })
  //         .clear({ force: true })
  //         .wait(500);
  //       cy.get('#edit-attendance-submit-button')
  //         .should('be.visible')
  //         .click({ force: true });
  //       cy.wait(3000);

  //       // creditable OT =6
  //       // latehrs= 9
  //       // undertimehrs =10
  //       // halfday=11
  //       // status=12
  //       cy.get('#individual-attendance-datatable table tr')
  //         .eq(1)
  //         .find('td')
  //         .eq(6)
  //         .should('have.text', testData.creditableOT);
  //       cy.get('#individual-attendance-datatable table tr')
  //         .eq(1)
  //         .find('td')
  //         .eq(9)
  //         .should('have.text', testData.late);
  //       cy.get('#individual-attendance-datatable table tr')
  //         .eq(1)
  //         .find('td')
  //         .eq(10)
  //         .should('have.text', testData.undertime);
  //       cy.get('#individual-attendance-datatable table tr')
  //         .eq(1)
  //         .find('td')
  //         .eq(11)
  //         .should('have.text', testData.halfDay);
  //       cy.get('#individual-attendance-datatable table tr')
  //         .eq(1)
  //         .find('td')
  //         .eq(12)
  //         .should('have.text', testData.status);
  //     });
  //   });
  // });
  it('halfday_evening', () => {
    cy.wait(5000);
    cy.visit('http://localhost:3000/page/attendance');
    cy.wait(7000);
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
    cy.get('#employee-attendance-datatable table tr', {
      timeout: 5000,
    })
      .eq(2)
      .wait(5000)
      .click();
    let testData: inputAndResults = {
      timeIn: '',
      timeOut: '',
      lunchOut: '',
      lunchIn: '',
      halfDay: '',
      late: '',
      undertime: '',
      creditableOT: '',
      status: '',
    };
    cy.fixture('halfday-nightshift.json').then((data: inputAndResults[]) => {
      data.forEach((item: inputAndResults) => {
        testData = item;
        cy.get(
          '#individual-attendance-datatable .p-datatable-wrapper'
        ).scrollTo('left');
        cy.get('#individual-attendance-datatable .p-datatable-wrapper')
          .scrollTo('right', { duration: 8000 })
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
          .type(testData.timeIn, { force: true })
          .wait(500);
        cy.get('input[id="timeOut"]')
          .should('be.visible')
          .click({ force: true })
          .clear({ force: true })
          .wait(500)
          .type(testData.timeOut, { force: true })
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
        cy.wait(3000);

        // creditable OT =6
        // latehrs= 9
        // undertimehrs =10
        // halfday=11
        // status=12
        cy.get('#individual-attendance-datatable table tr')
          .eq(1)
          .find('td')
          .eq(6)
          .should('have.text', testData.creditableOT);
        cy.get('#individual-attendance-datatable table tr')
          .eq(1)
          .find('td')
          .eq(9)
          .should('have.text', testData.late);
        cy.get('#individual-attendance-datatable table tr')
          .eq(1)
          .find('td')
          .eq(10)
          .should('have.text', testData.undertime);
        cy.get('#individual-attendance-datatable table tr')
          .eq(1)
          .find('td')
          .eq(11)
          .should('have.text', testData.halfDay);
        cy.get('#individual-attendance-datatable table tr')
          .eq(1)
          .find('td')
          .eq(12)
          .should('have.text', testData.status);
      });
    });
  });
});

type inputAndResults = {
  timeIn: string;
  timeOut: string;
  lunchOut: string;
  lunchIn: string;
  halfDay: string;
  late: string;
  undertime: string;
  creditableOT: string;
  status: string;
};

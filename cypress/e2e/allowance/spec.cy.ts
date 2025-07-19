describe(`halfdayallowance`, () => {
  beforeEach(() => {
    cy.login('companya@gmail.com', 'Killerjo123!');
  });
  it('should compute correctly', () => {
    cy.fixture('halfday-allowance.json').then((data) => {
      data.testData.forEach((item: hfdAllwanceinputAndResults) => {
        describe(`Allowance Test for ${
          item.firstAllowance + item.secondAllowance
        }`, () => {
          cy.wait(5000);
          cy.visit('http://localhost:3000/page/employeeManagement');
          cy.get('input[class="p-inputtext p-component"]').type('pangilinans');
          cy.wait(3000);
          cy.get('table tr').eq(1).find('button').eq(1).click();

          cy.get('#employee-allowance-table')
            .scrollIntoView()
            .find('tr')
            .eq(1)
            .find('button')
            .first()
            .click();
          cy.get('#daily-rate-allowance-input')
            .find('input')
            .clear()
            .type(String(item.firstAllowance), {
              delay: 500,
            });
          cy.get('button[aria-label="Update"]').eq(1).click();
          cy.get('#employee-allowance-table')
            .scrollIntoView()
            .find('tr')
            .eq(2)
            .find('button')
            .first()
            .click();
          cy.get('#daily-rate-allowance-input')
            .find('input')
            .clear()
            .type(String(item.secondAllowance), {
              delay: 500,
            });
          cy.get('button[aria-label="Update"]').eq(1).click();
          cy.get('button[aria-label="Update"]').eq(0).click().wait(3000);
          // selection 0 is full allowance
          cy.changeHalfDayConfig(0);
          cy.visit('http://localhost:3000/page/attendance');
          cy.triggerHalfDayAndPostAttendance();
          cy.wait(3000);
          cy.visit('http://localhost:3000/page/payroll');
          cy.openPayroll();
          // selection 1 is half allowance
          cy.changeHalfDayConfig(1);
          cy.visit('http://localhost:3000/page/attendance');
          cy.triggerHalfDayAndPostAttendance();
          cy.wait(3000);
          cy.visit('http://localhost:3000/page/payroll');
          cy.openPayroll();
          // selection 2 is no allowance
          cy.changeHalfDayConfig(2);
          cy.visit('http://localhost:3000/page/attendance');
          cy.triggerHalfDayAndPostAttendance();
          cy.wait(3000);
          cy.visit('http://localhost:3000/page/payroll');
          cy.openPayroll();
        });
      });
    });
  });
});
type hfdAllwanceinputAndResults = {
  firstAllowance: number;
  secondAllowance: number;
  wholeWeekAllowanceforHalf: number;
  wholeWeekAllowanceforFull: number;
  wholeWeekAllowanceforNone: number;
};

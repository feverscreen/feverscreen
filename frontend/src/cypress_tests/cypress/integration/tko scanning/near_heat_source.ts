/// <reference path="../../commands/person-detection.d.ts" />

context('Actions', () => {
    afterEach(() => {
        cy.visit('');
    })

    it('Long hair near heatsource', () => {
        const cptvFile = 'Missed_Saffy_20200923.125643.110';
        const testname = 'Long hair near heatsource';

        cy.selectTestCptv(cptvFile);
        cy.checkForTempScan(36.6);
        cy.completeChecks(testname);
    });
});
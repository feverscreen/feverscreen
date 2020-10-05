/// <reference path="../../commands/person-detection.d.ts" />

context('Actions', () => {
    it('too far away', () => {
        const cptvFile = '20200729.105053.858';
        const testname = 'too_far_away';

        cy.selectTestCptv(cptvFile);
        cy.checkForTempScan(36.7);
        cy.completeChecks(testname);
    });
});



/// <reference path="../../commands/person-detection.d.ts" />

context('Actions', () => {
    it('people_behind', () => {
        const cptvFile = '20200729.104543.646';
        const testname = 'people_behind';

        cy.selectTestCptvSnippet(cptvFile, 0, 100);
        cy.checkForTempScan(36.7);
        cy.readyForNextPerson();
        cy.completeChecks(testname);
    });
});

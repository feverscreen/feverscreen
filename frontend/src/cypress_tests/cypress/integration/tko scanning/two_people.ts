

/// <reference path="../../commands/person-detection.d.ts" />

context('Actions', () => {
    it('two people in quick succession', () => {
        const cptvFile = '2_people_20200929.151113.294';
        const testname = 'two_people_fast';

        cy.selectTestCptvSnippet(cptvFile, 63, 133);
        cy.checkForTempScan(37.3);
        cy.readyForNextPerson();
        cy.checkForTempScan(37.2);
        cy.completeChecks(testname);
    });

    it('two people in quick succession2', () => {
        const cptvFile = '2_people_20200929.151113.294';
        const testname = 'two_people_fast2';

        cy.selectTestCptvSnippet(cptvFile, 80, 150);
        cy.checkForTempScan(37.2);
        cy.readyForNextPerson();
        cy.checkForTempScan(37.3);
        cy.completeChecks(testname);
    });

});


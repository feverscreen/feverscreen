

/// <reference path="../../commands/person-detection.d.ts" />

context('Actions', () => {
    it('coming closer', () => {
        const cptvFile = '2_people_20200929.151113.294';
        const testname = 'coming_towards_camera';

        cy.selectTestCptvSnippet(cptvFile, 0, 140);
        cy.checkForTempScan(37.1);
        cy.completeChecks(testname);
    });
});


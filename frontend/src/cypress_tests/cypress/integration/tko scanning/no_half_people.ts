
/// <reference path="../../commands/person-detection.d.ts" />

context('Actions', () => {
    it('no_half_people', () => {
        const cptvFile = '20200729.104543.646';
        const testname = 'no_half_people';

        cy.log('Video has side of peoples faces and small background people moving');
        cy.log('No temperatures should be recorded');
        cy.selectTestCptvSnippet(cptvFile, 70, 190);
        cy.completeChecks(testname);
    });
});


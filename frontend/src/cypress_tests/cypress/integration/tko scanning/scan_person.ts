context('Actions', () => {
    afterEach(() => {
        cy.visit('');
    })

    it('too far away', () => {
        const cptvFile = '20200729.105053.858';
        const testname = 'too_far_away';

        cy.selectTestCptv(cptvFile);
        cy.checkScannedTemp('36.7');
        cy.saveEvents(testname);
    });
});
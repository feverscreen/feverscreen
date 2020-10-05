const errors : String[] = [];
const precision = .22;
let uiMessages : string | Cypress.ObjectLike;

Cypress.Commands.add("selectTestCptv", (filename: string) => { 
    cy.visit(`/?cptvfile=${filename}`);
});

Cypress.Commands.add("checkForTempScan", (expectedTemp: number) => { 
    cy.get('.result', {timeout: 10000}).invoke('text').then(temp => {
        cy.log(`Temperature recorded ${temp}`);
    
        // expect(temp).to.contain('\x80');

        const temperature = parseFloat(temp.split('\x80')[0]);
        if (Math.abs(temperature - expectedTemp) > precision) {
            const error = `**Error: Recorded temperature ${temperature} did not match expected temperature ${expectedTemp}**`;
            cy.log(error);
            errors.push(error);
        }
    });
});

Cypress.Commands.add("checkForErrors", () => { 
    cy.log(`Temperatures recorded are ${errors}`);
    expect(JSON.stringify(errors)).to.equal('[]');
});

Cypress.Commands.add("saveEventsFile", (testname: string) => { 
    cy.server();   
    cy.route({
        method: 'POST',
        url: '**/events',
        response: []}).as('ui-messages');
        
    cy.wait('@ui-messages', {timeout: 10000}).then((xhr) =>  {
        uiMessages = xhr.request.body;
        save(testname, "messages", uiMessages);
    });
});

Cypress.Commands.add("compareEventsFile", (testname: string) => { 
    compare(testname, "messages", uiMessages);
});

Cypress.Commands.add("completeChecks", (testname: string) => { 
    cy.saveEventsFile(testname);
    cy.checkForErrors();
    cy.compareEventsFile(testname);
});


function save(testname: string, filename: string, data: string | Cypress.ObjectLike) {
    cy.log(JSON.stringify(data));
    cy.writeFile(`./results/${testname}-${filename}.json`, data);
}

function compare(testname: string, filename : string, data: string | Cypress.ObjectLike) {
    const compareFile = `./expected/${testname}-${filename}.json`;
    const message = `Comparing UI messages from this run with compare file ${compareFile}`;
    cy.log(message);
    cy.readFile(compareFile).should('deep.equal', data);
}

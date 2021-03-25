function saveAndCompare(filename: string, data: string | Cypress.ObjectLike) {
  cy.log(JSON.stringify(data));
  cy.writeFile(`./results/${filename}`, data);
  cy.readFile(`./expected/${filename}`).should("deep.equal", data);
}

Cypress.Commands.add("selectTestCptv", (filename: string) => {
  cy.visit(`/?cptvfile=${filename}`);
});

Cypress.Commands.add("checkScannedTemp", (temp: string) => {
  cy.get(".result", { timeout: 10000 }).should("contain", temp);
});

Cypress.Commands.add("saveEvents", (testname: string) => {
  cy.server();
  cy.route({
    method: "POST",
    url: "**/events",
    response: []
  }).as("ui-messages");

  cy.route({
    method: "POST",
    url: "**/screen",
    response: []
  }).as("result");

  cy.wait("@ui-messages", { timeout: 100000 }).then(xhr => {
    const filename = `${testname}-messages.json`;
    saveAndCompare(filename, xhr.request.body);
  });

  cy.wait("@result", { timeout: 100000 }).then(xhr => {
    const filename = `${testname}-temperature.json`;
    saveAndCompare(filename, xhr.request.body);
  });

  cy.wait("@ui-messages", { timeout: 100000 });
});

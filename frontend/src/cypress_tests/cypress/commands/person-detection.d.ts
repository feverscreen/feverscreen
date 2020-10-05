/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
      */
     selectTestCptv(filename: string): Chainable<Element>,
     checkForTempScan(expectedTemps: number): Chainable<Element>,
     saveEventsFile(testname: string): Chainable<Element>,
     compareEventsFile(testname: string): Chainable<Element>,
     completeChecks(testname: string): Chainable<Element>,
     checkForErrors(): Chainable<Element>,
    }
}

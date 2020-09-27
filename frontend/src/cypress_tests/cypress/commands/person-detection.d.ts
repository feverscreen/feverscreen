/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
      */
     selectTestCptv(filename: string): Chainable<Element>,
     checkScannedTemp(temp: string): Chainable<Element>,
     saveEvents(testname: string): Chainable<Element>,
     
    }
}

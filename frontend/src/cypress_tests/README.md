# cypress-tests

These tests run the cptv files through the feverscreen front end and check the reported temperatures and messages to people


### Running the tests

* Start the feverscreen server on localhost:8080
* download the cptv files for testing from google drive into feverscreen/frontend/public/cptv-files folder
    * https://drive.google.com/drive/u/0/folders/1ghyacWixPayKM1L0vU2YqsD2WoEVvtOm
    * https://drive.google.com/drive/u/0/folders/1LRTJ28vpy-MAL0Y9D5bZBOIAmdkUYCNe
* Start the interactive Cypress test environment by running `npm run dev`

If you wish to tests against a different url then you need to change the 'baseurl' parameter.   To do this copy cypress.json to cypres.env.json and make any changes that you require.   


### Updating tests

Since these tests are dealing with fuzzy decisions, these tests are expected to change.  When you have decided that the new results for an algorithm are 'good enough' then move the files from the results folder to the expected folder. 
# dqf-api unit testing with Frisby
A node.js NPM module that makes testing API endpoints easy, fast and fun.

## Dependencies
* [Node.js](https://nodejs.org/)
* [Jasmine](http://jasmine.github.io/2.0/node.html)
* [Frisby.js](http://frisbyjs.com/)

More information on how to install and run frisby tests can be found [here](http://frisbyjs.com/)

## Instructions
* Install Frisby
* Modify the `rest_dqf_api_spec.js` and add your Project Manager and Translator key on these variables
  * `var project_manager_key = '';`
  * `var translator_key = '';`

* Install jasmine-node
  * npm install -g jasmine-node
  
* Run the frisby tests from CLI with `jasmine-node rest_dqf_api_spec.js` or `jasmine-node rest_dqf_api_spec.js --junitreport` to generate test run reports in JUnit XML format.
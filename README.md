# dqf-api
TAUS Dynamic Quality Framework API

# Tutorial
This tutorial gives you a step-by-step walk through of the capabilities and functions of the TAUS Dynamic Quality Framework API (TAUS DQF API in short). Using this API you can connect any CAT tool or TMS to the DQF platform to measure quality, productivity and efficiency. Data will be visualized through the Quality Dashboard (work in progress).

If you are not yet familiar with the TAUS Dynamic Quality Framework, please go to https://evaluate.taus.net/evaluate/dqf/dynamic-quality-framework and watch the demo videos there - particularly the ones on measuring productivity.

The tutorial assumes that you are familiar with REST APIs - the predominant style of web APIs used today.

For the API reference, you can find a live API reference allowing you to try out the different end points through a web interface [here](http://dqf.ta-us.net/assets/api/v1/index.html) or you can have a look at the API specification file contained in this git repository https://github.com/TAUSBV/dqf-api/blob/master/swagger_specification.yaml

For API testing and client development it is recommendable to use a REST API test tool. We like to use the Google Chrome extensions [Advanced REST Client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo) and [Postman](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm).

## Query industry, MT engines, CAT tools
While you need authorization for most end points of the DQF API, there are a few reference list end points that don't. So these are a good opportunity to make the first calls to the API. For example you can send `HTTP GET` requests to retrieve a list of industries, machine translation engines and CAT (computer aided translation) tools that we maintain in DQF:
* http://dqf.ta-us.net/api/v1/industry/
* http://dqf.ta-us.net/api/v1/mtengines/
* http://dqf.ta-us.net/api/v1/cattools/

Because these are GET requests, you can just click on these links in your browser to see the JSON formatted results.

## Get project manager key
## Create project
## Create translator
## Create task
## Add segment
## Update segment

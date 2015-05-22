# dqf-api
TAUS Dynamic Quality Framework API

# Tutorial
This tutorial gives you a step-by-step walk through of the capabilities and functions of the TAUS Dynamic Quality Framework API (TAUS DQF API in short). Using this API you can connect any CAT tool or TMS to the DQF platform to measure quality, productivity and efficiency. Data will be visualized through the Quality Dashboard (work in progress).

If you are not yet familiar with the TAUS Dynamic Quality Framework, please go to https://evaluate.taus.net/evaluate/dqf/dynamic-quality-framework and watch the demo videos there - particularly the ones on measuring productivity.

The tutorial assumes that you are familiar with REST APIs - the predominant style of web APIs used today.

For the API reference, you can find a live API reference allowing you to try out the different end points through a web interface [here](http://dqf.ta-us.net/assets/api/v1/index.html) or you can have a look at the API specification file contained in this git repository https://github.com/TAUSBV/dqf-api/blob/master/swagger_specification.yaml

For API testing and client development it is recommendable to use a REST API test tool. We like to use the Google Chrome extensions [Advanced REST Client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo) and [Postman](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm).

## Query industries, MT engines and CAT tools
While you need authorization for most end points of the DQF API, there are a few reference list end points that don't. So these are a good opportunity to make the first calls to the API. For example you can send `HTTP GET` requests to retrieve a list of industries, machine translation engines and CAT (computer aided translation) tools that we maintain in DQF:
* http://dqf.ta-us.net/api/v1/industry/
* http://dqf.ta-us.net/api/v1/mtengines/
* http://dqf.ta-us.net/api/v1/cattools/

Because these are GET requests, you can just click on these links in your browser to see the JSON formatted results.

## Obtaining authorization keys
Most other calls in the API require authorization. In DQF there are two user roles - project managers, who create quality evaluation projects and translators that do the actual evaluation. You can get API keys for both of them to prove your authorization. Some end points require a project manager authorization while others need a translator API key.

### Project manager API key
To get the project manager API key log into your DQF account on https://dqf.taus.net and click on your user name. This will display your project manager information and API key.

### Translator API key
For the translator API key submit a `HTTP POST` request with your name and email address to `http://dqf.ta-us.net/api/v1/translator?name=Johnny%20Rocket&email=johnny@example.com`. This will create a translator account for you and send the translator API key to the specified email address. If you forget the key, you can repeat this call and the email will be sent again.

## Creating a productivity project
DQF provides comparison, quality evaluation and productivity projects. Project managers can now create productivity projects directly from a CAT tool that supports the DQF API (other project types still have to be created in the web interface).

In order to create a project you have to submit a number of project parameters as URL parameters in a `HTTP POST` request. For example to create a project named "My first DQF productivity project" for audio/video content in the automotive industry, using the post-edited machine translation,  expecting a "good enough" quality level, with the source language American English you would use the following URL:
```
http://dqf.ta-us.net/api/v1/productivityProject?name=My+first+DQF+productivity+project&quality_level=1&process=2&source_language=en-US&contentType=1&industry=1
```
## Create task

## Add segment

## Update segment

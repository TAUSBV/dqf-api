# dqf-api
TAUS Dynamic Quality Framework API

Copyright © 2015 TAUS BV

# Tutorial
This tutorial gives you a step-by-step walk through of the capabilities and functions of the TAUS Dynamic Quality Framework API (TAUS DQF API in short). Using this API you can connect any CAT tool or TMS to the DQF platform to measure quality, productivity and efficiency. Data will be visualized through the Quality Dashboard (work in progress).

If you are not yet familiar with the TAUS Dynamic Quality Framework, please go to https://evaluate.taus.net/evaluate/dqf/dynamic-quality-framework and watch the demo videos there - particularly the ones on measuring productivity.

The tutorial assumes that you are familiar with REST APIs - the predominant style of web APIs used today.

For the API reference, you can find a live API reference allowing you to try out the different end points through a web interface [here](http://dqf.taus.net/assets/api/v1/index.html) or you can have a look at the API specification file contained in this git repository https://github.com/TAUSBV/dqf-api/blob/master/api_specification.yaml

For API testing and client development it is recommendable to use a REST API test tool. We like to use the Google Chrome extensions [Advanced REST Client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo) and [Postman](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm).

We also provide an interactive UI to try out the API functions: https://dqf.taus.net/assets/api/v1/index.html

## Query industries, MT engines and CAT tools
While you need authorization for most end points of the DQF API, there are a few reference list end points that don't. So these are a good opportunity to make the first calls to the API. For example you can send `HTTP GET` requests to retrieve a list of industries, machine translation engines and CAT (computer aided translation) tools that we maintain in DQF:
* http://dqf.taus.net/api/v1/industry/
* http://dqf.taus.net/api/v1/mtengines/
* http://dqf.taus.net/api/v1/cattools/

Because these are GET requests, you can just click on these links in your browser to see the JSON formatted results.

## Obtaining authorization keys
Most other calls in the API require authorization. In DQF there are two user roles - project managers, who create quality evaluation projects and translators that do the actual evaluation. You can get API keys for both of them to prove your authorization. Some end points require a project manager authorization while others need a translator API key.

### Project manager API key
To get the project manager API key log into your DQF account on https://dqf.taus.net and click on your user name. This will display your project manager information and API key.

### Translator API key
For the translator API key submit a `HTTP POST` request with your name and email address to 
```
http://dqf.taus.net/api/v1/translator?name=Johnny%20Rocket&email=johnny@example.com
```
This will create a translator account for you and send the translator API key to the specified email address. If you forget the key, you can repeat this call and the email will be sent again.

## Creating a productivity measurement project
DQF provides comparison, quality evaluation and productivity measurement projects. Project managers can now create productivity measurement projects directly from a CAT tool that supports the DQF API (other project types still have to be created in the web interface).

In order to create a project you have to submit a number of project parameters as URL parameters in a `HTTP POST` request. For example to create a project named "My first DQF productivity measurement project" for audio/video content in the automotive industry, using the post-edited machine translation,  expecting a "good enough" quality level, with the source language American English you would use the following URL:
```
http://dqf.taus.net/api/v1/productivityProject?name=My+first+DQF+productivity+project&quality_level=1&process=2&source_language=en-US&contentType=1&industry=1
```

In order to authorize yourself as a project manager permitted to create projects, you need to add the project manager API key as a header variable named `DQF_PMANAGER_KEY` to the HTTP request.

Upon successful project creation (HTTP status code 200) you get sent a `project_id` and `project_key` in the HTTP response header, which you need to note in order to be able to reference the created project later (you will not be able to retrieve these later!).

## Creating a task within a productivity measurement project
If you now log on to the DQF web interface as a project manager, you will see the newly added project, but with a status of "Initializing...". This is because no productivity tasks are yet added to the project. You need to invite translators to sign up for the productivity measurement project (e.g. by email or via your CAT tool interface) and ask them for their translator key.

The `project_key` and translator key are then used to create a specific task with a `HTTP POST` to the `/project/<project id>/task` end point. In our example we are creating a task for the target language German and specifying the document name 'foobar' using `HTTP POST` to
```
http://dqf.taus.net/api/v1/productivityProject/<project_id>/task?target_language=de-DE&file_name=foobar
```
You need to supply the `project_key` in the HTTP header variable `DQF_PROJECT_KEY` and the translator id in the HTTP header variable `DQF_TRANSLATOR_KEY`.

Upon successful creation of the task (HTTP status code 200), the HTTP response header will contain a `task_id` you need to retain.

## Add segment
Even with the task added, the project in the DQF project overview will still show the status "Initializing..." because no translation segments have been added to the project yet.

Adding translation segments can be done with an `HTTP POST` to the API end point `/project/<project id>/task/<task id>/segment`. For example a `HTTP POST` to
```
http://dqf.taus.net/api/v1/productivityProject/<project id>/task/<task id>/segment?source_segment=The+car+key+is+black.&target_segment=Der+Schl%FCssel+ist+schwarz.&new_target_segment=Der+Autoscchl%FCssel+ist+schwarz.&time=12000&cattool=13&tm_match=0&mtengine=5&mt_engine_version=""
```
creates a post-edited segment in DQF. The source of the segment was "The car key is black." and the machine translation from Bing Translator was "The key is black.". The segment was post-edited using MemoQ to "Der Autoschlüssel ist schwarz." within 12 seconds. Note that the segment text needs to be URL-escaped, in this case the German umlaut ü, otherwise there will be misencoded characters in the database.

## Viewing reports
In the DQF web interface the status of the project has now changed to "Active" in the project overview and you can start viewing reports on the project, for example our post-editing rate for this project is 1500 words/hour.

More segments can be added as described above and segments can be updated when the translator returns to edit a segment again.

There are also more API end points to query the data which you can find in the reference documentation.

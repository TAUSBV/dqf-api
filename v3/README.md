# Release notes for DQF API v3.0

DQF Team | TAUS 2016 | [Previous version](https://github.com/TAUSBV/dqf-api/releases/tag/v1.3)

_This topic describes the new features in DQF API v3.0_

In this topic:
* Product Description
* What's new?
* What's coming?
* Known issues
* Documentation
* Help and support

## Product Description
The Quality Dashboard is an industry platform for statistics on translation, benchmarking translation activity and quality and analysis of translation performance and production. TAUS provides API specifications allowing translation technology providers and users of translation services to plug TAUS DQF into their work environment.
The TAUS DQF API v3.0 enables  any CAT tool or TMS to connect to the DQF platform to measure quality, productivity and efficiency. Data will be visualized through the [Quality Dashboard](https://dqf.taus.net/quality-dashboard).

### APIv3
* [Swagger UI](http://dqf-api.ta-us.net)
* [Base url] (http://dqf-api.ta-us.net/v3)
* [Specifications] (http://dqf-api.dev.ta-us.net/v3/api-docs)

## What's new?
The DQF API went through a major upgrade from v1.3 to v3 in order to fully support the translation and quality review workflows of most available CAT tools and TMS.

### June 07, 2016 - DQF API v3.0 Release
This release contains the following new features compared to the previous version:
* New and updated methods/endpoints to measure productivity and quality
* Content type "multipart/form-data" for the submission of data
* Tree hierarchy structure of projects to track supply chain workflows
* Updated Authentication/Authorization methods
* Multiple file support
* Batch upload of source, target and edited segments
* Project and Review settings templates
* Client-API identifier mapping for Projects, Files, Segments, Translations

### New and updated methods/endpoints
The DQF API v3.0 follows a RESTful approach with the basic CRUD functions(POST, PUT, GET, DELETE) to be applied in most of its methods. Please refer to the Swagger specification and UI for a detailed reference of v3.0 end points.

### Content type "multipart/form-data" for the submission of data
The content type that needs to be used to encode the form data set for submission to the server, has been changed to ["multipart/form-data"](https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.2).

### Tree hierarchy structure of projects to track supply chain workflows
The APIs hierarchy is based on a tree structure where the root node is the master project.
During the translation workflow, the project creation will follow the tree hierarchy in order to identify the path that the data is following from the initialization until the completion of a project. There is a Parent/Child relationship between the projects that are created during this workflow.

### Updated Authentication/Authorization methods
After successful submission of username and password to the DQF authentication service the service will create a session which the user can use to access the API.
The user will be authorized to access data that has been submitted by him/her, shared within his/her company or data from projects on lower levels on their project hierarchy tree.

### Multiple file support 
The API can support multiple files for a project which in their turn can be translated in many different languages. The files can be specified only on the Master project level.

### Batch upload of source, target and edited segments
A method for batch submission of the source segments of a file has been introduced at the creation of a Master project.  Furthermore, the remaining, if any, target segments that haven’t been submitted to the DQF server can be posted by another batch upload method. Batch uploads reduce API traffic and enable display of accurate statistics throughout the project progress.

### Project and Review settings templates
Users can store their project and review settings into templates to be used by them or their company for future projects.

### Client-API identifier mapping for Projects, Files, Segments, Translations
Integrators can submit their own identifiers during the creation of projects, files, segments and translations to map the DQF related identifiers. Then using their own identifiers they will be able to retrieve the DQF identifiers. This feature enables integrators that cannot track DQF identifiers to use the DQF API.

## What's coming?
Here are some of the features that we are working on. You should see these in the next months:
* A new version of the Quality Dashboard, fully supporting the new API.

## Known issues
The current version of the API does not support review projects without the existence in DQF of the actual translation that needs to be reviewed. A translation project has to exist in order a review project to be created.
Report issues that you find, and they will show up in our issue tracker.

## Documentation
Please see the documentation on how to integrate with the DQF API v3.0

## Help and support
Send questions or suggestions on dqfapi(at)taus(dot)net

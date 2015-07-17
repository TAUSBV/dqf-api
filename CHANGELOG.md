# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.0](https://github.com/TAUSBV/dqf-api/issues?q=is%3Aopen+is%3Aissue+milestone%3A%22DQF+API+v1.0%22)
### Added
- Method for Project Managers to find the tasks of a Project. Get the task IDs of a project by specifying the project id. Issue [#31](https://github.com/TAUSBV/dqf-api/issues/31)
```
GET /api/v1/productivityProject/{project_id}/task/
```
- Method to update the translator of a task. Issue [#19](https://github.com/TAUSBV/dqf-api/issues/19)
```
PUT /api/v1/productivityProject/{project_id}/task/{task_id}/translator
```
- Method for Project managers to retrieve own information. Issue [#59](https://github.com/TAUSBV/dqf-api/issues/59)
```
GET /api/v1/projectmanager/
```
- Method for translators to retrieve own information. Issue [#40](https://github.com/TAUSBV/dqf-api/issues/40)
```
GET /api/v1/translator/
```
- Method for Project Managers to retrieve translator information. Issue [#40](https://github.com/TAUSBV/dqf-api/issues/40)
```
GET /api/v1/translator
```
- Method for translators to update own information. Issue [#5](https://github.com/TAUSBV/dqf-api/issues/5)
```
PUT /api/v1/translator/{translator_id}
```
- "SDL Language Cloud" was added to the list of MT Engines. Issue [#32](https://github.com/TAUSBV/dqf-api/issues/32)

### Changed
- Method to find Projects by id. Now translators have access to project info of project they are assigned to. Issue [#44](https://github.com/TAUSBV/dqf-api/issues/44)
```
GET /api/v1/productivityProject/{project_id}
```
- Method to add target languages and translators to a project. Now Project Managers can assign tasks as well directly to translators by specifying the translator ID.
```
POST /api/v1/productivityProject/{projectid}/task
```
- Method to find task by id. Now Project Managers can get the task info as well. Issue [#38](https://github.com/TAUSBV/dqf-api/issues/38)
```
GET /api/v1/productivityProject/{project_id}/task/{task_id}
```
- Method to add segments for a task. It is now possible to create segments with empty source/target/new target. Issue [#25](https://github.com/TAUSBV/dqf-api/issues/25)
```
POST /api/v1/productivityProject/{projectid}/task/{taskid}/segment
```
- Method to update a segment of a task. Include more parameters in a PUT request that are included in the POST request. Issue [#25](https://github.com/TAUSBV/dqf-api/issues/25)
```
PUT /api/v1/productivityProject/{projectid}/task/{taskid}/segment/{segmentid}
```

### Fixed
- Resolved the issue about throwing an error from the service when uploading segments with the entity &#39;.
Issue [#33](https://github.com/TAUSBV/dqf-api/issues/33)
- Server error when clicking on link of project without tasks.
Issue [#43](https://github.com/TAUSBV/dqf-api/issues/43)

## [0.9] - 2015-06-01
### Added
- Method to add a new project to DQF
```
POST /api/v1/productivityProject
```
- Method to find Projects by id
```
GET /api/v1/productivityProject/{project_id}
```
- Method to add target languages and translators to a project.
```
POST /api/v1/productivityProject/{projectid}/task
```
- Method to find task by id
```
GET /api/v1/productivityProject/{project_id}/task/{task_id}
```
- Method to add segments for a task
```
POST /api/v1/productivityProject/{projectid}/task/{taskid}/segment
```
- Method to update a segment of a task
```
PUT /api/v1/productivityProject/{projectid}/task/{taskid}/segment/{segmentid}
```
- Method to add a new translator to dqf
```
POST /api/v1/translator
```
- Method to find the translators of a project manager
```
GET /api/v1/translator/{project_id}
```
- Method to return the Computer-assisted translation tools
```
GET /api/v1/cattools/
```
- Method to return the MT Engines
```
GET /api/v1/mtengines/
```
- Method to return the Productivity Quality Levels
```
GET /api/v1/process/
```
- Method to return the Content Types
```
GET /api/v1/contenttype/
```
- Method to return the industry list
```
GET /api/v1/industry/
```
- Method to return the Productivity Quality Levels
```
GET /api/v1/qualitylevel/
```
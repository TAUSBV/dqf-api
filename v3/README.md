# DQF API v3.0 Documentation

This document is for anyone who is interested in integrating with DQF using the DQF API v3.0

## Getting started
* [Authentication](#authentication)
* [Basic Attributes](#attributes)
* [Requests/Header](#requestsHeader)
* [Project/Master](#projectMaster)
* [Project/Child](#projectChild)
* [Translation](#translation)
* [Review](#review)
* [Automated Review Projects](#automatedReview)
* [Project Status](#projectStatus)
* [Target segments](#targetSegments)
* [User/Company Templates](#templates)
* [Mapping](#mapping)
* [User](#user)
* [API Specifications](#specs)

<a name="authentication"/>
## Authentication
* Every request must contain the header parameter **apiKey**, a _Universally Unique Identifier_ (_UUID_) which will be provided by us. The **apiKey** is application specific and used to identify the client that sends the requests. Every integrator will have one **apiKey**.	
* For secured endpoints, there should also be a header parameter **sessionId**.
* In order to obtain a **sessionId** one must call the [POST /v3/login](http://dqf-api.ta-us.net/#!/Authentication/login) endpoint.
* The body parameters (_email, password_) are the user's encrypted and Base64 encoded credentials.	
* The encryption algorithm used is **AES/CBC/PKCS5PADDING**
* The encryption key will also be provided by us.

Below is a simple Java code snippet for the encryption part using the javax.crypto lib:

```java
public static String encrypt(String value, String key) throws Exception {
	IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
	SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");

	Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
	cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);

	byte[] encrypted = cipher.doFinal(value.getBytes("UTF-8"));
	
	return Base64.encodeBase64String(encrypted);
}
```

The **_initVector_** will also be provided by us.
Should you decide to use your own initialization vector, it should be _16 Bytes_ and you must provide us with it.

For testing/debugging purposes, we have enabled an encrypt endpoint which is accessible through 
[POST /v3/encrypt](http://dqf-api.ta-us.net/v3/encrypt). 
No authentication is required. The body parameters are:
* **email:** 	The user's email as plain text
* **password:** The user's password as plain text
* **key:** The encryption key

With a successful request you should get back your encrypted and Base64 encoded credentials.

**Note:** The aforementioned endpoint is not available in production and should not be used as part of your final implementation.

## Response Content Type
All the responses are in Json format. You should explicitly handle the status of the response in order to retrieve additional information. For example, in .NET you can catch a WebException for a BadRequest and parse the content to see what went wrong:

```json 
{  
   "code":6,
   "message":{  
      "password":[  
         "This field is required"
      ]
   }
}
```

The code is DQF specific and can be used to report the nature of the problem to the DQF team.


<a name="attributes"/>
## Basic Attributes
The following endpoints are used to retrieve the basic/static attributes of the API. No authentication is required for these.
* [GET /v3/catTool](http://dqf-api.ta-us.net/#!/Basic_attributes/get)
* [GET /v3/contentType](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0)
* [GET /v3/errorCategory](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1)
* [GET /v3/industry](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2)
* [GET /v3/language](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3)
* [GET /v3/mtEngine](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4)
* [GET /v3/process](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4_5)
* [GET /v3/qualitylevel](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4_5_6)
* [GET /v3/segmentOrigin](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4_5_6_7)
* [GET /v3/severity](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4_5_6_7_8)

<a name="requestsHeader"/>
## Requests/Header
As already explained, every request to the DQF API (apart from the aforementioned basic attributes) should contain the ***apiKey*** and ***sessionId*** header parameters. For the project related requests you should also include the ***projectKey*** in the header.

<a name="projectMaster"/>
## Project/Master
The core entity of the DQF API. Once the basic attributes are received, a master project needs to be created: 
[POST /v3/project/master](http://dqf-api.ta-us.net/#!/Project%2FMaster/add)
The APIs hierarchy is based on a *tree structure where the root node is the master project*.
A master project contains all of the basic attributes which are then inherited by child projects. After a successful post the project's *Id* and *UUID(dqfUUID)* will be returned as response. The *Id* should be used as path parameter whereas the *UUID* as a header parameter for subsequent requests. The owner will be identified from the header's *sessionID*.
**Note:** There are no endpoints to apply translations/reviews to the master project (attribute placeholder). It is necessary to create child projects for that purpose.

The next action would be to declare the project files. 
The [POST /v3/project/master/{projectId}/file](http://dqf-api.ta-us.net/#!/Project%2FMaster%2FFile/add) will be used for that. 
For validation and statistical reasons, the number of segments that are included in the file is required.

The final step for the master project setup would be a:
[POST /v3/project/master/{projectId}/file/{fileId}/targetLang](http://dqf-api.ta-us.net/#!/Project%2FMaster%2FFile%2FTarget_Language/add) where the target languages are associated with files. The API allows any combination of files/targetLangs. For example _file1_ has _en-US_ and _nl-NL_ whereas _file2_ has only _en-US_ as target language.

<a name="projectChild"/>
## Project/Child
This is where the actual work takes place. To declare a child project the 
[POST /v3/project/child](http://dqf-api.ta-us.net/#!/Project%2FChild/add) has to be used. The parent's _UUID_ must be specified to create a parent/child relationship (remember that a tree structure is used). 
**Example:**
_Child1_ will declare the master project's UUID as the parentKey. Of Course child1 can have as many siblings as needed. If then a child of _child1_ (_child1.1_) needs to be created , the same endpoint will be used but with the _child1 UUID_ as a parentKey. The type of a child project can be either *translation* or *review*. There is also the possibility of directly declaring a different child project owner (other than the one making the request) by optionally specifying an email for the *assignee* parameter. The email must belong to an existing **TAUS account**.

There is no need to declare files for child projects as they have access to the master/root project files. A child project can get a list of files with [GET /v3/project/child/{projectId}/file](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile/getAll). The projectId here refers to the child project.

The [POST /v3/project/child/{projectId}/file/{fileId}/targetLang](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language/add) will be used next to declare the target language for the child project.
**Note:** A child project can declare any combination of files/targetLangs that are a **subset** of their **parents'** *file/targetLang* pairs. So building on the previous example, *child1* can declare *nl-NL* for file1 but not *nl-NL* for file2.

<a name="translation"/>
## Translation
To be able to post a translation, there must be a child project with a type of *translation*. The API supports two different alternatives for posting translations. The main distinguishing parameter among these two approaches is the prerequisite of *source segments*.

### Approach 1: Translation with source segments posted at master project level:
In this approach, all of a file's source segments have first to be uploaded at master project level. The [POST /v3/project/master/{projectId}/file/{fileId}/sourceSegment/batch](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0_1) should be used after the files for the master project have been declared. The *sourceSegments* body parameter should be a Json Array. Example (two source segments):

```json
[  
   {  
      "sourceSegment":"Aenean fermentum.",
      "index":1,
      "clientId":"c352702c-75f7-4f08-ab4a-b71c1407b240"
   },
   {  
      "sourceSegment":"Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.",
      "index":2,
      "clientId":"43dee044-fc0e-4dcb-98a1-64aa49b702e3"
   }
]
```

The *index* refers to the segment's sequential numbering in the file. The maximum allowed number of elements in the array is 100. Whenever a re-post of segments with the same index numbers is submitted, the old values will be overwritten. After each successful post the DQF Id for each segment will be returned.
**Note:** During this process the *numberOfSegments* declared at file posting cannot be exceeded.

Child projects can access the source segment information through: [GET/v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/batch](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/get)
To post a translation in this scenario the 
[POST/v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/{sourceSegmentId}/translation](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0) method should be used.

### Approach 2: Translation with source segments posted at translation level:
In this approach, the method
[POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/segment](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add) which is almost identical to the aforementioned translation post should be used. The additional parameters here are the source segment content and its index numbering.

**Note:** It is strongly recommended the use of the 1st approach. Even though it seems like extra effort (batch upload, an additional request) it will lead to a more robust solution.

<a name="review"/>
## Review
Review projects are created as (direct) children of translation or other review projects. 
The first thing would be to add the Review Settings that the user intends to apply. This can be accomplished with [POST /v3/project/{projectId}/reviewSettings](http://dqf-api.ta-us.net/#!/Project%2FReviewSettings/add).
By specifying the *templateName* parameter, the posted settings will also be saved as a user template (templates are described below). 
To create a review project use the 
[POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/translation/{translationId}/batchReview](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment%2FReview/add) review method.

This is the most complex request in the API.

The easiest way to explain this would be by seeing how a request's raw body data looks like:
```json
{
    "overwrite": true,
    "batchId": "test batch",
    "revisions":
    [
        {
          "clientId": "",
          "comment": "test comment",
          "errors": [
            {
              "errorCategoryId": 1,
              "severityId": 2,
              "charPosStart": null,
              "charPosEnd": null,
              "comment": null
            },
            {
              "errorCategoryId": 2,
              "severityId": 3,
              "charPosStart": 0,
              "charPosEnd": 4,
              "comment": "Test comment"
            }
          ],
          "correction": {
            "content": "test segment",
            "time": 1000,
            "comment": null,
            "detailList": [
              {
                "subContent": "test ",
                "type": "unchanged"
              },
              {
                "subContent": "segment",
                "type": "deleted"
              }
            ]
          }
        }
    ]
}
```

The request's content should be json serialized which means that key-value pairs should not be used(as in x-www-form-urlencoded or form-data body) but a raw json body instead.
* The batchId parameter is optional and is used for mapping reasons as it is returned back with the response from the API.
* The overwrite parameter is required and its value depends on how the integrator is handling the segment revisions (more on that below).
* The core json object is the revisions parameter: 

  * Based on the Review Settings that were specified, the json content may differ. 
In the example above, the combined review settings are used where a user can apply error annotations and correct a segment at the same time. 
If the review settings are of correction only then the errors array should be ommited. 
  * Same thing goes for the error review only settings: The correction object should be ommited. 
If there is no way to prevent the user from editing a translation in the last scenario, 
then the corrections can be posted but they will be not taken into consideration from the Quality Dashboard's side. 

  * Note that a segment revision can have multiple error annotations but only one correction. And that is exactly what revision refers to. 

  * Let's take for example the segment "Test Segment" for the json example above. 
Let's assume that the reviewer marks the whole segment with an error and the word "Segment" with another one. 
Then he/she deletes the word "Segment". 
Later he/she notices another error in the corrected segment and first adds the word "Some " at the begining (so it becomes "Some Test Segment") and then applies an anotation to the word "Test". 
The whole procedure took 10 secs. These series of actions should generate the json in our example. 

  * The triggers/conditions for revisions are:
    * If there is no correction then the first revision contains only the error annotations which refer to the original translation.
    * If a correction precedes an error annotation, then the revision should contain both correction and error parameters.
    * If a segment gets corrected but the latest revision does not have any errors, then the correction object of the latest revision has to be updated.
    * If a segment gets corrected but the latest revision  does have errors applied, then a new revision (which initially does not have any children errors) has to be created. 
  * New error annotations apply to the latest revision/correction.
  * Some comments on the fields that may not be self-explanatory:
    * The fields charPosStart and charPosEnd are zero based indexes. 
    * They are both null when an error annotation applies to the whole segment. 
    * If the user applies an error to a selected text then the start and end positions of the selection have to be specified.
    * The field content of the corretion object contains the whole content of the segment (even deletions). 
    * In the second revision in the example note that even though the word "Segment" got deleted, the content is "Some Test Segment" and that the character indexes correclty identify the current position of the word "Test". 
  * In the detailList we specify the revision type for each segment sub item. The allowed types are:
    * unchanged
    * added
    * deleted 
* Getting back to the overwrite parameter. If this is set to true, then the whole segment revision history should be posted every time you trigger the upload (ex. document saved) as it overwrites existing records in our end. 
If set to false, then only the new and un-posted revisions should be sent.

Three types of review projects are supported:

1. Error Review - i.e. selection of one or multiple error categories to be applied to:		
  * Whole segment		
  * Part of segment	
2. Correction - i.e. editing the existing translation
3. Combined (a combination of the above). For the error review part, again:		
  * Whole segment		
  * Part of segment

The sub-type will be automatically defined by the API , based on the non-required parameters that were included during the review settings post.



**Note:** Review projects can also have translation projects as children. For example, a review project with a type of *Error Review* is created and completed. The review's parent project (let's assume a translation project) owner decides to send it again for translation. This should create a translation child for the aforementioned review project. Or he/she can send it for review *Correction* which would then have to create a review child project.

<a name="automatedReview"/>
## Automated Review Projects
For convenience reasons we have setted up some extra endpoints to automatically create child review projects in the tree hierarchy.
* Review settings must exist for the project that we want to perform this procedure. 
* Review Settings can be posted at any time. 

When a Review Cycle is about to begin, you can call [POST /v3/project/{projectId}/reviewCycle](http://dqf-api.ta-us.net). In this request you must specify an array of fileTargetLangIds. These refer to the file and target language combinations for the project at hand and can be retrieved any time via [GET /v3/project/{projectId}/fileTargetLang](http://dqf-api.ta-us.net) (for both master and child projects). You must also specify the assignee (existing TAUS user email) that will take ownership of the automatically created review projects. The API will detect any appropriate projects and create Review projects as children. The current criteria are:
* The project’s status must be ‘completed’
* The project’s type cannot be Review with a Review Type of ‘error_typology’. Only ‘correction’ and ‘combined’ Review projects are allowed
* There must be no direct Review children for the specified user and file/target-language combination
* The project must be a leaf in the tree hierarchy (after excluding projects that do not meet the criteria above)

The response will contain a list of all the Review projects that were created and a list of all the leaf projects that did not meet the aforementioned criteria alongside with the reason for that. You can retrieve the current Review Cycle projects at any time via [GET/v3/project/{projectId}/reviewCycle](http://dqf-api.ta-us.net).

<a name="projectStatus"/>
## Project Status
Currently, we allow the update of status for Child Projects only. This is accomplished through 
[PUT /v3/project/child/{projectId}/status](http://dqf-api.ta-us.net). The status values are: ‘initialized’, ‘assigned’, ‘inprogress’ and ‘completed’. The only allowed value at the moment though is ‘completed’. You can retrieve a project’s status via [GET /v3/project/child/{projectId}/status](http://dqf-api.ta-us.net). 

<a name="targetSegments"/>
## Target Segments
The final step for a child project (after a translation or a review has taken place) would be to post **all** of the remaining target segments (if any) that were not edited (translation or review correction). This can be accomplished through:
[POST v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/targetSegment/batch](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0_1). 
This is similar to the batch source segments operation. To verify which source segments have target segment content the following method can be used:
[GET v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/batch](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/get).

This request will return all of the source segments of the file and a flag determining if target segments have been posted (through translation or review process) for the specified target language.

**Note:** The target segment batch upload can take place at any time during the execution of the translation/review project. The final batch upload can be made e.g when the user is ready to complete the job or e.g. when the user has submitted the first segment. In this latter case, the edits made to a segment during translation/review will be send via a PUT call. 

<a name="templates"/>
## User/Company Templates
In order to enhance user experience a set of operations allowing the use of project templates has been  included. Templates contain project settings that pre-populate the fields required by DQF. Templates are created by a single user but they can be shared among users within the same organization by setting the *isPublic* parameter to *true*.


There are two types of templates:
1. Project templates
2. Review settings templates

### Templates/Project
To post a project template use [POST /v3/user/projectTemplate](http://dqf-api.ta-us.net/#!/Template/add). 
This request includes all of the parameters that are required during a master project creation (*content type, industry, process, quality level*) except *source language*. 
A user can get a list of project templates he/she has access to through  [GET /v3/user/projectTemplate](http://dqf-api.ta-us.net/#!/Template/getAll). This request should fetch all user’s templates plus any shared template within the organization. In UI perspective, there could be a step before posting a master project where the user creates/selects/edits/deletes templates.

### Templates/Review
The same principle applies to Review templates. 
To post a review template use [POST /v3/user/reviewTemplate](http://dqf-api.ta-us.net/#!/Template/add_0). 
To access the user's and shared organization templates use GET /v3/user/reviewTemplate.

**Note:** A review can be created template automatically when posting review settings as described in the *Review* section.

<a name="mapping"/>
## Mapping
A client-API identifier mapping for the following entities is provided:
* Project: [GET /v3/DQFProjectId](http://dqf-api.ta-us.net/#!/Mapping/get_0)
* File: [GET /v3/DQFFileId](http://dqf-api.ta-us.net/#!/Mapping/get)
* Source Segment: [GET /v3/DQFSegmentId](http://dqf-api.ta-us.net/#!/Mapping/get_0_1)	
* Translation: [GET /v3/DQFTranslationId](http://dqf-api.ta-us.net/#!/Mapping/get_0_1_2)

By specifying the optional parameter of clientId in the respective requests, the API's identifier can be recalled for that entity with the aforementioned GETs. Example: A file can be posted for a master project, specify a *clientId=”test123”* and get the *dqfId* from the response (*dqfId=5*). The GET /v3/DQFFileId method can be used by specifying *clientId=”test123”* and get back *dqfId=5* as a response.

<a name="user"/>
## User
In order to retrieve basic user information use [GET /v3/user](http://dqf-api.ta-us.net/#!/User/get). To check if an email exists for a TAUS account use [GET /v3/user/{email}](http://dqf-api.ta-us.net/#!/User/get_0).

<a name="specs"/>
## API Specifications
Please refer to http://dqf-api.ta-us.net/ for a full set of the API’s specification.
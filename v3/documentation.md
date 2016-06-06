# DQF API v3.0 documentation

This document is for anyone who is interested in integrating with DQF using the DQF API v3.0

## Getting started
* [Authentication](#authentication)
* [Basic Attributes](#attributes)
* [Requests/Header](#requestsHeader)
* [Project/Master](#projectMaster)
* [Project/Child](#projectChild)
* [Translation](#translation)
* [Review](#review)
* [Target segments](#targetSegments)
* [User/Company Templates](#templates)
* [Mapping](#mapping)
* [User](#user)
* [API Specifications](#specs)

<a name="authentication"/>
## Authentication
* Every request must contain the header parameter **apiKey**, a _Universally Unique Identifier_ (_UUID_) which will be provided by us. The **apiKey** is application specific and used to identify the client that sends the requests. Every integrator will have one **apiKey**.	
* For secured endpoints, there should also be a header parameter **sessionId**.
* In order to obtain a **sessionId** one must call the [POST /v3/login](http://dqf-api.ta-us.net/#!/Authentication/login){:target="_blank"} endpoint.
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

``` {  "code": 6,   "message": {    "password": [  "This field is required"  ]  }} ```

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

There is no need to declare files for child projects as they have access to the master/root project files. A child project can get a list of files with [GET /v3/project/child/{projectId}/file](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile/getAll).

The [POST /v3/project/child/{projectId}/file/{fileId}/targetLang](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language/add) will be used next to declare the target language for the child project.
**Note:** A child project can declare any combination of files/targetLangs that are a **subset** of their **parents'** *file/targetLang* pairs. So building on the previous example, *child1* can declare *nl-NL* for file1 but not *nl-NL* for file2.

<a name="translation"/>
## Translation
To be able to post a translation, there must be a child project with a type of *translation*. The API supports two different alternatives for posting translations. The main distinguishing parameter among these two approaches is the prerequisite of *source segments*.

### Approach 1: Translation with source segments posted at master project level:
In this approach, all of a file's source segments have first to be uploaded at master project level. The [POST /v3/project/master/{projectId}/file/{fileId}/sourceSegment/batch](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0_1) should be used after the files for the master project have been declared. The *sourceSegments* body parameter should be a Json Array. Example (two source segments):

```
[
   {"sourceSegment":"Aenean fermentum.", "index":1,"clientId":"c352702c-75f7-4f08-ab4a-b71c1407b240"}, 
   {"sourceSegment":"Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.","index":2,"clientId":"43dee044-fc0e-4dcb-98a1-64aa49b702e3"}
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
The first thing would be to add the Review Settings that the user intends to apply. This can be accomplished with [POST /v3/project/master/{projectId}/reviewSettings](http://dqf-api.ta-us.net/#!/Project%2FMaster%2FReviewSettings/add) for master projects and 
[POST /v3/project/child/{projectId}/reviewSettings for child projects](http://dqf-api.ta-us.net/#!/Project%2FChild%2FReviewSettings/add).
By specifying the *templateName* parameter, the posted settings will also be saved as a user template (templates are described below). 
To create a review project use the 
[POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/{sourceSegmentId}/translation/{translationId}/review/](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment%2FReview/add_0)review method.
Three types of review projects are supported:

1. Error Review - i.e. selection of one or multiple error categories to be applied to:		
  * Whole segment		
  * Part of segment	
2. Correction - i.e. editing the existing translation
3. Combined (a combination of the above). For the error review part, again:		
  * Whole segment		
  * Part of segment

The sub-type will be automatically defined by the API , based on the non-required parameters that were included during the review settings post. These are the parameters needed for each type of review:

1. Error Review
  * errorCategoryId, severityId, time
  * errorCategoryId, severityId, time, characterPosStart, characterPosEnd
2. Correction
  * editedText, time, kudos
3. Combined
  * errorCategoryId, severityId, time, editedText, kudos
  * errorCategoryId, severityId, time, editedText, kudos, characterPosStart, characterPosEnd

**Note:** Review projects can also have translation projects as children. For example, a review project with a type of *Error Review* is created and completed. The review's parent project (let's assume a translation project) owner decides to send it again for translation. This should create a translation child for the aforementioned review project. Or he/she can send it for review *Correction* which would then have to create a review child project.

**Note:** The Kudos parameter, even if submitted, will not be immediately available to the users on the QD.

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
1. Project: [GET /v3/DQFProjectId](http://dqf-api.ta-us.net/#!/Mapping/get_0)
2. File: [GET /v3/DQFFileId](http://dqf-api.ta-us.net/#!/Mapping/get)
3. Source Segment: [GET /v3/DQFSegmentId](http://dqf-api.ta-us.net/#!/Mapping/get_0_1)	
4. Translation: [GET /v3/DQFTranslationId](http://dqf-api.ta-us.net/#!/Mapping/get_0_1_2)

By specifying the optional parameter of clientId in the respective requests, the API's identifier can be recalled for that entity with the aforementioned GETs. Example: A file can be posted for a master project, specify a *clientId=”test123”* and get the *dqfId* from the response (*dqfId=5*). The GET /v3/DQFFileId method can be used by specifying *clientId=”test123”* and get back *dqfId=5* as a response.

<a name="user"/>
## User
In order to retrieve basic user information use [GET /v3/user](http://dqf-api.ta-us.net/#!/User/get). To check if an email exists for a TAUS account use [GET /v3/user/{email}](http://dqf-api.ta-us.net/#!/User/get_0).

<a name="specs"/>
## API Specifications
Please refer to http://dqf-api.ta-us.net/ for a full set of the API’s specification.

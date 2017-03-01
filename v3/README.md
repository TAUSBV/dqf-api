# DQF API v3.0 Documentation

This document is intended for anyone who is interested in integrating DQF into their (translation) technology using the DQF API v3.0.
Please note that the DQF API is not related to DQF TOOLS (https://dqf.taus.net). If you are visiting the DQF Tool page, please keep in mind that DQF Tools play no role in the integration.

Before reading the documentation consider the following:
* You will most likely need to make UI changes to your tool when integrating DQF. We will provide recommendations in the relevant sections.
* You need to ensure that you can correctly map the functionalities and/or workflow steps with DQF. Before starting the integration, please contact the DQF Team and share your proposed mapping for verification.
* You need to ensure appropriate mapping between the users and/or user roles in your system and the TAUS user logins. Please discuss the user mapping directly with the DQF team in advance.

The documentation will explain in greater detail the hierarchical tree structure DQF relies on. You need to make sure you understand how the DQF tree maps onto your workflow options (e.g. split projects, workflow sequence) before scoping out other details of the integration. Please refer to the provided [overview schema](https://drive.google.com/file/d/0B5gqwLeATMtuZm8tR183OHFKQlE/view?usp=sharing) as initial example. 

For any questions related to the integration, please contact dqfapi@taus.net

## Getting started
* [Server Info](#servers)
* [Authentication](#authentication)
* [Authentication - Generic User Account](#genericUsers)
* [Basic Attributes](#attributes)
* [Requests/Header](#requestsHeader)
* [Project/Master](#projectMaster)
* [Project/Child](#projectChild)
* [Translation](#translation)
* [Target Segment Info](#targetSegments)
* [Review](#review)
* [Automated Review Projects](#automatedReview)
* [Project Status](#projectStatus)
* [Batch Upload](#batchUpload)
* [User/Company Templates](#templates)
* [Mapping](#mapping)
* [User](#user)
* [API Specifications](#specs)

<a name="servers"/>
## Server Info
During your development process, you **must** use the DQF Staging Server: 
* Site http://ta-us.net
* API http://dqf-api.ta-us.net
* Quality Dashboard http://qd.ta-us.net

The staging server is dedicated to integrators only. All new features and/or fixes are deployed here as well before going to the DQF production server. 
In order to use the staging server, you need to create an account using ta-us.net. TAUS does not provide test accounts for integration. Please create your account using the [Trial Membership](http://www.ta-us.net/all-memberships/subscribe-to/20-taus-free-trial-membership. ) option. The accounts will not expire despite the "trial" status. 
If you want to access the Quality Dashboard with your staging account, you may need to request some to the DQF Team. 
Please write to dqfapi@taus.net

Once your integration is completed, you must contact the DQF team in order to enable your application on the production server. Once this is done, you should switch your base URLs to our official ones:
* Site https://taus.net
* API https://dqf-api.taus.net
* Quality Dashboard https://qd.taus.net

<a name="authentication"/>
## Authentication
* Every request must contain the header parameter **apiKey**, a _Universally Unique Identifier_ (_UUID_) which will be provided by us. The **apiKey** is application specific and used to identify the client that sends the requests. Every integrator will have one **apiKey**.	
* For secured endpoints, there should also be a header parameter **sessionId**.
* In order to obtain a **sessionId** one must call the [POST /v3/login](http://dqf-api.ta-us.net/#!/Authentication/login) endpoint.
* The body parameters (_email, password_) are the user's encrypted and Base64 encoded credentials.	
* The encryption algorithm used is **AES/CBC/PKCS5PADDING**
* The encryption key will also be provided by us and will be valid on both servers (staging and production).

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

The **_initVector_** will also be provided by us. The initVector will remain the same for the production environment.
Should you decide to use your own initialization vector, it should be _16 Bytes_ and you must provide us with it.

The UI in the integrating tool should enable users to enter (and store) their TAUS DQF credentials. Please include the following text and URLs into your UI:
* "Don't have a TAUS account?" - Link to: https://www.taus.net/all-memberships/view-membership-details/64-taus-dqf-subscription
* "Forgot your TAUS password?" - Link to: https://www.taus.net/component/users/?view=reset
* "Forgot your TAUS email?" - Link to: https://www.taus.net/component/users/?view=remind

For testing/debugging purposes, we have enabled an encrypt endpoint which is accessible through 
[POST /v3/encrypt](http://dqf-api.ta-us.net/v3/encrypt). 
No authentication is required. The body parameters are:
* **email:** 	The user's email as plain text
* **password:** The user's password as plain text
* **key:** The encryption key

With a successful request you should get back your encrypted and Base64 encoded credentials.

**NOTE:** The _encrypt_ endpoint is not available in production and should not be used as part of your final implementation.

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
**NOTE:** For debugging and troubleshooting purposes, it is _critical_ that you can provide logs of the calls to the DQF server. The DQF Team strongly recommends to include UI elements containing the API responses in case of errors. Errors need to be reported to the DQF Team and the users need to be informed whenever the communication with the DQF server fails and ideally also when operations are concluded successfully.

<a name="genericUsers"/>
## Authentication - Generic User Account 
Integrators can now use a single TAUS generic account to perform the authentication. With this approach, users do not need a valid TAUS account while using the API clients. Generic accounts are provided by the DQF team at integrator (=tool) level. However, one integrator can request multiple generic accounts if their integration requires this. In order to obtain a generic account you should contact the DQF team. The generic account gets authenticated in the exact same way as [Authentication](#authentication) describes.
There is an extra header parameter required when using session ids that derive from generic accounts. In every such request you should include the user's email as the value of the **email** header.

**IMPORTANT!!!** Note that although users will be able to seamlessly use the DQF API with this approach, they will still need to create a TAUS account providing **the same email** used in the header in order to be able to view their reports in the [Quality Dashboard](http://qd.ta-us.net/). 

<a name="attributes"/>
## Basic Attributes
The following endpoints are used to retrieve the basic/static attributes of the API. No authentication is required for these. 
The basic attributes can be grouped according to their function. More details will be provided in the related sections:

<a name="projectSettings"/>
### DQF PROJECT SETTINGS
See [Master Project](#projectMaster) and [User/Company Templates](#templates)

You may require some mapping between your current values and the ones used in DQF. If this is the case, please notify the DQF Team.
* [GET /v3/contentType](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0)
* [GET /v3/industry](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2)
* [GET /v3/process](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4_5)
* [GET /v3/qualitylevel](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4_5_6)

**IMPORTANT:** Please use the term **Sector** on the UI where the API reads *Industry*.

The following call is no longer necessary after DQF has become compliant with the [BCP47 standard](https://tools.ietf.org/html/bcp47):
* [GET /v3/language](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3)

<a name="reviewSettings"/>
### DQF REVIEW SETTINGS
See [Review](#review) and [User/Company Templates](#templates)

We consider the current error category as stable with no changes expected in the near future. Should you use hard-coded values for the error categories or any other attribute in this list, please inform the DQF Team. If changes to the current values are required, we will notify integrators in due time.
* [GET /v3/errorCategory](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1)
* [GET /v3/severity](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4_5_6_7_8)

### DQF POSTING CONTENT
See [Child Project](#projectChild) and [Target segments](#targetSegments)

Please check whether the names in the responses for the _catTool_ and _mtEngine_ parameters, the name of tool you are integrating with DQF actually matches the name your tool uses for identification. If you notice any discrepancies (e.g. "MyMemory" vs. "MyMemory Plugin"), please report them to the DQF Team:
* [GET /v3/catTool](http://dqf-api.ta-us.net/#!/Basic_attributes/get)
* [GET /v3/mtEngine](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4)

The following attribute requires a clear mapping between DQF values and the values available in the tool. 
* [GET /v3/segmentOrigin](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4_5_6_7)

**IMPORTANT:** Please take a moment to review the [segment origin mapping document](https://drive.google.com/open?id=1sEvwAthP07YWNritEaInmG6w1p-xnyRZmvvh8zjxBTc) provided by TAUS and report any inconsistencies with your tool. You will need to use these parameters when posting [translations](#fields).

<a name="requestsHeader"/>
## Requests/Header
As already explained, every request to the DQF API (apart from the aforementioned basic attributes) should contain the ***apiKey*** and ***sessionId*** header parameters. For the project related requests you should also include the ***projectKey*** in the header. If you are using a generic account, then you should also include the **email** header parameter.

<a name="projectMaster"/>
## Project/Master
The (master) project is the core entity of the DQF API. The APIs hierarchy is based on a *tree structure where the root node is the master project*.

Please note that the concept of _project_ in DQF does not necessarily match the corresponding entity in your tool (e.g. "drop", "(split) job", "task", etc.). Make sure you correctly map your entities to the DQF project-tree structure. Ask the DQF Team for support, if needed.

A master project contains all of the basic attributes which are then inherited by child projects (see [Basic Attributes](#attributes)). Once the basic attributes are received, a master project needs to be created: [POST /v3/project/master](http://dqf-api.ta-us.net/#!/Project%2FMaster/add).

**IMPORTANT:** The basic attributes for a master project are the DQF Project Settings. We expect the user to be able to manually select these values directly from the UI, either in the form of individual values or as a template. Please make sure that you _do not_ post some arbitrarily defined default settings without giving the user the possibility to modify these. TAUS reserves the right to block data from a given integration should the database get 'polluted' with such non-user defined values. We strongly suggest that every integrator discusses with the DQF Team beforehand how DQF Project Settings will be collected.

**IMPORTANT:** Please use the term **Sector** on the UI where the API reads *Industry*.

After a successful post, the project *Id* and *UUID(dqfUUID)* will be returned as response. The *Id* should be used as path parameter whereas the *UUID* as a header parameter for subsequent requests. The master project owner will be identified from the *sessionID* in the header.

**NOTE:** There are ***no*** endpoints to post translation/review content to the master project, which is a setting/attribute container. It is necessary to create child projects for that purpose. However, a Master Project ***can*** contain _source text_ content (see the section [Translation](#approach1)).

The next step is to declare the project files. 
The [POST /v3/project/master/{projectId}/file](http://dqf-api.ta-us.net/#!/Project%2FMaster%2FFile/add) will be used for that. 
For validation and statistical reasons, the number of segments that are included in the file is required (*numberOfSegments*).

The final step for the master project setup would be a
[POST /v3/project/master/{projectId}/file/{fileId}/targetLang](http://dqf-api.ta-us.net/#!/Project%2FMaster%2FFile%2FTarget_Language/add) where the target languages are associated with the project files. The API allows any combination of files/targetLangs. For example _file1_ has _en-US_ and _nl-NL_ whereas _file2_ has only _en-US_ as target language. If files and/or languages are added and/or modified, the combinations need to be updated accordingly.

<a name="projectChild"/>
## Project/Child
A child project is used to handle the actual translation/revision work. To declare a child project the 
[POST /v3/project/child](http://dqf-api.ta-us.net/#!/Project%2FChild/add) has to be used. The parent's _UUID_ must be specified to create a parent/child relationship (remember that a hierarchical tree structure is used).  

**Example:** _Child1_ will declare the master project's UUID as the parentKey. Of course, Child1 can have as many siblings as needed. If then a child of _child1_ (_child1.1_) needs to be created, the same endpoint will be used but with the _child1 UUID_ as a parentKey. 

A Child Project can be of two types: *translation* or *review*. 
* A _translation_ Child Project should be used for all workflow steps until the translation is completed. 
* A _review_ Child Project should be used when a person appointed as reviewer would correct and/or mark errors in a translation. 

**Example:** If you are applying a TEP (Translation-Editing-Proofreading) approach followed by an "official" reveiw step, you may want to consider the Translation and Editing steps as DQF _translation_ steps and depending on how Proofreading is handled, you may consider it a _translation_ or _review_ step for DQF purposes. 

Each type of child project requires specific settings. These are specified in the [Translation](#translation) and [Review](#review) sections. By default, the Child Project will inherit the settings/basic attributes specified in the master project, but there can be exceptions (see [Review](#review) for more details).

**IMPORTANT:** In the current implementation, the "review only" scenario is _not_ supported. You will always need to have at least one child project of type _translation_ in a project tree.

You should post a DQF child project every time _at least_ one of these conditions is true:
* _There is a change in workflow step_ (if applicable)
* _There is a change in the user who is working on the project._ User should be understood from a DQF perspective as the TAUS account or email address associated with the requests. This can map 1:1 with the users shown in your system, but it may also not be the case. This condition also includes the scenario in which a Project Manager receives a project back and sends it to someone else, which would count as three different users.

Every child project has an associated _owner_. Generally speaking, the _owner_ is the TAUS account that is in use when making the request. You also have the possibility of declaring a different owner for a child project by specifying an email in the *assignee* parameter. This email must belong to an existing **TAUS account**. This is the case when the individual assignee is known at the moment of the POST request. Please note that for the purposes of the DQF hierarchy, an assignee does not have to actually perform the translation/review task. It could also just be a project manager who receives the assignment from their customer. This satisfies the second condition for posting a child project.

As a result, there will likely be more child projects posted than what you are able to show on your tool interface. This is fine. DQF will aggregate results as needed using the child projects in the workflow. The **important** thing for you to do is to make sure that _every new or returning user_ is assigned a new DQF child project, i.e. there are no gaps in the workflow steps from a DQF perspective.

**IMPORTANT:** As shown in the [overview schema](https://drive.google.com/file/d/0B5gqwLeATMtuZm8tR183OHFKQlE/view?usp=sharing), a child project can only have ***one*** parent project, while a parent project can have multiple child projects. Please keep this in mind when dealing with returned jobs and/or split jobs. Once the DQF project tree branches out, the branches need to be kept separate and cannot be merged back. This is one of the main differences between the DQF tree structure and your tool.

When posting the request, there is no need to declare files, as child projects have access to the master/root project files. A child project can get a list of the available files with [GET /v3/project/child/{projectId}/file](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile/getAll). The projectId here refers to the child project.

The [POST /v3/project/child/{projectId}/file/{fileId}/targetLang](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language/add) will be used next to declare the target language(s) of the child project.

**NOTE:** A child project can declare any combination of files/targetLangs that are a **subset** of the *file/targetLang* pairs of their **parent**. So building on the example above, *child1* can declare *nl-NL* for file1 but not *nl-NL* for file2.

<a name="translation"/>
## Translation
To be able to post translation-related content to DQF, there must be a child project of type *translation*. No specific project settings are needed as the required attributes are inherited from the parent/master project (see [DQF Project Settings](#projectSettings)). 
The API supports two  alternative ways for posting translation data. The main difference between these approaches lies in how the *sourceSegments* parameter is handled. Source segments can be sent to DQF in batch after creating a master project or they can be submitted together with the translated segment at child project level.

<a name="approach1"/>
### APPROACH 1: Source segments posted at _master_ project level & translations at _child_ level (_RECOMMENDED_)
In this approach, all source segments in a file/job have first to be uploaded at master project level. This means that translated segments will be posted separately with a different method. The [POST /v3/project/**master**/{projectId}/file/{fileId}/sourceSegment/batch](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0_1) should be used after declaring the files for the master project. The *sourceSegments* body parameter should be a Json Array. Example (two source segments):

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

The *index* refers to the sequential numbering of the segments in each file. The maximum allowed number of elements in the array is 100. Whenever a re-post of segments with the same index numbers is submitted, the old values will be overwritten. After each successful post, the DQF Id for each segment will be returned.
**Note:** During this process, the *numberOfSegments* declared at file posting cannot be exceeded.

When posting translation, child projects can access the source segment information through: [GET/v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/batch](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/get)
To post a translation in this scenario, the 
[POST/v3/project/**child**/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/{sourceSegmentId}/translation](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0) method should be used.

If you prefer not to send each translated segment individually, you have the possibility of uploading segments in [batch](#batchUpload).

<a name="approach2"/>
### APPROACH 2: Source segments and translations posted at translation _child_ project level
In this approach, source and target segments are posted at the same time using one single method:
[POST /v3/project/**child**/{projectId}/file/{fileId}/targetLang/{targetLangCode}/segment](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add). This method is almost identical to the POST/translation described above and only requires two additional parameters: 1) the source segment content and 2) its index numbering.

Please note that for this approach _no batch upload_ of full segments is currently available.

**Note:** It is strongly recommended the use of [Approach 1](#approach1). Even though it seems like extra effort (batch upload, an additional request), it will lead to a more robust solution.

Irrespective of the POST approach you decide to use, you will need to ensure that DQF receives all required information to produce accurate reports. This includes all relevant (source/target) segment and review information that complement that translated/reviewed content itself. Please consider carefully how you want to approach the submissions to DQF. If you need assistance please contact the DQF Team.

**IMPORTANT:** DQF requires all translated segments at least once while a DQF project is still of type _translation_. This is necessary both for statistical purposes as well as to enable subsequent POST calls in DQF review projects.

<a name="targetSegments"/>
## Target Segment Info
<a name="fields"/>
### Fields and Constraints
In all of the requests that include target segments (the aforementioned batch operation and the two approaches for translation), you will find the same parameters to describe a target segment based on its origin.

For the **segmentOriginId** you can choose between:

* MT (Machine Translation)
* TM (Translation Memory)
* Termbase
* Other
* HT (Human Translation)

If the segment's origin is of type **MT**, you must also specify the MT engine that was used to produce it (**mtEngineId**). If no match can be found in the DQF list ([GET /v3/mtEngine](http://dqf-api.ta-us.net/#!/Basic_attributes/get_0_1_2_3_4)), you can then use "Other" as the MT engine and then specify the name in the **mtEngineOtherName** parameter.

If the segment's origin is of type **TM**, you should also provide the match percentage of the memory (**matchRate**).

If a segment is empty, you can send an empty string for the **targetSegment** parameter and use **HT** as the segment's origin.

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
  * In the detailList we specify the revision type for each segment sub item. In our example, sub items were solely words but they can even be single characters. The allowed types are:
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
* The project’s type cannot be Review with a Review Type of ‘error_typology’. Only ‘correction’ and ‘combined’ Review projects are allowed
* There must be no direct Review children for the specified user and file/target-language combination
* The project must be a leaf in the tree hierarchy (after excluding projects that do not meet the criteria above)

The response will contain a list of all the Review projects that were created and a list of all the leaf projects that did not meet the aforementioned criteria alongside with the reason for that. You can retrieve the current Review Cycle projects at any time via [GET/v3/project/{projectId}/reviewCycle](http://dqf-api.ta-us.net).

<a name="projectStatus"/>
## Project Status
Currently, we allow the update of status for Child Projects only. This is accomplished through 
[PUT /v3/project/child/{projectId}/status](http://dqf-api.ta-us.net). The status values are: ‘initialized’, ‘assigned’, ‘inprogress’ and ‘completed’. The only allowed value you can update the status to currently is ‘completed’. You should use this as soon as a translation or a review task (that is mapped to a DQF child project) is done (ex. translator finishes and notifies PM). All the other statuses are automatically assigned through certain events in the API. You can retrieve a project’s current status via [GET /v3/project/child/{projectId}/status](http://dqf-api.ta-us.net). 

<a name="batchUpload"/>
### Batch Upload
Depending on your integration approach and triggers, you can choose among the available POST calls.
However, you need to ensure that DQF receives _**at least once**_ in a project tree **ALL** source and translated segments as well as segment info per file/target language combination. This is particularly important whenever there are e.g. pre-translated segments that do not get edited or reviewed by any user in the tree. 

**IMPORTANT:** DQF requires all translated segments at least once while a DQF project is still of type _translation_. This is necessary both for statistical purposes as well as to enable subsequent POST calls in DQF review projects.

If you are following [Approach 1](#approach1) for posting translations, you can use a method for batch upload of segments. The maximum allowed number of elements in a batch/array is 100. 

In order to send all the "untouched"/remaining translated segments (if any), you can use the batch operation [POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/targetSegment/batch](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0_1_2). This is similar to the batch source segments operation. To verify which source segments have target segment content the following method can be used:
[GET v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/batch](http://dqf-api.ta-us.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/get). This request will return all of the source segments of the file and a flag determining if any target content has been posted (during translation or review) for the specified target language.

**Note:** A target segment batch upload can take place at any time during the execution of the translation/review project. You will need to evaluate the available triggers. The final batch upload can be made e.g when a user is completes his/her part of the job or e.g. after the user has submitted the first segment. In this latter case, the edits made to a segment during translation/review will be send via a PUT call. 

**IMPORTANT:** If you are using [Approach 2](#approach2), you will still need to post each segment pair with separate calls.

<a name="templates"/>
## User/Company Templates
In order to enhance user experience, DQF attributes can be pre-populated by means of templates. Templates contain user-dependent DQF project attributes which can be called to quickly create new DQF (master) projects. Templates are created by (and associated to) a single user (= TAUS account) but they can be shared among users within the same organization by setting the *isPublic* parameter to *true*. From a UI perspective, there could be a step before posting a master project where the user creates/selects/edits/deletes templates.

There are two types of templates:
1. Project settings templates
2. Review settings templates

### Templates/Project
To post a project template use [POST /v3/user/projectTemplate](http://dqf-api.ta-us.net/#!/Template/add). 
This request includes all of the parameters that are required during a master project creation (*content type, industry, process, quality level* - see [DQF Project Settings](#projectSettings)) except *source language*. 
You can show the user a list of project templates he/she has access to through [GET /v3/user/projectTemplate](http://dqf-api.ta-us.net/#!/Template/getAll). This request should fetch all user’s templates plus any shared template within the organization. 

### Templates/Review
The same principle applies to Review templates. In addition to the *error category ids* and *severity* attributes specified in [DQF Review Settings](#reviewSettings), Review template also require the *review type* and, where applicable, *pass/fail threshold* and *severity weights*. Please note that the *sampling* attribute is not used in the Quality Dashboard.
You may want to avoid using templates for the review type *correction* as no additional attributed are actually required.

**IMPORTANT:** Please use the term **Error Annotation** on the UI where the API reads *error_typology*

To post a review template use [POST /v3/user/reviewTemplate](http://dqf-api.ta-us.net/#!/Template/add_0). 
To provide access to the user's and organization templates use GET /v3/user/reviewTemplate.

**Note:** A review can be created template automatically when posting review settings as described in the [Review](#review) section.

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

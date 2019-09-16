# DQF API v3.0 Documentation

This document is intended for anyone who is interested in integrating DQF into their (translation) technology using the DQF API v3.0.
Please note that the DQF API is **not** related to _DQF Tools_ (https://dqf.taus.net). If you are visiting the DQF Tools page, please keep in mind that DQF Tools play no role in the integration.

Before reading the documentation consider the following:
* You will most likely need to make UI changes to your tool when integrating DQF. We will provide recommendations in the relevant sections.
* You need to ensure that you can correctly map your functionalities and/or workflow steps with DQF. Before starting the integration, please contact the DQF Team and share your proposed mapping for verification.
* You need to ensure appropriate mapping between the users and/or user roles in your system and the TAUS user logins. Please discuss the user mapping directly with the DQF team in advance.

The documentation will explain in greater detail the hierarchical tree structure DQF relies on. Before scoping out other details of the integration, you need to make sure you understand how the DQF tree maps onto your workflow options (e.g. split projects, workflow sequence). Please refer to the provided [overview schema](https://drive.google.com/file/d/0B5gqwLeATMtuZm8tR183OHFKQlE/view?usp=sharing) as an initial example. 

TAUS encourages and actively supports DQF integration in translation technology in every way, and as much as possible. However, the quality of data sent to DQF is of essential concern to any appliance of the database by any of its users. TAUS therefore must insist on data quality and the proper use of the DQF API, even to the point of fencing off the API from integrations that do not adhere to the proper use of the DQF API. The TAUS team uses a checklist to evaluate DQF integrations. The integration checklist is public, and can be found here: https://github.com/TAUSBV/dqf-api/blob/master/v3/IntegratorChecklist.md.

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
* [Meta-Data Only](#metaDataOnly)
* [Automated Review Child Projects](#automatedReview)
* [Project Status](#projectStatus)
* [Batch Upload](#batchUpload)
* [User/Company Templates](#templates)
* [Mapping](#mapping)
* [User](#user)
* [API Specifications](#specs)

<a name="servers"/>

## Server Info
During your development process, you **must** use the DQF Staging Server: 
* API: https://dqf-api.stag.taus.net/
* DQF Dashboard: https://qd.stag.taus.net/

The staging server is dedicated to integrators only. All new features and/or fixes are deployed here before going to the DQF production server. 
In order to use the staging server, you first need to create an account. TAUS will provide test accounts for integration.  
If you want to access the DQF Dashboard with your staging account, you may need to request some credits to the DQF Team.
Please write to dqfapi@taus.net

Once your integration is completed, you must contact the DQF team in order to enable your application on the production server. After this, you should switch your base URLs to our official ones:
* Site: https://taus.net
* API: https://dqf-api.taus.net
* DQF Dashboard: https://qd.taus.net

<a name="authentication"/>

## Authentication
* Every request must contain the header parameter **apiKey**, a _Universally Unique Identifier_ (_UUID_) which will be provided by TAUS. The **apiKey** is application specific and used to identify the client that sends the requests. Every integrator will have one **apiKey**.	
* For secured endpoints, there should also be a header parameter **sessionId**.
* In order to obtain a **sessionId**, you must call the [POST /v3/login](https://dqf-api.stag.taus.net/#!/Authentication/login) endpoint.
* The body parameters (_email, password_) represent the user credentials - encrypted and Base64 encoded.	
* The encryption algorithm used is **AES/CBC/PKCS5PADDING**.
* The encryption key will also be provided by TAUS and will be valid on both servers (staging and production).

Below you see a simple Java code snippet for the encryption part using the javax.crypto lib:

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

The **_initVector_** will also be provided by TAUS. The initVector will remain the same for the production environment.
Should you decide to use your own initialization vector, it should be _16 Bytes_ and you must provide us with it.

The UI of the integrating tool should enable users to enter (and store) their TAUS DQF credentials (see [User](#user)). Please include the following text and URLs into your UI:
* "Don't have a TAUS account?" - Link to: https://www.taus.net/all-memberships/view-membership-details/64-taus-dqf-subscription
* "Forgot your TAUS password?" - Link to: https://www.taus.net/component/users/?view=reset
* "Forgot your TAUS email?" - Link to: https://www.taus.net/component/users/?view=remind

**Note:** If your company has signed a special marketing agreement about profit sharing with TAUS, you will be provided a separate personalized URL to redirect people to the signup page. Please contact dqf@taus.net to clarify and/or coordinate.

For testing/debugging purposes, we have enabled an encrypt endpoint which is accessible through 
[POST /v3/encrypt](https://dqf-api.stag.taus.net/v3/encrypt). 
No authentication is required. The body parameters are:
* **email:** The user's email as plain text
* **password:** The user's password as plain text
* **key:** The encryption key

With a successful request, you should get back your encrypted and Base64 encoded credentials.

**Note:** The _encrypt_ endpoint is **not** available in production and should not be used as part of your final implementation.

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

The code is DQF specific and should be used to report the nature of the problem to the DQF team.

**NOTE:** For debugging and troubleshooting purposes, it is _critical_ that you can provide logs of the calls to the DQF server. The DQF Team strongly recommends to include UI elements containing the API responses in case of errors. Errors need to be reported to the DQF Team and the users need to be informed whenever the communication with the DQF server fails and ideally also when operations are concluded successfully.

<a name="genericUsers"/>

## Authentication - Generic User Account 
Integrators can now use a single TAUS generic account to perform the authentication. With this approach, users do not need a valid TAUS account while using the API clients. Generic accounts are provided by the DQF team at integrator (=tool) level. However, one integrator can request multiple generic accounts if their integration requires this. In order to obtain a generic account, you should contact the DQF team. The generic account gets authenticated in the exact same way as [Authentication](#authentication) describes.

**IMPORTANT:** There is an extra header parameter required when using session ids that derive from generic accounts. In every such request, you should include the user's email as the value of the **email** header.

**Note:** Although users will be able to seamlessly use the DQF API with this approach, they will still need to create a TAUS account providing **the same email** used in the header in order to be able to view their reports in the [DQF Dashboard](https://qd.stag.taus.net/). 

<a name="attributes"/>

## Basic Attributes
The following endpoints are used to retrieve the basic/static attributes of the API. No authentication is required for these. 
The basic attributes can be grouped according to their function. More details will be provided in the related sections:

<a name="projectSettings"/>

### DQF PROJECT SETTINGS
See [Master Project](#projectMaster) and [User/Company Templates](#templates)

You may require some mapping between your current values and the ones used in DQF. If this is the case, please notify the DQF Team.
* [GET /v3/contentType](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0)
* [GET /v3/industry](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0_1_2)
* [GET /v3/process](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0_1_2_3_4_5)
* [GET /v3/qualitylevel](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0_1_2_3_4_5_6)

**IMPORTANT:** Please use the term **Sector** on the UI where the API reads *Industry*.

The following call is no longer necessary after DQF has become compliant with the [BCP47 standard](https://tools.ietf.org/html/bcp47):
* [GET /v3/language](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0_1_2_3)

<a name="reviewSettings"/>

### DQF REVIEW SETTINGS
See [Review](#review) and [User/Company Templates](#templates)

We consider the current error list as stable with no changes expected in the near future. Should you use hard-coded values for the error categories or any other attribute in this list, please inform the DQF Team. If changes to the current values are required, we will notify integrators in due time.
* [GET /v3/errorCategory](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0_1)
* [GET /v3/severity](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0_1_2_3_4_5_6_7_8)

For a full list of the Review Settings, please refer to the method [POST /v3/project/{projectId}/reviewSettings](https://dqf-api.stag.taus.net/#!/Project%2FReviewSettings/add).

### DQF POSTING CONTENT
See [Child Project](#projectChild) and [Target Segment Info](#targetSegments)

Please check whether the responses for the _catTool_ and _mtEngine_ parameters actually match the name your tool uses for identification. If you notice any discrepancies (e.g. "MyMemory" vs. "MyMemory Plugin"), please report them to the DQF Team:
* [GET /v3/catTool](https://dqf-api.stag.taus.net/#!/Basic_attributes/get)
* [GET /v3/mtEngine](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0_1_2_3_4)

The following attribute requires a clear mapping between DQF values and the values available in the tool. 
* [GET /v3/segmentOrigin](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0_1_2_3_4_5_6_7)

**IMPORTANT:** Please take a moment to review the [segment origin mapping document](https://drive.google.com/open?id=1sEvwAthP07YWNritEaInmG6w1p-xnyRZmvvh8zjxBTc) provided by TAUS and report any inconsistencies with your tool. You will need to use these parameters when posting [translations](#fields).

<a name="requestsHeader"/>

## Requests/Header
As already explained, every request to the DQF API (apart from the [Basic Attributes](#attributes)) should contain the ***apiKey*** and ***sessionId*** header parameters. For the project related requests, you should also include the ***projectKey*** in the header. If you are using a generic account, then you should also include the **email** header parameter.

<a name="projectMaster"/>

## Project/Master
The (master) project is the core entity of the DQF API. The APIs hierarchy is based on a *tree structure where the root node is the master project*.

Please note that the concept of _project_ in DQF does not necessarily match the corresponding entity in your tool (e.g. "drop", "(split) job", "task", etc.). Make sure you correctly map your entities to the DQF project-tree structure. Ask the DQF Team for support, if needed.

A master project contains all of the basic attributes which are then inherited by child projects (see [Basic Attributes](#attributes)). Once the basic attributes are received, a master project needs to be created: [POST /v3/project/master](https://dqf-api.stag.taus.net/#!/Project%2FMaster/add).

**IMPORTANT:** The basic attributes for a master project are the DQF Project Settings. We expect the user to be able to manually select these values directly from the UI, either in the form of individual values or as a [template](#templates). Please make sure that you _do not_ post some arbitrarily defined default settings without giving the user the possibility to modify these. TAUS reserves the right to block data from a given integration should the database get 'polluted' with such non-user-defined values. We strongly suggest that every integrator discusses with the DQF Team beforehand how DQF Project Settings will be collected.

**IMPORTANT:** Please use the term **Sector** on the UI where the API reads *Industry*.

After a successful post, the project *Id* and *UUID(dqfUUID)* will be returned as response. The *Id* should be used as path parameter whereas the *UUID* as a header parameter for subsequent requests. The master project owner will be identified from the *sessionID* in the header.

**NOTE:** There are ***no*** endpoints to post translation/review content to the master project, which is a setting/attribute container. It is necessary to create child projects for that purpose. However, a Master Project ***can*** contain _source text_ content (see the section [Translation](#approach1)).

The next step is to declare the project files. 
The [POST /v3/project/master/{projectId}/file](https://dqf-api.stag.taus.net/#!/Project%2FMaster%2FFile/add) will be used for that. 
For validation and statistical reasons, the number of segments that are included in the file is required (*numberOfSegments*).

The final step for the master project setup would be a
[POST /v3/project/master/{projectId}/file/{fileId}/targetLang](https://dqf-api.stag.taus.net/#!/Project%2FMaster%2FFile%2FTarget_Language/add) where the target languages are associated with the project files. The API allows any combination of files/targetLangs. For example, _file1_ has _en-US_ and _nl-NL_ whereas _file2_ has only _en-US_ as target language. If files and/or languages are added and/or modified, the combinations need to be updated accordingly.

<a name="projectChild"/>

## Project/Child
A child project is primarily used to handle the actual translation/revision work. However, it is also used to track all the users associated with a project workflow at each stage. To declare a child project, the 
[POST /v3/project/child](https://dqf-api.stag.taus.net/#!/Project%2FChild/add) must be used. The parent's _UUID_ must be specified to create a parent/child relationship (remember that a hierarchical tree structure is used).  

**Example:** _Child1_ will declare the master project's UUID as the parentKey. Of course, Child1 can have as many siblings as needed. If then a child of _child1_ (_child1.1_) needs to be created, the same endpoint will be used but with the _child1 UUID_ as a parentKey. 

A Child Project can be of two types: *translation* or *review*. 
* A _translation_ Child Project should be used for all workflow steps until the translation is completed. 
* A _review_ Child Project should be used when a person appointed as reviewer would correct and/or mark errors in a translation. 

**Example:** If you are applying a TEP (Translation-Editing-Proofreading) approach followed by an "official" review step, you may want to consider the Translation and Editing steps as DQF _translation_ steps and depending on how Proofreading is handled, you may consider it a _translation_ or _review_ step for DQF purposes. Please share your approach with the DQF Team before implementing it.

Each type of child project requires specific settings. These are specified in the [Translation](#translation) and [Review](#review) sections. By default, the child project will inherit the settings/basic attributes specified in the master project, but there can be exceptions (see [Review](#review) for more details).

**IMPORTANT:** In the current implementation, the "review only" scenario is _not_ supported. You will always need to have at least one child project of type _translation_ in a project tree.

You should post a DQF child project every time _at least_ one of these conditions is true:
* _There is a change in workflow step_ (if applicable, as seen from the perspective of the translation tool in use)
* _There is a change in the user who is working on the project._ "User" should be understood from a DQF perspective as the TAUS account or email address associated with the requests. This can map 1:1 with the users shown in your system, but it may also not be the case. This condition also includes the scenario in which a Project Manager receives a project back and sends it to someone else, which would count as three different users, hence child projects.

Generally speaking and by default, the user that opened the session in which the child project is created, is the assignee. The user associated with the parent project is the assigner (or customer) by implication, which is relevant for customer/vendor relations on the DQF Dashboard. You also have the possibility to specify the assigner in an explicit way, when it is not the user associated with the parent project. This is done by setting the assigner parameter when creating a child project. For example, this might be useful when a translation job goes from a first translator to a second translator, but both have the same assigner as their direct customer. Without the assigner parameter set to the customer's email, the child project of the second translator would have the first translator as its customer by implication. Another variant to this is to declare the assignee parameter using the customer's session (or email header when using generic authentication).

**IMPORTANT:** Depending on your mapping, you can have child projects that match the translation/review activity and other child projects that match e.g. some job distribution tasks performed by PMs. DQF requires posting of translation/review content, **whenever there is some trackable activity at editor level**, e.g. the editor gets opened and a few segments are modified or just made "active", irrespective of the specific role of the user (PM/translator/reviewer etc.).

As a result, there will likely be more child projects posted to DQF than what you would show on your tool interface. This is fine. DQF will aggregate results as needed using the child projects in the workflow. The **important** thing for you to do is to make sure that _every new or returning user_ is assigned a new DQF child project, i.e. there are no gaps in the workflow steps from a DQF perspective.

**IMPORTANT:** As shown in the [overview schema](https://drive.google.com/file/d/0B5gqwLeATMtuZm8tR183OHFKQlE/view?usp=sharing), a child project can only have ***one*** parent project, while a parent project can have multiple child projects. Please keep this in mind when dealing with returned jobs and/or split jobs. Once the DQF project tree branches out, the branches need to be kept separate and cannot be merged back. This is one of the main differences between the DQF tree structure and your tool.

When posting the request, there is no need to declare files, as child projects have access to the master/root project files. A child project can get a list of the available files with [GET /v3/project/child/{projectId}/file](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile/getAll). The projectId here refers to the child project.

The [POST /v3/project/child/{projectId}/file/{fileId}/targetLang](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language/add) will be used next to declare the target language(s) of the child project.

**NOTE:** A child project can declare any combination of files/targetLangs that are a **subset** of the *file/targetLang* pairs of their **parent**. Building on the example above, *child1* can declare *nl-NL* for file1 but not *nl-NL* for file2.

**NOTE:** A translation project can be marked as 'dummy' by using the optional *isDummy* parameter. By setting this to _true_, time spent in translation will not be taken into consideration. This is typically used by integrators who want to support **review only** workflows and/or do not have the means to track time spent per segment.

<a name="translation"/>

## Translation
To be able to post translation-related content to DQF, there must be a child project of type *translation*. No specific project settings are needed as the required attributes are inherited from the parent/master project (see [DQF Project Settings](#projectSettings)). 

**IMPORTANT: Whenever there is some trackable activity at editor level, you are expected to submit translation-related content to DQF.**

The API supports two  alternative ways for posting translation data. The main difference between these approaches lies in how the *sourceSegments* parameter is handled. Source segments can be sent to DQF in batch after creating a master project or they can be submitted together with the translated segment at child project level.

Irrespective of the POST approach you decide to use, you will need to ensure that DQF receives all required information to produce accurate reports. This includes all relevant (source/target) segment and review information that complement that translated/reviewed content itself. Please consider carefully how you want to approach the submissions to DQF. If you need assistance, please contact the DQF Team.

**IMPORTANT:** DQF requires all translated segments (edited or not) to be posted for _any child project directly associated with the translation activity_ (i.e. where activity in the editor takes place). This is necessary both for statistical purposes as well as to enable subsequent POST calls in DQF review projects.

**Note:** TAUS recommends posting segment content including tags and other markup (whenever available) as they are an integral part of the translation/review process. DQF will process tags internally.

<a name="approach1"/>

### APPROACH 1: Source segments posted at _master_ project level & translations at _child_ level (_RECOMMENDED_)
In this approach, all source segments in a file/job have first to be uploaded at master project level. This means that translated segments will be posted separately with a different method. If you prefer not to send each translated segment individually, you have the possibility of uploading segments in [batch](#batchUpload).
The [POST /v3/project/**master**/{projectId}/file/{fileId}/sourceSegment/batch](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0_1) should be used after declaring the files for the master project. The *sourceSegments* body parameter should be a Json Array. Example (two source segments):

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

When posting translation, child projects can access the source segment information through: [GET/v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/batch](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/get)
To post a translation in this scenario, the  
[POST/v3/project/**child**/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/{sourceSegmentId}/translation](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0) method should be used.


<a name="approach2"/>

### APPROACH 2: Source segments and translations posted at translation _child_ project level
In this approach, source and target segments are posted at the same time using one single method:
[POST /v3/project/**child**/{projectId}/file/{fileId}/targetLang/{targetLangCode}/segment](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add). This method is almost identical to the POST/translation described above and only requires two additional parameters: 1) the source segment content and 2) its index numbering.

**Please note that for this approach _no batch upload_ option for full segments is currently available.**

**Note:** It is strongly recommended to use [Approach 1](#approach1). Even though it seems like extra effort (batch upload, an additional request), it will lead to a more robust solution.


<a name="targetSegments"/>

## Target Segment Info
When posting target segment content, DQF distinguishes between two parameters:
* **Target Segment:** This represents the pre-existing content of a target segment that was pre-populated e.g. by machine translation or  a previous translation round. You should consider _targetSegment_ any content that makes a target segment field _not empty_. 
* **Edited Segment:** This represents the _newer_ content produced by human intervention (most likely). This does not necessarily mean that the content of the _editedSegment_ has to be different than that of the _targetSegment_. 

**Note:** DQF expects _target segment_ and _edited segment_ content with every POST call. There can be situation where _either_ parameter is null. _targetSegment_ can be null if no pre-translation existed for a given segment (i.e. the translation takes place from scratch). _editedSegment_ can be null if the user enters with the cursor in a segment that has no content and then moves away from that segment without adding any content.

DQF offers you the possibility to map index numbers between your tool and DQF. For this you will need to use the _clientId_ parameter. For more information on this feature, see the section [Mapping](#mapping).

<a name="fields"/>

### Parameters and Constraints
In all requests that include translated segment content both as individual segments or in batch, you will need to provide additional parameters that will be used as segment metadata for reporting purposes. These are: 

* **Segment Origin ID**
* Segment Origin Detail (if TM)
* Match Rate (if TM or MT)
* MT Engine ID (if MT)
* MT Engine Other Name (if MT)
* MT Engine Version (if MT)

For the **segmentOriginId** you can choose between:

* MT (Machine Translation)
* TM (Translation Memory)
* Termbase
* Other
* HT (Human Translation)

If the segment origin is of type **TM**, you should also provide the match percentage of the memory (*matchRate*) and optionally the name of the TM used in the _segmentOriginDetail_ field.

If the segment origin is of type **MT**, you must also specify the MT engine that was used to produce it (*mtEngineId*). If no match can be found in the DQF list ([GET /v3/mtEngine](https://dqf-api.stag.taus.net/#!/Basic_attributes/get_0_1_2_3_4)), you can use "Other" as the MT engine and then specify the name in the *mtEngineOtherName* parameter. However, if you do not find a match in the list due to differences in the name string (e.g. "MyMemory" vs. "MyMemory Plugin"), please report this to the DQF Team. Additionally, you can specify the MT Engine Version (_mtEngineVersion_) if you are interested in tracking different versions of the same MT Engine.

If a segment is (initially) empty, you can send an empty string for the **targetSegment** parameter and use **HT** as segment origin.

**Note:** In order to ensure that you submit the expected value, please take a moment to review the [segment origin mapping document](https://drive.google.com/open?id=1sEvwAthP07YWNritEaInmG6w1p-xnyRZmvvh8zjxBTc) provided by TAUS and report any inconsistencies with your tool. 

<a name="review"/>

## Review
Review projects are created as (direct) children of translation or other review projects. It is up to you to decide what part of the workflow should be mapped onto a DQF child project of type _review_. 

**IMPORTANT:** Please note that irrespective of the mapping you adopt, you **must** have at least one child project of type _translation_ in the tree before you can create a project of type _review_.

To create a review project, you need to use the method [POST /v3/project/child](https://dqf-api.stag.taus.net/#/Project/Child) and select ***Review*** as project type. You will also need to specify the [DQF Review Settings](#reviewSettings). This can be accomplished with [POST /v3/project/{projectId}/reviewSettings](https://dqf-api.stag.taus.net/#!/Project%2FReviewSettings/add).
By specifying the *templateName* parameter, the posted settings will also be saved as a template associated with the active user (see [User/Company Templates](#templates)). 

A review child project will also need to be assigned to a _type of review_. The sub-type will be automatically defined by the API, based on the optional parameters that are included during the review settings post. Three types of review projects are supported:

1. **Correction** (_correction_): The existing translation is edited/corrected 
2. **Error Annotation** (*error_typology*): The incorrect part(s) of a translation is/are marked using one or multiple error categories and severities. The errors can to be applied to:		
  	- Whole segment		
  	- Part of segment	
3. **Combined** (_combined_): Combination of the above. The existing translation is corrected and error categories are applied. Here too errors can apply to the whole segment or just a part.

**Note:** Review projects can also have projects of type _translation_ as children. For example, a review project with a type *Error Annotation* is created and completed. The owner of the parent project of this review project (let's assume a translation project)  decides to have the project go through a new translation round. Two options are possible:
* A new child of type _translation_ gets created that has the review project as parent. 
* A new child of type _review/correction_ gets created.

Which of the two options should be chosen ultimately depends on your implementation and your tool. 
Please keep in mind that the results on the reports will be different according to the chosen approach.

The review settings can be posted at master project level if they are known from the beginning of the project. Alternatively, they can be posted at child project level if e.g. 1) they are determined at a later stage 2) a different set of review settings is required for a review subset of the workflow. The TAUS account in use when the review settings are submitted is considered the ***initiator*** of the review cycle.

In order to post content to the created child project of type review, you need to use the method:
[POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/translation/{translationId}/batchReview](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment%2FReview/add).

This is the most complex request in the API.

The easiest way to explain this method is to display the request raw body data you will submit.

**Note:** Please pay attention to the terminology used:
* REVIEW = type of a child project and the POST method in the API
* REVISION = parameter in the json request body when posting a review. 

```json
{
    "overwrite": true,
    "batchId": "25980bfd-d909-4d6d-bd35-ecfc30d90db3",
    "revisions":
    [
        {
          "clientId": "b6a66581-53ae-4cdb-ba3c-5e9b8d8c7464",
          "comment": "Sample review comment",
          "errors": [
            {
              "errorCategoryId": 11,
              "severityId": 2,
              "charPosStart": null,
              "charPosEnd": null,
	      "isRepeated": false
            }
          ],
          "correction": {
            "content": "Some Test",
            "time": 10000,
            "detailList": [
             {
                "subContent": "Some ",
                "type": "added"
              },
              {
                "subContent": "Test  ",
                "type": "unchanged"
              }
            ]
          }
        }
    ]
}
```
### Json Body Parameters

* **batchId:** _Optional_. It is used for mapping purposes as it is returned with the response from the API.
* **overwrite:** _Required_. Its value (true/false) depends on how the integrator is handling the segment revisions. 
	- If this is set to true, the whole revision history of a segment should be posted every time the method is called (e.g. when saving a document after review) because it overwrites existing records in our end. 
	- If set to false, then only the new and un-posted revisions should be sent.
	- **IMPORTANT!!: Please note that currently _only_ the option TRUE is supported. This means that you need to repost the whole set of revision objects for a segment with any new post.**
* **revisions:** The core json object. Based on the applied Review Settings, the json content may differ. 
	- If the review settings are _correction only_, then the errors array should be omitted.
	- If the review settings are _error annotation only_, the correction object should be omitted. 
	**Note:** If there is no way to prevent the user from editing a translation (i.e. include the correction object in the API call), the corrections can still be posted but they will be not taken into consideration for reporting purposes. 
	- If the review settings include the _combined scenario_, both error array and correction objects are expected.

**IMPORTANT: A single _revisions_ object can contain multiple error annotations but only _one_ correction. Keep this in mind when posting reviewed content.**

Some comments on the other fields that may not be self-explanatory:

* The field _comment_ can be used to submit a comment about the review. This function should be supported by the tool UI first.
* The fields _charPosStart_ and _charPosEnd_ are zero based indexes. 
	- They are *both null* when an error annotation applies to the whole segment. 
	- If the user applies an error to a selected text, then the start and end positions of the selection have to be specified.
* The field _isRepeated_ is an optional boolean flag (set to false if ommited) that marks the annotation as a repeated occurence. In such a case the penalty points for the error's severity will not be taken into consideration.
* The field _content_ in the _correction_ object contains the whole text of the segment (**including deletions**). 
* In the _detailList_, we specify the type of change for each sub-segment item (_subContent_). Sub-segment items can be words or single characters. The allowed types are:
    * *unchanged*
    * *added*
    * *deleted* 


**EXAMPLE**

In this example, combined review settings are applied.
The segment "Test Segment" is being reviewed.

1. The reviewer marks the whole segment with a minor mistranslation error and the word "Segment" with a major fluency error.
2. Then the reviewer deletes the word "Segment". 
3. Before moving on to the next segment, the reviewer also leaves a review comment ('Sample review comment').
4. At a later point, the reviewer notices another error in the already corrected segment.
5. The reviewer adds the word "Some " at the beginning of the segment. (The text on the UI will now probably read "Some Test _Segment_", with strikethrough applied to the word "Segment"). The correction of the segment took 10 secs. 
6. Eventually, the reviewer applies a minor inconsistent terminology error to the word "Test ". 
7. After the second review of this segment, another comment is added ('Another review comment').
 
The series of actions should generate the json in the example below. 

```json
{
    "overwrite": true,
    "batchId": "25980bfd-d909-4d6d-bd35-ecfc30d90db3",
    "revisions":
    [
        {
          "clientId": "b6a66581-53ae-4cdb-ba3c-5e9b8d8c7464",
          "comment": "Sample review comment",
          "errors": [
            {
              "errorCategoryId": 11,
              "severityId": 2,
              "charPosStart": null,
              "charPosEnd": null
            },
            {
              "errorCategoryId": 2,
              "severityId": 3,
              "charPosStart": 5,
              "charPosEnd": 11
            }
          ]
        },

        {
          "clientId": "8556bed0-084d-4e22-8ad3-0f9a0a42a232",
          "comment": "Another review comment",
          "errors": [
            {
              "errorCategoryId": 24,
              "severityId": 2,
              "charPosStart": 5,
              "charPosEnd": 9
            }
          ],
          "correction": {
            "content": "Some Test Segment",
            "time": 10000,
            "detailList": [
             {
                "subContent": "Some ",
                "type": "added"
              },
              {
                "subContent": "Test ",
                "type": "unchanged"
              },
              {
                "subContent": "Segment",
                "type": "deleted"
              }
            ]
          }
        }
    ]
}
```

The body contains two revision objects, identified by the _clientId_. The second revision object is needed because a new review has been made for a segment that had already been reviewed once. Note that, in the second revision object, the _content_ parameter is still "Some Test Segment" even though the word "Segment" got deleted. Note also that the character indexes in the second revision object correctly identify the current position of the word "Test " (now preceded by "Some "). 

**Note:** The request content should be json serialized which means that key-value pairs should _not_ be used (as in x-www-form-urlencoded or form-data body) but a raw json body instead.


### Guidelines for Revisions Objects

You only have one API method to post reviews. Keep in mind that the _overwrite_ parameter is currently always TRUE. Please take a moment to consider some basic rules you need to follow when building your review request body. We will assume a _combined review_ approach. 

**IMPORTANT:** Please note that in order to be able to apply a review to a given segment, the corresponding parent project of type _translation_ will **have to** contain translated content as _editedSegment_.

There are multiple ways in which you can construct the request body but here we propose the most straightforward one. If you plan to construct your request in a different way, please notify the DQF Team.

Whenever a given user has selected a segment for review all activity (corrections and/or error annotations) taking place while the segment is active should be recorded into a _revisions_ object. If the same user returns to the segment at a later stage and performs additional review activity, a **new** _revisions_ object should be created to track the new changes. 

**IMPORTANT:** Please note that since the _overwrite_ parameter is TRUE, you should _not_ remove the existing _revisions_ objects for a given segment. Keep also in mind that a _revisions_ object can contain multiple error annotations but _only one_ correction. 

**Note:** This approach should be adopted whether or not the first review of a segment (_revisions_ object) has already been posted to DQF.

<a name="metaDataOnly"/>

## Meta-Data Only
If sharing the actual content (source, target or edited) is a restriciting factor for the integration, you can use one of the meta-data only endpoints:

* [POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/translation/{translationId}/batchReview/meta](https://dqf-api.stag.taus.net/#!/Meta-Data_Only/add) Add a review for a segment using only meta-data
* [PUT /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/{sourceSegmentId}/translation/{translationId}/meta](https://dqf-api.stag.taus.net/#!/Meta-Data_Only/update) Update the translation of a source segment providing only meta-data
* [POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/translation/batch/meta](https://dqf-api.stag.taus.net/#!/Meta-Data_Only/add_0) Batch upload meta-data for translations
* [POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/targetSegment/batch/meta](https://dqf-api.stag.taus.net/#!/Meta-Data_Only/add_0_1) Upload meta-data for the remaining target segments
* [POST /v3/project/master/{projectId}/file/{fileId}/sourceSegment/batch/meta](https://dqf-api.stag.taus.net/#!/Meta-Data_Only/add_0_1_2) Add meta-data only for source segments

All the endpoints above behave the same way as the normal ones (with content) with the only difference being that you have to specify the **word** and **character** counts and in some cases the **edit distance** as well.

Here is a json body example for batch source segment meta-data only post:
```json
[
  {
    "index": 1,
    "clientId": "ca6d8b8e-9eea-4994-9447-1441493f11d6",
    "wordCount": 49,
    "characterCount": 180
  },
  {
    "index": 2,
    "clientId": "68482232-75b6-4255-93fd-e27625a5536f",
    "wordCount": 34,
    "characterCount": 267
  },
  {
    "index": 3,
    "clientId": "2c6b0899-269a-4e46-b57a-e909546fc823",
    "wordCount": 20,
    "characterCount": 483
  }
]
```
Here is a json body example for batch translation meta-data only post:
```json
[
	{
		"sourceSegmentId": 1,
		"clientId": "8ab68bd9-8ae7-4860-be6c-bc9a4b276e37",
		"targetWordCount": 1,
		"targetCharacterCount": 10,
		"editedWordCount": 2,
		"editedCharacterCount": 20,
		"editDistance": 10,
		"time": 6582,
		"segmentOriginId": 5,
		"mtEngineId": null,
		"mtEngineOtherName": null,
		"matchRate": 0
	},
	{
		"sourceSegmentId": 2,
		"clientId": "e5e6f2ae-7811-4d49-89df-d1b18d11f591",
		"targetWordCount": 1,
		"targetCharacterCount": 10,
		"editedWordCount": 2,
		"editedCharacterCount": 20,
		"editDistance": 10,
		"time": 5530,
		"segmentOriginId": 2,
		"mtEngineId": null,
		"mtEngineOtherName": null,
		"matchRate": 100
	},
	{
		"sourceSegmentId": 3,
		"clientId": "e3e618e9-b228-4dc6-95b8-c1605147330d",
		"targetWordCount": 1,
		"targetCharacterCount": 10,
		"editedWordCount": 2,
		"editedCharacterCount": 20,
		"editDistance": 10,
		"time": 1000,
		"segmentOriginId": 1,
		"mtEngineId": 1,
		"mtEngineOtherName": null,
		"matchRate": 90
	},
	{
		"sourceSegmentId": 4,
		"clientId": "3083a16c-2b56-42ae-8238-4d88f8a28c5e",
		"targetWordCount": 1,
		"targetCharacterCount": 10,
		"editedWordCount": 2,
		"editedCharacterCount": 20,
		"editDistance": 10,
		"time": 1000,
		"segmentOriginId": 1,
		"mtEngineId": 40,
		"mtEngineOtherName": "An MT engine",
		"matchRate": 80
	}
]
```
**Calculations:** TODO - Provide information for word and character counts, edit distance calculation and if possible our own service

**Note:** You cannot update/overwrite a source/target/edited segment with meta-data only if it's content is already posted. The reverse operation is allowed though.

<a name="automatedReview"/>

## Automated Review Child Projects
DQF can be integrated in cloud-based as well non-cloud-based tools. The latter group will likely involve interactions between a Translation Management System and a CAT-tool. In order to facilitate the interactions between multiple tools this method has been devised specifically to support the review cycle. It is currently used to support the interactions between SDL WorldServer and SDL Trados Studio. 

**Note:** We consider this method only applicable to distinct tools where **not** all required information to POST child projects is available. Therefore, this endpoint should _not_ be relevant for cloud-based tools. 

If your tool is a TMS, needs to interact with a TMS or you believe this endpoint can be relevant for your integration, please contact the DQF Team to discuss the exact implementation.

<a name="projectStatus"/>

## Project Status
Currently, we allow the update of status for child projects only. This is accomplished through 
[PUT /v3/project/child/{projectId}/status](https://dqf-api.stag.taus.net). The status values are: _initialized_, _assigned_, _inprogress_ and _completed_. The only value you can actively update is _completed_. You should use this as soon as a translation or a review task (that is mapped to a DQF child project) is completed and workflow can move to the next step. You can map this to a UI element in your tool that triggers the completion of a workflow step. All the other statuses are automatically assigned through certain events in the DQF API. You can retrieve the project current status via [GET /v3/project/child/{projectId}/status](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FStatus/get). 

**Note:** Updating a project status to _completed_ is **not** binding for initiating a review child project. This means that a review child project can be created while the translation is still ongoing.

<a name="batchUpload"/>

## Batch Upload
Depending on your integration approach and triggers, you can choose among the available POST calls.

**IMPORTANT:** You need to ensure that DQF receives **ALL** source and translated segments (_targetSegment_ and _editedSegment_) for every child project that is associated with the actual translation activity as well as segment info per file/target language combination. This is particularly important whenever there are e.g. pre-translated segments that do not get edited or reviewed by any user in the tree. 

If you are following [Approach 1](#approach1) for posting translations, you can use two methods for batch upload of segments. The methods differ in that the first expects both _targetSegment_ and _editedSegment_ content whereas the second only requires _targetSegment_ content. Please see [Target Segment Info](#targetSegments) for the difference between the two segment types.
The maximum allowed number of elements in a batch/array is 100. 

* If you want to batch submit all translated segments that have been edited (= for which there is a new translated content and/or time information) within a translation type project, you need to use the method:
[POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/translation/batch](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0).
The segmentPairs body parameter should be a Json Array. Example (two segments):

```json
{
   "segmentPairs":[
      {
         "sourceSegmentId":1,
         "clientId":"8ab68bd9-8ae7-4860-be6c-bc9a4b276e37",
         "targetSegment":"",
         "editedSegment":"Proin interdum mauris non ligula pellentesque ultrices.",
         "time":6582,
         "segmentOriginId":5,
         "mtEngineId":null,
         "mtEngineOtherName":null,
         "matchRate":0
      },
      {
         "sourceSegmentId":2,
         "clientId":"e5e6f2ae-7811-4d49-89df-d1b18d11f591",
         "targetSegment":"Duis mattis egestas metus.",
         "editedSegment":"Duis mattis egostas ligula matus.",
         "time":5530,
         "segmentOriginId":2,
         "mtEngineId":null,
         "mtEngineOtherName":null,
         "matchRate":100
      }
   ]
}
```

To check whether a source segment has already a translation assigned you can use the following operation: 
[GET /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/batch](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/get). This request will return all source segments of the file and a flag determining if any target content has been posted for the specified target language.

* If you need to batch submit all remaining translated segments that were _not_ edited (e.g. 100% matches, locked segments, etc.) for which there is no additional metadata, you should use this other method:
[POST /v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/targetSegment/batch](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/add_0_1_2). This is similar to the batch source segments operation. 
The targetSegments body parameter should be a Json Array. Example (two segments):

```json
{
   "targetSegments":[
      {
         "targetSegment":"Proin interdum mauris non ligula pellentesque ultrices.",
         "sourceSegmentId":1,
         "segmentOriginId":1,
         "mtEngineId":40,
         "mtEngineVersion":"You can optionally specify detailed info about the MT engine",
         "mtEngineOtherName":"An MT engine not listed in DQF",
         "segmentOriginDetail":null
      },
      {
         "targetSegment":"Duis mattis egestas metus.",
         "sourceSegmentId":2,
         "segmentOriginId":2,
         "matchRate":100,
         "segmentOriginDetail":"You can optionally specify detailed info about the segment's origin"
      }
   ]
}
```


To verify which source segments have target segment content the following method can be used:
[GET v3/project/child/{projectId}/file/{fileId}/targetLang/{targetLangCode}/sourceSegment/batch](https://dqf-api.stag.taus.net/#!/Project%2FChild%2FFile%2FTarget_Language%2FSegment/get). This request will return all source segments of the file and a flag determining if any target content has been posted for the specified target language. **This method can in fact be replaced by the method above, which allows for _null_ values for _editedSegment_.**

**Note:** A target segment batch upload can take place at _any time_ during the execution of the translation/review project. You will need to evaluate the available triggers in your tool. A batch upload can be made e.g. when a user completes his/her part of the job or e.g. after the user has submitted the first segment. In this latter case, the edits made to a segment during translation/review will be send via a PUT call. 

**IMPORTANT:** If you are using [Approach 2](#approach2), you will still need to post each segment pair with separate calls until a dedicated batch upload call is implemented.

<a name="templates"/>

## User/Company Templates
In order to enhance user experience, DQF attributes can be pre-populated by means of templates. Templates contain user-dependent DQF project attributes which can be called to quickly create new DQF (master) projects. Templates are created by (and associated to) a single user (= TAUS account). Templates can be shared among users within the same organization by setting the *isPublic* parameter to *true*. From a UI perspective, there could be a step before posting a master project where the user creates/selects/edits/deletes templates. Please note that the API will throw an error if the same user posts two templates with the same _values_ **OR** _name_.

There are two types of templates:
1. Project settings templates
2. Review settings templates

### Templates/Project
To post a project template use [POST /v3/user/projectTemplate](https://dqf-api.stag.taus.net/#!/Template/add). 
This request includes all of the parameters that are required during a master project creation (*content type, industry, process, quality level* - see [DQF Project Settings](#projectSettings)) except *source language*. 
You can show the user a list of project templates he/she has access to through [GET /v3/user/projectTemplate](https://dqf-api.stag.taus.net/#!/Template/getAll). This request should fetch all user’s templates plus any shared template within the organization. 

### Templates/Review
The same principle applies to Review templates. In addition to the *error category ids* and *severity* attributes specified in [DQF Review Settings](#reviewSettings), Review template also require the *review type* and, where applicable, *pass/fail threshold* and *severity weights*. Please note that the *sampling* attribute is not used in the DQF Dashboard.
You may want to avoid using templates for the review type *correction* as no additional attributed are actually required.

**IMPORTANT:** Please use the term **Error Annotation** on the UI where the API reads *error_typology*

To post a review template use [POST /v3/user/reviewTemplate](https://dqf-api.stag.taus.net/#!/Template/add_0). 
To provide access to the user's and organization templates use [GET /v3/user/reviewTemplate](https://dqf-api.stag.taus.net/#!/Template/getAll_0).

**Note:** A Project or Review template can also be created automatically when posting project/review settings by using the _templateName_ parameter available in the methods: 

* [POST /v3/project/master](https://dqf-api.stag.taus.net/#!/Project%2FMaster/add)
* [POST /v3/project/{projectId}/reviewSettings](https://dqf-api.stag.taus.net/#!/Project%2FReviewSettings/add)

<a name="mapping"/>

## Mapping
A client-API identifier mapping for the following entities is provided:
* Project: [GET /v3/DQFProjectId](https://dqf-api.stag.taus.net/#!/Mapping/get_0)
* File: [GET /v3/DQFFileId](https://dqf-api.stag.taus.net/#!/Mapping/get)
* Source Segment: [GET /v3/DQFSegmentId](https://dqf-api.stag.taus.net/#!/Mapping/get_0_1)	
* Translation: [GET /v3/DQFTranslationId](https://dqf-api.stag.taus.net/#!/Mapping/get_0_1_2)

By specifying the optional parameter of clientId in the respective requests, the API identifier can be recalled for that entity with the aforementioned GETs. Example: A file can be posted for a master project, specify a *clientId=”test123”* and get the *dqfId* from the response (*dqfId=5*). The GET /v3/DQFFileId method can be used by specifying *clientId=”test123”* and get back *dqfId=5* as a response.

<a name="user"/>

## User
In order to retrieve basic user information, use [GET /v3/user](https://dqf-api.stag.taus.net/#!/User/get). 
To check if an email exists for a TAUS account, use [GET /v3/user/{email}](https://dqf-api.stag.taus.net/#!/User/get_0).

<a name="specs"/>

## API Specifications
Please refer to https://dqf-api.stag.taus.net/ for a full set of the API specification.

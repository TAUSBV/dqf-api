# Integrator checklist
The DQF API has requirements for and restrictions on POST requests in order to get data that is needed for DQF purposes. To maintain high quality data, however, validation according to the API restrictions alone is not enough.

For integrations of DQF in CAT tools, the TAUS team uses a checklist to make sure that the CAT tool integration uploads valid and compliant data to the DQF database. The DQF team regularly checks on the DQF integrations. TAUS reserves the right to block data from a given integration if the integration fails to comply with any of the below points  and thus posts data that pollutes the DQF database.

## Conceptually correct integrations
Conceptually correct refers to the goals and the possibilities of the CAT tool. These need to be in accordance with what DQF is aiming for. General concepts such as workflow, type of tasks, project ownership, etcetera are checked in this part.

- [ ] General compliance of integrator to customer/vendor workflow as presupposed in DQF<br/>
This check requires that the integrator has or can simulate a workflow in which a customer outsources translation and possibly review jobs to vendors.<br/>
**Refer to** "DQF API v3.0 Documentation", sections "Project/Master" and "Project/Child"<br/>
Comments: <input type="text" id="GeneralWorkflowCompliance"/>

- [ ] Integrator posts projects as master and child projects in the correct way<br/>
The integrator posts master projects as starting points for translation workflows, and posts child projects descending from the master project or from other child project, in the correct way that it reflects the reallife workflow of translation projects.<br/>
**Refer to** "DQF API v3.0 Documentation", sections "Project/Master" and "Project/Child"<br/>
Comments: <input type="text" id="MasterChildCompliance"/>

- [ ] Integrator posts projects with the correct owners<br/>
The integrator assigns the correct DQF account to each (child) project.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Project/Child"<br/>
Comments: <input type="text" id="OwnershipCompliance"/>

- [ ] Integrator posts projects correctly with regards to project succession<br>
child projects point to the correct parent for following the succession of edits in the segments, and use the correct owner_id ('assigner') for indicating the customer. Old: child projects point to the correct parent project, and get the proper 'is_return' flag (is_return flag is deprecated for integrators; this will be automatically set when the owner of a childproject also owns a ancestor project).<br/>
**Refer to** "DQF API v3.0 Documentation", section "Project/Child"<br/>
Comments: <input type="text" id="SuccessionCompliance"/>

- [ ] General compliance of integrator to translation and review task<br/>
The integrator supports translation and/or review tasks ('review only' tasks are not supported in DQF, so for review-only integrators, a translation cycle should be provided by a different tool, or simulated in the review-only tool).<br/>
**Refer to** "DQF API v3.0 Documentation", section "Project/Child"<br/>
Comments: <input type="text" id="SuccessionCompliance"/>

- [ ] Integrator posts translations before review (whenever there is review)<br/>
**Refer to** "DQF API v3.0 Documentation", section "Project/Child"<br/>
Comments: <input type="text" id="TaskCompliance"/>

- [ ] Integrator posts tasks correctly in the project table<br/>
The integrator set the task attribute correctly when posting a project.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Project/Child"<br/>
Comments: <input type="text" id="TaskCompliance"/>

- [ ] General compliance of integrator with DQF translation model<br/>
The integrator fits in the model in which one source language is segmented in chunks of text, and is translated to one or more target languages.<br/>
Comments: <input type="text" id="TaskCompliance"/>

## Checks on meaningful data
Meaningful data refers to the same or similar ways in which different integrators collect DQF data. Where it involves user data configured by certain user interfaces, this means that technical and non-technical accessibility of these user interfaces are comparable among the integrators. Other data should conform to the intended types and standards of DQF. 

- [ ] Integrator allows user to log in correctly and easy<br/>
The integrator has a clear login screen, or a clear setting/preference in the user profile where the user can manage his DQF credentials (DQF credentials should be kept save, in an encrypted environment, as per the legal agreement).<br/>
**Refer to** "DQF API V3.0 Documentation", section "Basic Attributes"<br/>
Comments: <input type="text" id="ProjectsettingsAccess"/>

- [ ] Integrator allows user to customize the project settings when creating master projects. The selection method is clear and easily accessible<br/>
The integrator posts meaningful project settings (content type, sector, process and quality level of the translation project). When the user needs to select these settings, the selection method is transparent.<br/>
**Refer to** "DQF API V3.0 Documentation", section "Basic Attributes"<br/>
Comments: <input type="text" id="ProjectsettingsAccess"/>

- [ ] Integrator does not offer default or otherwise biased project settings when creating master projects<br/>
Integrators do not offer any set of project settings by default. The DQF user has to follow his or her own judgement when selecting the project settings.<br/>
**Refer to** "DQF API V3.0 Documentation", section "Basic Attributes"<br/>
Comments: <input type="text" id="ProjectsettingsSelection"/>

- [ ] Integrator posts language and language code correctly<br/>
**Refer to** "DQF API v3.0 Documentation", sections "Project/Master" and "Project/Child"<br/>
Comments: <input type="text" id="LanguageCode"/>

- [ ] Integrator allows the user to select error categories for review settings<br/>
Users are able to select a set of error categories ("review settings"). These settings should be clear and accessible.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Review"<br/>
Comments: <input type="text" id="SelectableErrorCategories"/>

- [ ] Integrator complies to DQF error categories, and uses these categories in its user interface<br/>
The integrator posts and uses the DQF error categories. The correct terms are important, as DQF relies on common understanding.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Review"<br/>
Comments: <input type="text" id="DQFErrorCategores"/>

- [ ] Integrator uses a clear unbiased interface to apply error categories<br/>
The interface to apply error categories during error annotation is easy to use, and is not biased towards any error categories.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Review"<br/>
Comments: <input type="text" id="UnbiasedErrorCategories"/>

- [ ] Integrator maps correctly to error severities<br/>
The user can mark errors as 'neutral', 'minor', 'major', or 'critical'. The integrator might opt for different terms/severities in the user interface, but mapping to the DQF severities should follow the general sentiment of these terms.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Review"<br/>
Comments: <input type="text" id="DQFErrorSeverities"/>

- [ ] Integrator uses a clear unbiased interface to apply error severities<br/>
The interface to apply error severities during error annotation is easy to use, and is not biased towards any error severities.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Review"<br/>
Comments: <input type="text" id="UnbiasedErrorSeverities"/>

- [ ] General compliance and postings of integrator with DQF segment origins<br/> 
The segment origins of the integrator are those that are used in DQF (MT, TM with match rate ranging from 0 to 100, Termbase, Other, human translation).<br/>
**Refer to** "DQF API v3.0 Documentation", section "Target Segment Info"<br/>
Comments: <input type="text" id="SegmentOrigin"/>

## Factual correctness
Data sent to DQF should be factually correct: editing times and integrator id should be posted correctly.

- [ ] Integrator sends correct integrator id<br/>
**Refer to** "DQF API v3.0 Documentation", section "Basic Attributes"<br/>
Comments: <input type="text" id="IntegratorID"/>

- [ ] Integrator sends correct editing times in milliseconds<br/>
**Refer to** "DQF API v3.0 Documentation", section "Target Segment Info"<br/>
Comments: <input type="text" id="EditingTime"/>

- [ ] Integrator sends correct editing times in milliseconds for multiple visits of a segment<br/>
**Refer to** "DQF API v3.0 Documentation", section "Target Segment Info"<br/>
Comments: <input type="text" id="EditingTimeAccumulation"/>

## Completeness
Data sent to DQF should be complete.

- [ ] Integrator sends all segments in a translation task<br/>
All segments in a translation job is sent to DQF, and not only segments that were edited or 'touched' during translation.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Translation"<br/>
Comments: <input type="text" id="CompleteSegments"/>

- [ ] Integrator sends all correction data for review projects<br/>
All information regarding corrections is passed to DQF, including deletions and additions of sub-segments.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Review"<br/>
Comments: <input type="text" id="EditingTimeAccumulation"/>

- [ ] Integrator sends all error annotation data for review projects<br/>
Each error annotation is passed to DQF, including all information about the annotation.<br/>
**Refer to** "DQF API v3.0 Documentation", section "Review"<br/>
Comments: <input type="text" id="EditingTimeAccumulation"/>

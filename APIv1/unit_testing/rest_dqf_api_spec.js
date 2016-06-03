
var frisby = require('frisby');

// the URL needs to be terminated with slash!!!
var url = 'https://dqf.taus.net/';

//Add here your project manager and translator key to run the tests!!!!
var project_manager_key = '';
var translator_key = '';

//Nested calls to test the project creation process
//Create a project and assign a task to a translator as a project manager
//The translator adds the segments
//Operations about projects - Add a new project to dqf
frisby.create('Create project')
.post(url + 'api/v1/productivityProject?name=Frisby_Project_PM&quality_level=1&process=2&source_language=nl-NL&contentType=3&industry=4')
.inspectJSON()
.inspectHeaders()
.addHeader('DQF_PMANAGER_KEY', project_manager_key)
.expectStatus(200)
.expectHeader('Content-Type', 'application/json')
.expectBodyContains('The project has been successfully created!')

//Get the translator with the traslator key
.after(function (err, res, body) {
	//Get the keys required to create a task from the headers of the project creation process
	projectId = res.headers['project_id'];
	projectKey = res.headers['project_key'];

	//Operations about the translators - Test Translators - Retrieve own information - The translators will be able to retrieve the id,name and email of their own.
	frisby.create('Get the translator for the task, run after first is completed')
	.get(url + 'api/v1/translator/')
	.inspectJSON()
	.inspectHeaders()
	.addHeader('DQF_TRANSLATOR_KEY', translator_key)
	.expectStatus(200)

	.afterJSON(function (translator) {
		//Operations about tasks - Task creation testing - Add target languages and translators to a project
		frisby.create('Create task as project manager, run after second is completed')
		.post(url + 'api/v1/productivityProject/' + projectId + '/task?target_language=en-US&file_name=test%20file%20name&translatorid=' + translator.user_id)
		.inspectJSON()
		.inspectHeaders()
		.addHeader('DQF_PMANAGER_KEY', project_manager_key)
		.addHeader('DQF_PROJECT_KEY', projectKey)
		.expectStatus(200)

		//Operations about segments - Segment creation testing - Add segments for a task
		.after(function (err, res, body) {
			//Get the keys required to create a task from the headers of the project creation process
			taskId = res.headers['task_id'];
			frisby.create('Create segment as a translator, run after third is completed')
			.post(url + 'api/v1/productivityProject/' + projectId + '/task/' + taskId + '/segment?source_segment=add%20source%20segment&target_segment=add%20target%20segment&new_target_segment=add%20new%20target%20segment&time=1000&tm_match=80&cattool=2&mtengine=3&mt_engine_version=v1.0')
			.inspectJSON()
			.addHeader('DQF_TRANSLATOR_KEY', translator_key)
			.addHeader('DQF_PROJECT_KEY', projectKey)
			.expectStatus(200)

			//Operations about projects - Test Find Projects by id - Project Managers can read a project by specifying its id.
			.after(function (err, res, body) {
				frisby.create('Find Projects by id')
				.get(url + 'api/v1/productivityProject/' + projectId)
				.addHeader('DQF_PMANAGER_KEY', project_manager_key)
				.inspectJSON()
				.expectStatus(200)
				.expectHeader('Content-Type', 'application/json')

				//Operations about tasks - Test Find task by id - Get the task of a project as PM
				.after(function (err, res, body) {
					frisby.create('Find task by id')
					.get(url + 'api/v1/productivityProject/' + projectId + '/task/' + taskId)
					.addHeader('DQF_PMANAGER_KEY', project_manager_key)
					.addHeader('DQF_PROJECT_KEY', projectKey)
					.inspectJSON()
					.inspectHeaders()
					.expectStatus(200)
					.expectHeader('Content-Type', 'application/json')

					// Operations about the translators - Project Managers Retrieve translator information - Get a translator as a project manager
					.after(function (err, res, body) {
						frisby.create('PM Get translator')
						.get(url + 'api/v1/translator?translatorid=' + translator.user_id + '&name=' + translator.user_name + 'email=' + translator.user_email)
						.addHeader('DQF_PMANAGER_KEY', project_manager_key)
						.inspectJSON()
						.inspectHeaders()
						.expectStatus(200)
						.expectHeader('Content-Type', 'application/json')

						//Operations about the translators - Translators update own information
						.after(function (err, res, body) {
							frisby.create('Update translator')
							//Test the update with the same translator details for now
							.put(url + 'api/v1/translator/' + translator.user_id + '?name=' + translator.user_name + '&email=' + translator.user_email)
							.addHeader('DQF_TRANSLATOR_KEY', translator_key)
							.inspectJSON()
							.inspectHeaders()
							.expectStatus(200)
							.expectHeader('Content-Type', 'application/json')

							//Operations about tasks - Update the translator of a task by specifying the task id.
							.after(function (err, res, body) {
								frisby.create('Update the translator of a task')
								.put(url + 'api/v1/productivityProject/' + projectId + '/task/' + taskId + '/translator?translatorid=' + translator.user_id)
								.addHeader('DQF_PMANAGER_KEY', project_manager_key)
								.addHeader('DQF_PROJECT_KEY', projectKey)
								.inspectJSON()
								.inspectHeaders()
								.expectStatus(200)
								.expectHeader('Content-Type', 'application/json')
								.toss()
							})
							.toss()
						})
						.toss()
					})
					.toss()
				})
				.toss()
			})
			.toss()
		})
		.toss()
	})
	.toss()
})
.toss()

//Nested calls to test the project creation process
//Create a project as a Project manager and then create tasks as translator(own assignment)
//The translator adds the segments
//Operations about projects - Add a new project to dqf
frisby.create('Create project')
.post(url + 'api/v1/productivityProject?name=Frisby_Project_TR&quality_level=1&process=2&source_language=nl-NL&contentType=3&industry=4')
.inspectJSON()
.inspectHeaders()
.addHeader('DQF_PMANAGER_KEY', project_manager_key)
.expectStatus(200)
.expectHeader('Content-Type', 'application/json')
.expectBodyContains('The project has been successfully created!')

.after(function (err, res, body) {
	//Get the keys required to create a task from the headers of the project creation process
	projectIdTR = res.headers['project_id'];
	projectKeyTR = res.headers['project_key'];
	//Operations about tasks - Create a task as a translator
	frisby.create('Create task as translator, run after first is completed')
	.post(url + 'api/v1/productivityProject/' + projectIdTR + '/task?target_language=en-US&file_name=test%20file%20name')
	.inspectJSON()
	.inspectHeaders()
	.addHeader('DQF_TRANSLATOR_KEY', translator_key)
	.addHeader('DQF_PROJECT_KEY', projectKeyTR)
	.expectStatus(200)

	//Operations about segments - Segment creation testing
	.after(function (err, res, body) {
		//Get the keys required to create a task from the headers of the project creation process
		taskIdTR = res.headers['task_id'];
		frisby.create('Create segment as a translator, run after third is completed')
		.post(url + 'api/v1/productivityProject/' + projectIdTR + '/task/' + taskIdTR + '/segment?source_segment=add%20source%20segment&target_segment=add%20target%20segment&new_target_segment=add%20new%20target%20segment&time=1000&tm_match=80&cattool=2&mtengine=3&mt_engine_version=v1.0')
		.inspectJSON()
		.addHeader('DQF_TRANSLATOR_KEY', translator_key)
		.addHeader('DQF_PROJECT_KEY', projectKeyTR)
		.expectStatus(200)

		//Operations about segments - Segment update testing
		.after(function (err, res, body) {
			//Get the keys required to create a task from the headers of the project creation process
			segmentIdTR = res.headers['segment_id'];
			frisby.create('Update a segment as a translator, run after third is completed')
			.put(url + 'api/v1/productivityProject/' + projectIdTR + '/task/' + taskIdTR + '/segment/' + segmentIdTR + '?source_segment=update%20source&target_segment=update%20target&new_target_segment=update%20new%20target&time=2000&tm_match=80&mtengine=10&mt_engine_version=v.10')
			.inspectJSON()
			.addHeader('DQF_TRANSLATOR_KEY', translator_key)
			.addHeader('DQF_PROJECT_KEY', projectKeyTR)
			.expectStatus(200)

			//Operations about segments review - Segment review creation testing
			.after(function (err, res, body) {
				frisby.create('Create segment review as a translator')
				.post(url + 'api/v1/productivityProject/' + projectIdTR + '/task/' + taskIdTR + '/segment/' + segmentIdTR + '/review?errorLevel1Id=1&errorLevel2Id=1&severity=critical&kudos=false&comment=test&time=10000&characterPosStart=10&characterPosEnd=20&editedText=test%20edited%20text')
				.inspectJSON()
				.addHeader('DQF_TRANSLATOR_KEY', translator_key)
				.addHeader('DQF_PROJECT_KEY', projectKeyTR)
				.expectStatus(200)

				//Operations about segments review - Segment review update testing
				.after(function (err, res, body) {
					reviewIdTR = res.headers['review_id'];
					frisby.create('Update segment review as a translator')
					.put(url + 'api/v1/productivityProject/' + projectIdTR + '/task/' + taskIdTR + '/segment/' + segmentIdTR + '/review/' + reviewIdTR + '?errorLevel1Id=1&errorLevel2Id=1&severity=minor&kudos=false&comment=updated%20review&time=10000&characterPosStart=10&characterPosEnd=20&editedText=test%20edited%20text')
					.inspectJSON()
					.addHeader('DQF_TRANSLATOR_KEY', translator_key)
					.addHeader('DQF_PROJECT_KEY', projectKeyTR)
					.expectStatus(200)

					//Operations about projects - Test Find Projects by id - Translators can read a project by specifying its id.
					.after(function (err, res, body) {
						frisby.create('Find Projects by id')
						.get(url + 'api/v1/productivityProject/' + projectIdTR)
						.addHeader('DQF_TRANSLATOR_KEY', translator_key)
						.inspectJSON()
						.expectStatus(200)
						.expectHeader('Content-Type', 'application/json')

						//Operations about tasks - Get the task of a project as TR
						.after(function (err, res, body) {
							frisby.create('Find task by id')
							.get(url + 'api/v1/productivityProject/' + projectIdTR + '/task/' + taskIdTR)
							.addHeader('DQF_TRANSLATOR_KEY', translator_key)
							.addHeader('DQF_PROJECT_KEY', projectKeyTR)
							.inspectJSON()
							.inspectHeaders()
							.expectStatus(200)
							.expectHeader('Content-Type', 'application/json')

							//Operations about projects - Test the endpoint to find the task of a project
							.after(function (err, res, body) {
								frisby.create('Get project task list')
								.get(url + 'api/v1/productivityProject/' + projectIdTR + '/task/')
								.addHeader('DQF_PMANAGER_KEY', project_manager_key)
								.inspectJSON()
								.expectStatus(200)
								.expectHeader('Content-Type', 'application/json')

								//Operations about the translators - Get the translators of a project
								.after(function (err, res, body) {
									frisby.create('PM Get translators of a project')
									.get(url + 'api/v1/translator/' + projectIdTR + '/')
									.addHeader('DQF_PMANAGER_KEY', project_manager_key)
									.addHeader('DQF_PROJECT_KEY', projectKeyTR)
									.inspectJSON()
									.inspectHeaders()
									.expectStatus(200)
									.expectHeader('Content-Type', 'application/json')
									.toss()
								})
								.toss()
							})
							.toss()
						})
						.toss()
					})
					.toss()
				})
				.toss()
			})
			.toss()
		})
		.toss()
	})
	.toss()
})
.toss()

//Operations about the project managers - Test project managers - Retrieve own information - The project managers will be able to retrieve the id,name and email of their own.
frisby.create('Get the project managers info')
.get(url + 'api/v1/projectmanager/')
.inspectJSON()
.inspectHeaders()
.addHeader('DQF_PMANAGER_KEY', project_manager_key)
.expectStatus(200)
.toss()

// //Create a translator - commented for now, name and email have to be specified
// frisby.create('Create translator')
//   .post(url + 'api/v1/translator?name=Frisby%20user&email=frisby@test.com')
// 	.inspectJSON()
// 	.inspectHeaders()
//     .expectStatus(200)
//     .expectHeader('Content-Type', 'application/json')
//     .expectBodyContains('The translator was successfully added to the database')
// .toss()


//Operations about Computer-assisted translation tools
//Test the GET CAT tools endpoint
frisby.create('Get CAT Tools list')
.get(url + 'api/v1/cattools/')
.expectStatus(200)
.expectHeader('Content-Type', 'application/json')
.expectJSON('?', {
	id : 1,
	name : '<none>',
	archive : 0,
	id : 2,
	name : 'Across',
	archive : 0,
	id : 3,
	name : 'Cloudwords',
	archive : 0,
	id : 4,
	name : 'Coach',
	archive : 0,
	id : 5,
	name : 'Conyac',
	archive : 0,
	id : 6,
	name : 'Easyling',
	archive : 0,
	id : 7,
	name : 'Gengo',
	archive : 0,
	id : 8,
	name : 'Globalsight',
	archive : 0,
	id : 9,
	name : 'Google Translator Toolkit',
	archive : 0,
	id : 10,
	name : 'Kinetic Globalizer',
	archive : 0,
	id : 11,
	name : 'Language Studio',
	archive : 0,
	id : 12,
	name : 'MateCat',
	archive : 0,
	id : 13,
	name : 'MemoQ',
	archive : 0,
	id : 14,
	name : 'Memsource',
	archive : 0,
	id : 15,
	name : 'MultiTRANS',
	archive : 0,
	id : 16,
	name : 'OmegaT',
	archive : 0,
	id : 17,
	name : 'Ontram',
	archive : 0,
	id : 18,
	name : 'Plunet',
	archive : 0,
	id : 19,
	name : 'SDL TMS',
	archive : 0,
	id : 20,
	name : 'SmartCAT',
	archive : 0,
	id : 21,
	name : 'SmartMATE',
	archive : 0,
	id : 22,
	name : 'TDC Globalink',
	archive : 0,
	id : 23,
	name : 'Trados Studio',
	archive : 0,
	id : 24,
	name : 'Transit - Star',
	archive : 0,
	id : 25,
	name : 'Translation Workspace',
	archive : 0,
	id : 26,
	name : 'Wordbee',
	archive : 0,
	id : 27,
	name : 'Wordfast',
	archive : 0,
	id : 28,
	name : 'Wordfish',
	archive : 0,
	id : 29,
	name : 'Worldserver',
	archive : 0,
	id : 30,
	name : 'XTM Cloud',
	archive : 0,
	id : 31,
	name : 'XTRF',
	archive : 0,
	id : 32,
	name : 'Lingotek',
	archive : 0
})
.toss()

//Operations about Content Type
//Test the GET Content type endpoint
frisby.create('Get Content type list')
.get(url + 'api/v1/contenttype/')
.expectStatus(200)
.expectHeader('Content-Type', 'application/json')
.expectJSON('?', {
	id : 1,
	name : 'Audio/Video Content',
	archive : 0,
	id : 2,
	name : 'DGT Documents',
	archive : 1,
	id : 3,
	name : 'Marketing Material',
	archive : 0,
	id : 4,
	name : 'Online Help',
	archive : 0,
	id : 5,
	name : 'Social Media',
	archive : 0,
	id : 6,
	name : 'Training Material',
	archive : 0,
	id : 7,
	name : 'User Documentation',
	archive : 0,
	id : 8,
	name : 'User Interface Text',
	archive : 0,
	id : 9,
	name : 'Website Content',
	archive : 0,
	id : 10,
	name : 'Knowledge Base',
	archive : 0,
	id : 11,
	name : 'Legal',
	archive : 0
})
.toss()

//Operations about industry
//Test the GET Industry endpoint
frisby.create('Get Industry list')
.get(url + 'api/v1/industry/')
.expectStatus(200)
.expectHeader('Content-Type', 'application/json')
.expectJSON('?', {
	id : 1,
	name : 'Automotive',
	archive : 0,
	id : 2,
	name : 'Chemicals',
	archive : 0,
	id : 3,
	name : 'Computer Hardware',
	archive : 0,
	id : 4,
	name : 'Computer Software',
	archive : 0,
	id : 5,
	name : 'Consumer Electronics',
	archive : 0,
	id : 6,
	name : 'Energy, Water and Utilities',
	archive : 0,
	id : 7,
	name : 'Financials',
	archive : 0,
	id : 8,
	name : 'Healthcare',
	archive : 0,
	id : 9,
	name : 'Industrial Electronics',
	archive : 0,
	id : 10,
	name : 'Industrial Manufacturing',
	archive : 0,
	id : 11,
	name : 'Legal Services',
	archive : 0,
	id : 12,
	name : 'Leisure, Tourism and Arts',
	archive : 0,
	id : 13,
	name : 'Medical Equipment and Supplies',
	archive : 0,
	id : 14,
	name : 'Pharmaceuticals and Biotechnology',
	archive : 0,
	id : 15,
	name : 'Professional and Business Services',
	archive : 0,
	id : 16,
	name : 'Public Sector',
	archive : 0,
	id : 17,
	name : 'Stores and Retail Distribution',
	archive : 0,
	id : 18,
	name : 'Telecommunications',
	archive : 0,
	id : 19,
	name : 'Undefined Sector',
	archive : 0,
	id : 20,
	name : 'Religion',
	archive : 0
})
.toss()

//Operations about MT engines
//Test the GET MT Engines endpoint
frisby.create('Get MT Engines list')
.get(url + 'api/v1/mtengines/')
.expectStatus(200)
.expectHeader('Content-Type', 'application/json')
.expectJSON('?', {
	id : 1,
	name : '<none>',
	archive : 0,
	id : 2,
	name : 'Apertium',
	archive : 0,
	id : 3,
	name : 'Apertium-Moses Hybrid',
	archive : 0,
	id : 4,
	name : 'Asia Online',
	archive : 0,
	id : 5,
	name : 'Bing Translator',
	archive : 0,
	id : 6,
	name : 'Capita MT',
	archive : 0,
	id : 7,
	name : 'Carabao MT',
	archive : 0,
	id : 8,
	name : 'CCID Translation Platform',
	archive : 0,
	id : 9,
	name : 'CrossLang',
	archive : 0,
	id : 10,
	name : 'East Linden',
	archive : 0,
	id : 11,
	name : 'Firma8',
	archive : 0,
	id : 12,
	name : 'FreeT',
	archive : 0,
	id : 13,
	name : 'Google Translate',
	archive : 0,
	id : 14,
	name : 'Iconic',
	archive : 0,
	id : 15,
	name : 'KantanMT',
	archive : 0,
	id : 16,
	name : 'Kodensha',
	archive : 0,
	id : 17,
	name : 'LDS Translator',
	archive : 0,
	id : 18,
	name : 'Linguasys',
	archive : 0,
	id : 19,
	name : 'Lucy Software',
	archive : 0,
	id : 20,
	name : 'Microsoft Translator Hub',
	archive : 0,
	id : 21,
	name : 'Moses',
	archive : 0,
	id : 22,
	name : 'MyMemory',
	archive : 0,
	id : 23,
	name : 'myMT',
	archive : 0,
	id : 24,
	name : 'Opentrad',
	archive : 0,
	id : 25,
	name : 'PangeaMT',
	archive : 0,
	id : 26,
	name : 'Pragma',
	archive : 0,
	id : 27,
	name : 'PROMT',
	archive : 0,
	id : 28,
	name : 'Reverso',
	archive : 0,
	id : 29,
	name : 'Safaba',
	archive : 0,
	id : 30,
	name : 'SDL BeGlobal',
	archive : 0,
	id : 31,
	name : 'Sovee',
	archive : 0,
	id : 32,
	name : 'Systran',
	archive : 0,
	id : 33,
	name : 'T-Text',
	archive : 0,
	id : 34,
	name : 'Tauyou',
	archive : 0,
	id : 35,
	name : 'Toshiba',
	archive : 0,
	id : 36,
	name : 'TransSphere',
	archive : 0,
	id : 37,
	name : 'Weblio',
	archive : 0,
	id : 38,
	name : 'WebTrance',
	archive : 0,
	id : 39,
	name : 'weMT',
	archive : 0,
	id : 40,
	name : 'Other',
	archive : 0,
	id : 41,
	name : 'SmartMATE',
	archive : 0,
	id : 42,
	name : 'SDL Language Cloud',
	archive : 0
})
.toss()

//Operations about processes
//Test the GET process endpoint
frisby.create('Get process list')
.get(url + 'api/v1/process/')
.expectStatus(200)
.expectHeader('Content-Type', 'application/json')
.expectJSON('?', {
	id : 5,
	name : 'Human',
	api_supported : 1,
	id : 2,
	name : 'MT+PE',
	api_supported : 1,
	id : 1,
	name : 'MT+PE+Human',
	api_supported : 0,
	id : 3,
	name : 'MT+PE+TM+Human',
	api_supported : 1,
	id : 4,
	name : 'TM+Human',
	api_supported : 1
})
.toss()

//Operations about quality_level
//Test the GET Quality level endpoint
frisby.create('Get Quality level list')
.get(url + 'api/v1/qualitylevel/')
.expectStatus(200)
.expectHeader('Content-Type', 'application/json')
.expectJSON('?', {
	id : 1,
	name : 'Good Enough',
	id : 2,
	name : 'Similar or equal to human translation'
})
.toss()

//Operations about languages
//Test the GET Languages endpoint
frisby.create('Get Language list')
.get(url + 'api/v1/languages/')
.expectStatus(200)
.expectHeader('Content-Type', 'application/json')
.expectJSON([
		"af-ZA",
		"ar-EG",
		"ar-SA",
		"ar-AE",
		"ar-AR",
		"eu-ES",
		"be-BY",
		"bg-BG",
		"zh-HK",
		"zh-CN",
		"zh-TW",
		"hr-HR",
		"cs-CZ",
		"da-DK",
		"nl-BE",
		"nl-NL",
		"en-AU",
		"en-CA",
		"en-ZA",
		"en-GB",
		"en-US",
		"et-EE",
		"fa-IR",
		"fi-FI",
		"fr-BE",
		"fr-CA",
		"fr-FR",
		"el-GR",
		"ht-HT",
		"hu-HU",
		"is-IS",
		"id-ID",
		"ja-JP",
		"ko-KR",
		"lv-LV",
		"lt-LT",
		"mk-MK",
		"ms-MY",
		"mt-MT",
		"nb-NO",
		"nn-NO",
		"pl-PL",
		"pt-BR",
		"pt-PT",
		"ro-RO",
		"ru-RU",
		"sk-SK",
		"sl-SI",
		"es-EM",
		"es-XL",
		"es-MX",
		"es-ES",
		"sv-SE",
		"th-TH",
		"tr-TR",
		"uk-UA",
		"vi-VN",
		"cy-GB",
		"sq-AL",
		"sm-SM",
		"hy-AM",
		"az-AZ",
		"ka-GE",
		"tl-PH",
		"to-TO",
		"fj-FJ",
		"ty-TY",
		"sw-SW",
		"mg-MG",
		"hi-IN",
		"cb-CB",
		"it-IT",
		"de-DE",
		"he-IL",
		"ca-ES",
		"gl-ES",
		"es-US",
		"mn-MN",
		"es-UY"
	])
.toss()

//ErrorLevel1 Testing
frisby.create('Get Error Level 1')
.get(url + 'api/v1/errorLevel1/')
.inspectJSON()
.expectHeader('Content-Type', 'application/json')
.expectStatus(200)
.after(function (err, res, body) {
	jArr = JSON.parse(body);
	
	//ErrorLevel2 Testing
	for (i = 0; i < jArr.length; i++) {
		obj = jArr[i];
		id = obj.id;
		process.stdout.write('\n' + id);
		frisby.create('Get Error Level 2 for ErrorLevel1=' + id)
		.get(url + 'api/v1/errorLevel1/' + id + '/errorLevel2/')
		.inspectJSON()
		.expectHeader('Content-Type', 'application/json')
		.expectStatus(200)
		.toss()
	}
})
.toss()

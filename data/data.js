app.data = {
	"site":{
		"version":"1.0",
		"langauge_code":"EN",
		"title":"Google Cloud Services | Platform City"
	},

	"url":"https://showcase.withgoogle.com/demo/cloud-city/",
	"twitterShareCopy":"Manage your own city and see how easy @googlecloud makes it to scale your services to the cloud",
	"hashtags":"google, googlecloud",

	"info":{
		"steps":[
			{
				"name":"step1",
				"style":"",
				"title": "Mapa interativo <div class='vegaxp'>VegaXP!</div>",
				"text":"<b>Uma iniciativa de <img class='labsit' src='' /> <br /><br />EVENTO DE CULTURA GEEK, ENSINO E ARTES <br /> DE 19 A 22 DE SETEMBRO <br /> EM ESPAÇOS DA UEPB E DA UFCG<br /> NA CIDADE DE CAMPINA GRANDE - PB",
				"buttonText":"Começar",
				"nextState":"step1-2"
			},
			{
				"name":"step2",
				"style":"left customBackground narrow",
				"title": "Prédio",
				"text":"so um exemplo de zoom por enquanto.",
				"buttonText":"Voltar",
				"nextState":"step1-2"
			},
		]
	},

	// styles = default, large, small, left
	"tooltips":[
		{ "style":"leftShort", "text":"Click to close"},
		{ "style":"small", "text":"Click to modernize building"},
		{ "style":"default", "text":"Drag and drop building"},
		{ "style":"default", "text":"Draw road"},
		{ "style":"large", "text":"Click to modernize & migrate automatically"},
		{ "style":"leftShort", "text":"Activate"},
		{ "style":"default", "text":"Drag barricade to restrict traffic"},
		{ "style":"default", "text":"Click to build version 2.0"},
		{ "style":"default", "text":"Remove barricade"},
		{ "style":"default", "text":"Upgrade to 2.0"},
		{ "style":"default", "text":"Future service"}
	],


	"models":[
		{"file":"assets/models/building_01.fbx","name":"building_01"},
		{"file":"assets/models/building_02.fbx","name":"building_02"},
		{"file":"assets/models/building_03.fbx","name":"building_03"},
		{"file":"assets/models/building_04.fbx","name":"building_04"},
		{"file":"assets/models/platforms.fbx","name":"platforms"},
		{"file":"assets/models/cars.fbx","name":"platforms"},
		{"file":"assets/models/bamf.fbx","name":"bamf"}


	],

	"textures":[
		{"file":"assets/models/texture_master.jpg","name":"texture_master"},
		{"file":"assets/models/texture_car_blue.jpg","name":"car_blue"},
		{"file":"assets/models/texture_car_green.jpg","name":"car_green"},
		{"file":"assets/models/texture_car_red.jpg","name":"car_red"},
		{"file":"assets/models/texture_car_yellow.jpg","name":"car_yellow"}

	],

	"soundAssets":[
		{"file":"assets/sounds/cloudcity_sound.mp3","name":"ambient","loop": true, "volume": 1.0,"html5":false},
		{"file":"assets/sounds/click.mp3","name":"click","loop": false, "volume": 0.0,"html5":false}


	]
}
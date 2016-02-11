export default 
angular.module("quizAppMaster")
.config(function($translateProvider) {
	$translateProvider
	.translations('en', enLang)
	.translations('ru', ruLang)
	.determinePreferredLanguage()
	.fallbackLanguage('ru')
})
.directive('translation', function(){
	
	return {
		transclude: true,
		restrict: 'C',
		templateUrl: i18nTemplate
	}
})

const i18nTemplate = require('./angular_templates/i18nControlTemplate.html')

console.log('template: ', i18nTemplate);

const ruLang = {
	DROP_DROP_HERE: "Перетащить вопросы сюда",
	
	CONNECT_BTN_NAME: "Соединение",
	CONNECT_QUIZ_ID: "ИД опроса",
	
	SEND_NEW_QUIZ: "Начать",
	
	DOWNLOAD_RESULT: "Скачать результат",
	
	COLUMN_ID: "Номер вопроса",
	COLUMN_QUESTON: "Вопрос",
	COLUMN_ANSWERS: "Ответы",
	COLUMN_CORRECT_ANSWERS: "Правильные ответы",
	
	SPREADSHEET_QUIZ_ID: "ИД опроса",
	SPREADSHEET_QUESTON_ID: "ИД вопроса/вопрос",
	SPREADSHEET_ANSWERS: "Правильные ответы/Пользовательские ответы",
	
	GENERATE_QUANTITY: "Количество",
	GENERATE_ADD: "Добавить группу",
	GENERATE_REMOVE: "Удалить группу",
	GENERATE_GENERATE: "Создать"	
}

const enLang = {
	DROP_DROP_HERE: "Drop here",
	
	CONNECT_BTN_NAME: "Connect",
	CONNECT_QUIZ_ID: "Quiz ID",
	
	SEND_NEW_QUIZ: "Start",
	
	DOWNLOAD_RESULT: "Download result",
	
	COLUMN_ID: "id",
	COLUMN_QUESTON: "Queston",
	COLUMN_ANSWERS: "Answers",
	COLUMN_CORRECT_ANSWERS: "Correct answers",
	
	SPREADSHEET_QUIZ_ID: "Quiz ID",
	SPREADSHEET_QUESTON_ID: "Queston ID/Queston",
	SPREADSHEET_ANSWERS: "Correct answers/User answers",

	GENERATE_QUANTITY: "Quantity",
	GENERATE_ADD: "Add group",
	GENERATE_REMOVE: "Remove group",
	GENERATE_GENERATE: "Generate"	
}
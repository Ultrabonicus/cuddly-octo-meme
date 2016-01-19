export default 
angular.module("quizAppMaster")
.config(function($translateProvider) {
	$translateProvider
	.translations('en', enLang)
	.translations('ru', ruLang)
	.determinePreferredLanguage()
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
	COLUMN_CORRECT_ANSWERS: "Правильные ответы"
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
	COLUMN_CORRECT_ANSWERS: "Correct answers"
}
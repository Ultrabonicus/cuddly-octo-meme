export default angular.module("quizAppUser")
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

const ruLang = {
	CONNECT_BUTTON: "Соединение",
	CONNECT_QUIZ_ID: "ИД задания",
	CONNECT_USER_ID: "ИД пользователя",
	
	ASSIGMENT_NAME: "Задание",
	
	COLUMN_ID: "Номер вопроса",
	COLUMN_QUESTON: "Вопрос",
	COLUMN_ANSWERS: "Варианты ответов"
}

const enLang = {
	CONNECT_BUTTON: "Connect",
	CONNECT_QUIZ_ID: "Quiz ID",
	CONNECT_USER_ID: "User ID",
	
	ASSIGMENT_NAME: "Assigment",
	
	COLUMN_ID: "id",
	COLUMN_QUESTON: "Queston",
	COLUMN_ANSWERS: "Answers"
}

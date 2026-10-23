/** Экран итога BaseResult, объявление BaseBanner и согласие на cookies BaseCookieConsent */
export const ruResult = {
	/** Заголовки по умолчанию: заменяются пропом `title` */
	TITLE_SUCCESS: 'Готово',
	TITLE_INFO: 'Информация',
	TITLE_WARNING: 'Требуется внимание',
	TITLE_ERROR: 'Что-то пошло не так',
	TITLE_403: 'Доступ запрещён',
	TITLE_404: 'Страница не найдена',
	TITLE_500: 'Ошибка сервера',
	/** Описания кодов по умолчанию: заменяются пропом `description` */
	DESCRIPTION_403: 'У вас нет прав для просмотра этой страницы.',
	DESCRIPTION_404: 'Возможно, адрес набран с ошибкой или страница была удалена.',
	DESCRIPTION_500: 'На сервере произошла ошибка. Попробуйте повторить позже.',
}

export const ruBanner = {
	/** Доступное имя области объявления (`aria-label`) */
	LABEL: 'Объявление',
}

export const ruCookieConsent = {
	TITLE: 'Мы используем cookies',
	DESCRIPTION: 'Они нужны для работы сайта и помогают сделать его лучше. Выберите, какие cookies разрешить.',
	ACCEPT_ALL: 'Принять все',
	REJECT_ALL: 'Отклонить все',
	ACCEPT_SELECTED: 'Только выбранные',
	CUSTOMIZE: 'Настроить',
	CUSTOMIZE_CLOSE: 'Свернуть настройки',
	/** Доступное имя списка категорий */
	CATEGORIES: 'Категории cookies',
	/** Пометка обязательной категории: её нельзя выключить */
	REQUIRED: 'Всегда включены',
}

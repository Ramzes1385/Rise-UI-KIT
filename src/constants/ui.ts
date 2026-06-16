/**
 * Глобальные константы UI-библиотеки.
 * Используются для устранения магических чисел и строк в компонентах.
 */

/** Текст по умолчанию для пустого состояния таблицы */
export const UI_EMPTY_TEXT = 'Нет данных'

/** Текст по умолчанию для пустого состояния поиска */
export const UI_NO_RESULTS_TEXT = 'Ничего не найдено'

/** Текст по умолчанию для плейсхолдера поиска */
export const UI_SEARCH_PLACEHOLDER = 'Поиск...'

/** Текст кнопки перехода к текущей дате в календаре */
export const UI_TODAY_TEXT = 'Сегодня'

/** Текст загрузки */
export const UI_LOADING_TEXT = 'Загрузка...'

/** Текст aria-label загрузки */
export const UI_LOADING_ARIA = 'Загрузка'

/** Текст кнопки "Загрузить еще" */
export const UI_LOAD_MORE_TEXT = 'Загрузить еще'

/** Текст ошибки загрузки изображения */
export const UI_IMAGE_ERROR_TEXT = 'Ошибка загрузки'

/** Текст "Загружено" (статус файла) */
export const UI_FILE_STATUS_DONE = 'Загружено'

/** Текст "Ошибка" (статус файла) */
export const UI_FILE_STATUS_ERROR = 'Ошибка'

/** Текст "Ожидание" (статус файла) */
export const UI_FILE_STATUS_PENDING = 'Ожидание'

/** Текст кнопки "Удалить" */
export const UI_DELETE_TEXT = 'Удалить'

/** Текст "Без цвета" в color picker */
export const UI_NO_COLOR_TEXT = 'Без цвета'

/** Текст кнопки "Пропустить тур" */
export const UI_SKIP_TOUR_TEXT = 'Пропустить тур'

/** Текст кнопки "Далее" */
export const UI_NEXT_TEXT = 'Далее'

/** Текст кнопки "Назад" */
export const UI_PREV_TEXT = 'Назад'

/** aria-label навигации хлебных крошек */
export const UI_BREADCRUMBS_ARIA = 'Навигация'

/** aria-label кнопки закрытия */
export const UI_CLOSE_ARIA = 'Закрыть'

/** Текст кнопки "Применить" */
export const UI_APPLY_TEXT = 'Применить'

/** aria-label предыдущего года */
export const UI_PREV_YEAR_ARIA = 'Предыдущий год'

/** aria-label предыдущего месяца */
export const UI_PREV_MONTH_ARIA = 'Предыдущий месяц'

/** aria-label следующего месяца */
export const UI_NEXT_MONTH_ARIA = 'Следующий месяц'

/** aria-label следующего года */
export const UI_NEXT_YEAR_ARIA = 'Следующий год'

/** Задержка дебаунса по умолчанию (мс) */
export const UI_DEBOUNCE_DEFAULT_MS = 300

/** Длительность анимации по умолчанию (мс) */
export const UI_ANIMATION_DURATION_MS = 300

/** Максимальная высота выпадающих панелей */
export const UI_PANEL_MAX_HEIGHT = '320px'

/** Ширина боковой панели по умолчанию */
export const UI_SIDEBAR_DEFAULT_WIDTH = 280

/** Ширина модального окна по умолчанию */
export const UI_MODAL_DEFAULT_WIDTH = 500

/** Коэффициент масштабирования для мелких элементов */
export const UI_SCALE_SMALL = 0.8

/** Коэффициент масштабирования для средних элементов */
export const UI_SCALE_MEDIUM = 1.0

/** Коэффициент масштабирования для крупных элементов */
export const UI_SCALE_LARGE = 1.2

/** Ширина контекстного меню по умолчанию */
export const UI_CONTEXT_MENU_DEFAULT_WIDTH = 200

/** Высота контекстного меню по умолчанию */
export const UI_CONTEXT_MENU_DEFAULT_HEIGHT = 280

/** Коэффициент масштабирования для элементов автодополнения */
export const UI_SCALE_AUTOCOMPLETE = 0.85

/** Задержка hover-эффекта в меню (мс) */
export const UI_HOVER_DELAY_MS = 200

/** Длительность CSS-transition (мс) */
export const UI_TRANSITION_DURATION_MS = 200

/** Интервал симуляции прогресса загрузки (мс) */
export const UI_PROGRESS_INTERVAL_MS = 200

/** Задержка скрытия тултипа (мс) */
export const UI_TOOLTIP_HIDE_DELAY_MS = 150

/** Интервал удержания кнопки слайдера (мс) */
export const UI_SLIDER_HOLD_INTERVAL_MS = 150

/** Длительность подсветки сообщения (мс) */
export const UI_HIGHLIGHT_DURATION_MS = 1500

/** Auto-close уведомления по умолчанию (мс) */
export const UI_NOTIFICATION_AUTO_CLOSE_MS = 3000

/** Таймаут загрузки изображения (мс) */
export const UI_IMAGE_LOAD_TIMEOUT_MS = 5000

/** Font weight: medium (500) */
export const UI_FONT_WEIGHT_MEDIUM = 500

/** Font weight: semibold (600) */
export const UI_FONT_WEIGHT_SEMIBOLD = 600

/** Chat: коэффициент масштаба иконок */
export const UI_CHAT_SCALE_ICON = 0.75

/** Chat: коэффициент масштаба мета-информации */
export const UI_CHAT_SCALE_META = 0.7

/** Chat: коэффициент масштаба участников */
export const UI_CHAT_SCALE_MEMBER = 0.9

/** Chat: коэффициент масштаба подстрочного текста */
export const UI_CHAT_SCALE_SUBTEXT = 0.65

/** Chat: коэффициент масштаба увеличенного аватара */
export const UI_CHAT_SCALE_AVATAR_LARGE = 1.5

/** Chat: коэффициент масштаба имени */
export const UI_CHAT_SCALE_NAME = 1.1

/** Chat: коэффициент масштаба файловых иконок */
export const UI_CHAT_SCALE_FILE_ICON = 1.2

/** Chat: коэффициент масштаба текста подтверждения */
export const UI_CHAT_SCALE_CONFIRM = 0.95

/** Chat: коэффициент масштаба статуса доставки */
export const UI_CHAT_SCALE_STATUS = 0.6

/** Chat: коэффициент масштаба спиннера отправки */
export const UI_CHAT_SCALE_SPINNER = 0.5

/** Высота чата по умолчанию */
export const UI_CHAT_DEFAULT_HEIGHT = '500px'

/** Высота слайдера по умолчанию */
export const UI_SLIDER_DEFAULT_HEIGHT = '400px'

/** Минимальная высота изображения при загрузке */
export const UI_IMAGE_LOADING_MIN_HEIGHT = '120px'

/** Chat: текст "Ответить" */
export const UI_CHAT_REPLY = 'Ответить'

/** Chat: текст "Выбрать" */
export const UI_CHAT_SELECT = 'Выбрать'

/** Chat: текст "Копировать текст" */
export const UI_CHAT_COPY_TEXT = 'Копировать текст'

/** Chat: текст "Закрепить" */
export const UI_CHAT_PIN = 'Закрепить'

/** Chat: текст "Открепить" */
export const UI_CHAT_UNPIN = 'Открепить'

/** Chat: текст "Удалить" */
export const UI_CHAT_DELETE = 'Удалить'

/** Chat: текст "Сообщение" (placeholder) */
export const UI_CHAT_MESSAGE_PLACEHOLDER = 'Сообщение'

/** Chat: текст "Отправить сообщение" */
export const UI_CHAT_SEND_ARIA = 'Отправить сообщение'

/** Chat: текст "Прикрепить файл" */
export const UI_CHAT_ATTACH_ARIA = 'Прикрепить файл'

/** Chat: текст "Отменить ответ" */
export const UI_CHAT_CANCEL_REPLY_ARIA = 'Отменить ответ на сообщение'

/** Chat: текст "Показать команды" */
export const UI_CHAT_SHOW_COMMANDS_ARIA = 'Показать команды'

/** Chat: текст "Открыть выбор эмодзи" */
export const UI_CHAT_EMOJI_ARIA = 'Открыть выбор эмодзи'

/** Chat: текст "Выбор файлов" */
export const UI_CHAT_FILE_SELECT_ARIA = 'Выбор файлов для прикрепления'

/** Chat: текст "Поиск по сообщениям" */
export const UI_CHAT_SEARCH_ARIA = 'Поиск по сообщениям'

/** Chat: текст "Информация о чате" */
export const UI_CHAT_INFO_ARIA = 'Информация о чате'

/** Chat: текст "Удалить сообщения?" */
export const UI_CHAT_DELETE_CONFIRM = 'Удалить сообщения?'

/** Chat: текст "Ответить на сообщение" */
export const UI_CHAT_REPLY_ARIA = 'Ответить на сообщение'

/** Chat: текст "Выбрать сообщение" */
export const UI_CHAT_SELECT_ARIA = 'Выбрать сообщение'

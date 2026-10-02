/** Общие строки: подписи и кнопки, доступные имена, тур, рейтинг, чек-лист */
export const ruBase = {
	text: {
		/** Ссылка промо-блока BaseMegaMenu */
		MEGA_MENU_PROMO_LINK: 'Подробнее',
		EMPTY: 'Нет данных',
		NO_RESULTS: 'Ничего не найдено',
		SEARCH_PLACEHOLDER: 'Поиск...',
		TODAY: 'Сегодня',
		LOADING: 'Загрузка...',
		LOADING_ARIA: 'Загрузка',
		LOAD_MORE: 'Загрузить еще',
		/** Конец списка BaseInfiniteScroll */
		NO_MORE_ITEMS: 'Больше ничего нет',
		/** Ошибка подгрузки BaseInfiniteScroll */
		LOAD_ERROR: 'Не удалось загрузить',
		RETRY: 'Повторить',
		/** Первая ссылка BaseLayout: к основному содержимому мимо шапки и меню */
		SKIP_TO_CONTENT: 'Перейти к содержимому',
		IMAGE_ERROR: 'Ошибка загрузки',
		FILE_STATUS_DONE: 'Загружено',
		FILE_STATUS_ERROR: 'Ошибка',
		FILE_STATUS_PENDING: 'Ожидание',
		DELETE: 'Удалить',
		NO_COLOR: 'Без цвета',
		CANCEL: 'Отмена',
		CONFIRM: 'Подтвердить',
		APPLY: 'Применить',
		REQUIRED_FIELD: 'Обязательное поле',
		SELECT_PLACEHOLDER: 'Выберите...',
		/** Флажок «выбрать все» над вариантами BaseCheckboxGroup */
		SELECT_ALL_OPTIONS: 'Выбрать все',
		/** Подсказка в пустом поле BaseTimePicker */
		TIME_PLACEHOLDER: 'чч:мм',
		SELECT_DATE: 'Выберите дату',
		EXPAND: 'Развернуть',
		COLLAPSE: 'Свернуть',
		FILE_SELECT: 'Выберите файлы',
		FILE_DROP: 'Перетащите файлы сюда',
		FILE_MAX_SIZE_PREFIX: 'до',
		FILE_MAX_SIZE_SUFFIX: 'МБ',
		FILE_MAX_COUNT_PREFIX: 'Максимум файлов:',
		/** Строка страниц пагинации: «1–10 из 100» */
		PAGE_RANGE: '{from}–{to} из {total}',
		SIZE_B: 'Б',
		SIZE_KB: 'КБ',
		SIZE_MB: 'МБ',
		/** Ошибка выбора файла больше maxSize */
		FILE_TOO_LARGE: 'Файл "{name}" превышает {size} МБ',
		FILE_WRONG_FORMAT: 'Формат файла "{name}" не поддерживается. Допустимые: {formats}',
	},
	aria: {
		/** Ориентир навигации BaseBottomNav */
		BOTTOM_NAV: 'Нижняя навигация',
		/** Ориентир навигации BaseMegaMenu */
		MEGA_MENU: 'Главное меню',
		/** Ориентир навигации BaseSideBar без title */
		SIDEBAR_NAVIGATION: 'Основная навигация',
		BREADCRUMBS: 'Навигация',
		BREADCRUMBS_NAV: 'Хлебные крошки',
		PAGINATION_PREV: 'Предыдущая страница',
		PAGINATION_NEXT: 'Следующая страница',
		/** Ориентир навигации BasePagination */
		PAGINATION: 'Пагинация',
		/** Имя номера страницы BasePagination */
		PAGINATION_PAGE: 'Страница {page}',
		/** Кнопка BaseBreadcrumbs, которая снова прячет раскрытые крошки */
		BREADCRUMBS_COLLAPSE: 'Скрыть разделы',
		TABS_SCROLL_LEFT: 'Прокрутить вкладки влево',
		TABS_SCROLL_RIGHT: 'Прокрутить вкладки вправо',
		CLOSE: 'Закрыть',
		DARK_THEME: 'Тёмная тема',
		OPENS_IN_NEW_TAB: '(откроется в новой вкладке)',
		PROGRESS: 'Прогресс',
		/** aria-valuetext BaseProgress */
		PROGRESS_VALUE: 'Выполнено {percent}%',
		/** aria-valuetext BaseProgress в неопределённом режиме */
		PROGRESS_INDETERMINATE: 'Выполняется',
		PREV_YEAR: 'Предыдущий год',
		PREV_MONTH: 'Предыдущий месяц',
		NEXT_MONTH: 'Следующий месяц',
		NEXT_YEAR: 'Следующий год',
		PREV_YEARS: 'Предыдущие годы',
		NEXT_YEARS: 'Следующие годы',
		OPEN_CALENDAR: 'Открыть календарь',
		CLEAR_VALUE: 'Очистить',
		SORT: 'Сортировать',
		PASSWORD_HIDE: 'Скрыть пароль',
		PASSWORD_SHOW: 'Показать пароль',
		NOTIFICATIONS: 'Уведомления',
		IMAGE_VIEWER: 'Просмотр изображения',
		ZOOM_IN: 'Увеличить',
		ZOOM_OUT: 'Уменьшить',
		ZOOM_RESET: 'Сбросить масштаб',
		ROTATE_LEFT: 'Повернуть влево',
		ROTATE_RIGHT: 'Повернуть вправо',
		GALLERY_PREV: 'Предыдущее изображение',
		GALLERY_NEXT: 'Следующее изображение',
		SEARCH: 'Поиск',
		CONTEXT_MENU: 'Контекстное меню',
		/** fu-keyboard: имя кликабельного BaseAvatar без alt и name; имя кликабельного индикатора BaseChip */
		AVATAR: 'Аватар',
		CHIP_BADGE: 'Индикатор: {value}',
		/** Имена ползунков BaseRange без ariaLabel: одно значение, границы диапазона, точки */
		RANGE_VALUE: 'Значение',
		RANGE_MIN: 'Минимум',
		RANGE_MAX: 'Максимум',
		RANGE_POINT: 'Точка',
		SLIDER_PREV: 'Предыдущий слайд',
		SLIDER_NEXT: 'Следующий слайд',
		/** Имя точки и миниатюры слайдера */
		SLIDE_POSITION: 'Слайд {current} из {total}',
		/** Подпись миниатюры галереи */
		GALLERY_ITEM: 'Изображение {current} из {total}',
		/** Имя ячейки BasePin: позиция в коде */
		PIN_CELL: 'Символ {position} из {length}',
		/** Кнопки BaseInputNumber */
		NUMBER_DECREASE: 'Уменьшить',
		NUMBER_INCREASE: 'Увеличить',
		/** Кнопка удаления тега BaseInputTags и объявления для скринридера */
		TAG_REMOVE: 'Удалить {name}',
		TAG_ADDED: 'Добавлено: {name}',
		TAG_REMOVED: 'Удалено: {name}',
		/** Список тегов BaseInputTags */
		TAGS: 'Теги',
		/** Имена клавиш BaseKbd для скринридера (на экране — символ) */
		KEY_COMMAND: 'Command',
		KEY_OPTION: 'Option',
		KEY_CONTROL: 'Control',
		KEY_SHIFT: 'Shift',
		KEY_ENTER: 'Enter',
		KEY_BACKSPACE: 'Backspace',
		KEY_DELETE: 'Delete',
		KEY_UP: 'стрелка вверх',
		KEY_DOWN: 'стрелка вниз',
		KEY_LEFT: 'стрелка влево',
		KEY_RIGHT: 'стрелка вправо',
		/** Остаток BaseAvatarGroup: «+3» на экране */
		AVATARS_MORE: 'и ещё {n}',
		/** Кнопка меню BaseSplitButton */
		MORE_ACTIONS: 'Другие действия',
		/** Подсказка кнопки BaseInplace */
		INPLACE_HINT: 'Нажмите, чтобы изменить',
		/** Кнопка меню в BaseHeader и заголовок выдвижного меню */
		MENU: 'Меню',
		/** Кнопка BaseBackTop */
		BACK_TO_TOP: 'Наверх',
		/** Разделитель BaseSplitter */
		SPLITTER: 'Размер панелей',
	},
	tour: {
		SKIP: 'Пропустить тур',
		NEXT: 'Далее',
		PREV: 'Назад',
		FINISH: 'Завершить',
		TITLE: 'Тур по интерфейсу',
		/** Объявление смены шага для экранного диктора */
		STEP_STATUS: 'Шаг {current} из {total}',
		STEP_STATUS_TITLED: 'Шаг {current} из {total}: {title}',
	},
	stepper: {
		/** Подпись под заголовком необязательного шага */
		OPTIONAL: 'Необязательно',
		/** Состояние шага для экранного диктора: «Доставка, пройден» */
		COMPLETED: 'пройден',
		ERROR: 'ошибка',
	},
	rating: {
		ARIA_PREFIX: 'Оценка от 0 до',
		/** Имя рейтинга только для чтения (role="img"): «Оценка 4.5 из 5» */
		LABEL: 'Оценка',
		/** Связка значения и максимума в aria-valuetext и имени: «3 из 5» */
		OF: 'из',
	},
	/** Чек-лист первых шагов */
	checklist: {
		TITLE: 'Первые шаги',
		PROGRESS: '{done} из {total}',
		PROGRESS_LABEL: 'Выполнено шагов',
		NEXT: 'Следующий шаг',
		DONE: 'Всё готово',
	},
	/** Палитра команд */
	commandPalette: {
		LABEL: 'Палитра команд',
		SEARCH: 'Поиск команды',
		PLACEHOLDER: 'Найти команду…',
		COMMANDS: 'Команды',
		EMPTY: 'Ничего не найдено',
		HINT_MOVE: 'выбрать',
		HINT_RUN: 'выполнить',
		HINT_CLOSE: 'закрыть',
	},
	/** QR-код: имя картинки и сообщение, когда текст не помещается */
	qrCode: {
		LABEL: 'QR-код: {value}',
		TOO_LONG: 'Текст слишком длинный для QR-кода',
	},
	marquee: {
		LABEL: 'Бегущая строка',
		PAUSE: 'Остановить бегущую строку',
		PLAY: 'Запустить бегущую строку',
	},
	notificationCenter: {
		TITLE: 'Уведомления',
		READ_ALL: 'Прочитать все',
		FILTER: 'Показать',
		ALL: 'Все',
		UNREAD: 'Непрочитанные',
		MARK_READ: 'Отметить прочитанным',
		MARK_UNREAD: 'Отметить непрочитанным',
		UNREAD_ITEM: 'не прочитано',
		EMPTY: 'Уведомлений нет',
		EMPTY_UNREAD: 'Всё прочитано',
	},
	/** Предупреждения в консоли для разработчика приложения */
	warnings: {
		BOTTOM_NAV_ITEM_COUNT:
			'BaseBottomNav: пунктов {count} — нижняя навигация рассчитана на {min}–{max}; остальное вынесите в пункт «Ещё»',
		UNKNOWN_LOCALE: 'Неизвестный язык «{locale}». Встроенные: {locales}; свой — defineLocale()',
		TOAST_WITHOUT_APP: 'useToast: не найден <BaseApp> — уведомление не показано. Оберните приложение в <BaseApp>.',
		OVERLAY_WITHOUT_APP: 'useOverlay: не найден <BaseApp> — оверлей не показан. Оберните приложение в <BaseApp>.',
		EDITOR_UNSAFE_LINK: 'BaseEditor: ссылка с небезопасной схемой не вставлена: {url}',
		LINK_UNSAFE_URL: 'Ссылка с небезопасным адресом показана без адреса: {url}',
		LINK_WITHOUT_COMPONENT: 'Объект `to` без компонента ссылок: передайте RouterLink в linkComponent',
		SIDEBAR_UNSAFE_URL: 'BaseSideBar: пункт «{label}» с небезопасным адресом показан кнопкой: {url}',
		DOWNLOAD_UNSAFE_URL: 'Скачивание по небезопасному URL заблокировано: {url}',
		NAVIGATION_UNSAFE_URL: 'Переход по небезопасному URL заблокирован: {url}',
		SEO_MISSING_FIELDS: '{component}: в SEO-разметке {type} нет обязательных полей: {fields}. Передайте их в seo.data',
		TREE_REPEATED_ID: 'BaseTree: id узлов встречаются в дереве повторно (цикл в children или дубль): {ids}. Повторы не показаны',
	},
}

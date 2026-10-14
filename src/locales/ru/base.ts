/** Общие строки: подписи и кнопки, доступные имена, тур, рейтинг, чек-лист */
export const ruBase = {
	text: {
		/** Ссылка промо-блока BaseMegaMenu */
		MEGA_MENU_PROMO_LINK: 'Подробнее',
		/** Кнопка возврата на уровень выше в режиме drill-down BaseMegaMenu */
		MEGA_MENU_BACK: 'Назад',
		EMPTY: 'Нет данных',
		NO_RESULTS: 'Ничего не найдено',
		/** Источник поиска BaseSearch ответил ошибкой: это не «ничего не найдено» */
		SEARCH_FAILED: 'Не удалось выполнить поиск. Попробуйте ещё раз',
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
		/** Имя кнопки «Назад» drill-down BaseMegaMenu: к какому уровню она ведёт */
		MEGA_MENU_BACK_TO: 'Назад к «{title}»',
		/** Объявление нового уровня drill-down BaseMegaMenu: название и число пунктов */
		MEGA_MENU_LEVEL: 'Уровень «{title}»: {count}',
		/** Ориентир навигации BaseSideBar без title */
		SIDEBAR_NAVIGATION: 'Основная навигация',
		BREADCRUMBS: 'Навигация',
		BREADCRUMBS_NAV: 'Хлебные крошки',
		/** Оглавление BaseAnchor */
		ANCHOR_NAV: 'Содержание',
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
		/** Имя одной из нескольких областей BaseNotification: имя области и её положение */
		NOTIFICATIONS_AREA: '{label}: {position}',
		NOTIFICATIONS_TOP_LEFT: 'вверху слева',
		NOTIFICATIONS_TOP_RIGHT: 'вверху справа',
		NOTIFICATIONS_TOP_CENTER: 'вверху по центру',
		NOTIFICATIONS_BOTTOM_LEFT: 'внизу слева',
		NOTIFICATIONS_BOTTOM_RIGHT: 'внизу справа',
		NOTIFICATIONS_BOTTOM_CENTER: 'внизу по центру',
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
		/** Запасное имя кликабельной точки BaseBadge без label */
		BADGE_DOT: 'Индикатор',
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
		/** Полоса загрузки BaseApp (useLoadingBar) */
		LOADING_BAR: 'Загрузка страницы',
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
	/** QR-код: имя картинки, кнопка показа секретного кода и сообщение, когда текст не помещается */
	qrCode: {
		LABEL: 'QR-код',
		LABEL_LINK: 'QR-код: ссылка на {host}',
		REVEAL: 'Показать QR-код',
		TOO_LONG: 'Текст слишком длинный для QR-кода',
	},
	marquee: {
		LABEL: 'Бегущая строка',
		PAUSE: 'Остановить бегущую строку',
		PLAY: 'Запустить бегущую строку',
	},
	/** Метки: кнопка удаления и имя группы */
	tag: {
		REMOVE: 'Удалить метку {label}',
		REMOVE_UNNAMED: 'Удалить метку',
		GROUP: 'Метки',
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
		BADGE_DOT_WITHOUT_LABEL: 'BaseBadge: у кликабельной точки (isDot) нет label — читалки экрана назовут её «Индикатор»; задайте label',
		BOTTOM_NAV_ITEM_COUNT:
			'BaseBottomNav: пунктов {count} — нижняя навигация рассчитана на {min}–{max}; остальное вынесите в пункт «Ещё»',
		POPOVER_ANCHOR_WITHOUT_LABEL:
			'BasePopover: окно с anchor и без слота trigger не имеет имени — задайте ariaLabel, чтобы его озвучили читалки экрана',
		CRYPTOPRO_NO_TSA: 'BaseCryptoProSign: для уровня подписи «{level}» нужен адрес службы штампов времени tsaAddress',
		TABLE_DUPLICATE_ROW_ID:
			'BaseTable: id строки «{id}» встречается в rows повторно — раскрытие и выбор будут действовать на все такие строки',
		TABLE_INVALID_TIME_ZONE:
			'BaseTable: неизвестный часовой пояс «{timeZone}» в фильтре по датам — сутки считаются в поясе пользователя',
		DASHBOARD_GRID_DUPLICATE_ID: 'BaseDashboardGrid: id «{id}» встречается в раскладке повторно — повторы не показаны',
		TOOLTIP_WRAPPERLESS_ROOT:
			'BaseTooltip: при isWrapperless корень слота trigger должен быть элементом, а не текстом или фрагментом — подсказка не привязана',
		UNKNOWN_LOCALE: 'Неизвестный язык «{locale}». Встроенные: {locales}; свой — defineLocale()',
		TOAST_WITHOUT_APP: 'useToast: не найден <BaseApp> — уведомление не показано. Оберните приложение в <BaseApp>.',
		OVERLAY_WITHOUT_APP: 'useOverlay: не найден <BaseApp> — оверлей не показан. Оберните приложение в <BaseApp>.',
		EDITOR_UNSAFE_LINK: 'BaseEditor: ссылка с небезопасной схемой не вставлена: {url}',
		LINK_UNSAFE_URL: 'Ссылка с небезопасным адресом показана без адреса: {url}',
		LINK_WITHOUT_COMPONENT: 'Объект `to` без компонента ссылок: передайте RouterLink в linkComponent',
		SIDEBAR_UNSAFE_URL: 'BaseSideBar: пункт «{label}» с небезопасным адресом показан кнопкой: {url}',
		SIDEBAR_DUPLICATE_KEY:
			'BaseSideBar: у нескольких пунктов одинаковый ключ «{key}» — задайте каждому уникальный `key`: пока его нет, состояние раскрытия привязано к порядку пунктов',
		DOWNLOAD_UNSAFE_URL: 'Скачивание по небезопасному URL заблокировано: {url}',
		CHAT_WRITE_MESSAGE_AVATAR_CLICK:
			'BaseChat: «Написать сообщение» вызывает событие write-message; avatar-click для этого действия устарел и будет убран — перейдите на write-message',
		NAVIGATION_UNSAFE_URL: 'Переход по небезопасному URL заблокирован: {url}',
		SEO_MISSING_FIELDS: '{component}: в SEO-разметке {type} нет обязательных полей: {fields}. Передайте их в seo.data',
		TREE_REPEATED_ID: 'BaseTree: id узлов встречаются в дереве повторно (цикл в children или дубль): {ids}. Повторы не показаны',
		MAP_LANGUAGE_FIXED:
			'BaseMap: язык API «{provider}» задан первой загрузкой скрипта — «{current}»; запрошенный «{requested}» не применён. Один язык на страницу',
		IMAGE_MAP_TIME_ZONE: 'BaseImageMap: неизвестный часовой пояс «{zone}» — часы работы считаются по поясу браузера',
		IMAGE_MAP_HOURS_RANGE: 'BaseImageMap: интервал часов работы «{range}» объекта «{id}» пропущен — ожидается «10:00-22:00»',
		IMAGE_MAP_ROUTE_LAYER:
			'BaseImageMap: узел маршрута «{id}» стоит на слое «{layer}», которого нет в data.layers — вверх или вниз определено по порядку узлов перехода',
		QR_UNSAFE_LOGO:
			'BaseQrCode: логотип с небезопасной схемой не показан: {url}. Допустимы относительный адрес, https:, http:, blob: и data:image/(png|jpeg|gif|webp|svg+xml)',
		QR_EXTERNAL_LOGO:
			'BaseQrCode: логотип грузится с чужого сервера {origin} — запрос раскрывает адрес страницы, а картинку могут подменить на сервере. Используйте data URI или свой домен',
		QR_INVERTED:
			'BaseQrCode: модули {module} светлее фона {background} — инвертированный код читают не все сканеры. Нужны тёмные модули на светлом фоне',
		QR_LOW_CONTRAST:
			'BaseQrCode: контраст модулей {module} и фона {background} — {ratio}:1, меньше 3:1 — часть сканеров код не прочитает',
		QR_SMALL_MARGIN:
			'BaseQrCode: поле вокруг кода — {margin} в модулях, меньше 2; стандарт требует 4, без поля сканеры хуже находят код',
		PAYMENT_QR_REQUIRED: 'gostPaymentText: реквизит {key} не задан',
		PAYMENT_QR_INVALID: 'gostPaymentText: неверное значение реквизита {key}: «{value}»',
		PAYMENT_QR_SEPARATOR: 'gostPaymentText: символ «|» в реквизите {key} — он разделяет реквизиты строки; уберите его из данных',
		STEPPER_STEP_OUT_OF_RANGE: 'BaseStepper: modelValue {value} вне диапазона 1…{count} — показан ближайший шаг. Шаги нумеруются с 1',
		PAYMENT_QR_KEY: 'gostPaymentText: имя реквизита «{key}» в extra недопустимо — нужны латинские буквы и цифры, без основных полей',
	},
}

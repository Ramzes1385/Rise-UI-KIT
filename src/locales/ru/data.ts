/** Данные: таблица, канбан-доска */
export const ruTable = {
	/** Подпись поля поиска (скрыта визуально, озвучивается скринридером) */
	SEARCH_LABEL: 'Поиск по таблице',
	/** Подпись поля значения фильтра (скрыта визуально) */
	FILTER_VALUE_LABEL: 'Значение фильтра',
	ADD_FILTER: 'Добавить',
	/** Доступное имя кнопки удаления фильтра: «Удалить фильтр: <условие>» */
	REMOVE_FILTER: 'Удалить фильтр',
	/** Кнопка и панель настройки видимости колонок */
	COLUMNS: 'Колонки',
	/** Доступное имя меню с флажками видимости колонок */
	COLUMNS_MENU: 'Видимость колонок',
	/** Доступное имя панели инструментов таблицы */
	TOOLBAR: 'Инструменты таблицы',
	/** Доступные имена группы полей фильтра и списка активных фильтров */
	FILTER_GROUP: 'Фильтр',
	ACTIVE_FILTERS: 'Активные фильтры',
	/** Доступные имена полей фильтра: колонка, условие, границы диапазона */
	FILTER_COLUMN_LABEL: 'Колонка фильтра',
	FILTER_OPERATOR_LABEL: 'Условие фильтра',
	FILTER_VALUE_FROM_LABEL: 'Значение фильтра от',
	FILTER_VALUE_TO_LABEL: 'Значение фильтра до',
	/** Чекбокс «выбрать все» в заголовке */
	SELECT_ALL: 'Выбрать все строки',
	/** Чекбокс строки: «Выбрать строку N» */
	SELECT_ROW: 'Выбрать строку',
	EXPAND_ROW: 'Развернуть строку',
	COLLAPSE_ROW: 'Свернуть строку',
	PAGE_SIZE: 'Строк на странице',
	/** Описание приоритета в мультисортировке: «Приоритет сортировки: N» */
	SORT_PRIORITY: 'Приоритет сортировки',
	/** Пустая таблица, когда поиск или фильтры скрыли все строки */
	EMPTY_FILTERED: 'Ничего не найдено',
	/** Ручка изменения ширины колонки: «Ширина колонки: <заголовок>» */
	RESIZE_COLUMN: 'Ширина колонки',
}

/** Выгрузка таблицы BaseTable: кнопка «Экспорт» и пункты меню форматов */
export const ruTableExport = {
	BUTTON: 'Экспорт',
	CSV: 'CSV',
	XLSX: 'Excel (XLSX)',
	/** Подсказка в меню, когда выбраны строки: выгружаются только они */
	SELECTED: 'Только выбранные строки: {n}',
}

/** Канбан-доска: подписи колонок и объявления при перемещении карточек с клавиатуры */
export const ruKanban = {
	BOARD: 'Доска задач',
	EMPTY: 'Нет карточек',
	EMPTY_FILTERED: 'Ничего не найдено',
	LIMIT: 'Лимит {limit}',
	OVER_LIMIT: 'Превышен лимит {limit}',
	HINT: 'Space — взять карточку, стрелки — перейти к соседней, Enter — открыть',
	HINT_EDITABLE: 'Space — взять карточку, стрелки — перейти к соседней, Enter — открыть, F2 — переименовать',
	PICKED: 'Карточка «{card}» взята. Стрелки перемещают её, Space кладёт, Escape отменяет',
	MOVED: '«{column}», позиция {position} из {total}',
	DROPPED: 'Карточка «{card}» положена в «{column}», позиция {position} из {total}',
	CANCELLED: 'Перемещение отменено, карточка «{card}» на прежнем месте',
	BLOCKED: 'Карточку «{card}» нельзя положить в «{column}»',
	MENU: 'Действия с карточкой',
	OPEN: 'Открыть',
	MOVE_TO: 'Переместить в',
	MOVE_TOP: 'В начало колонки',
	MOVE_BOTTOM: 'В конец колонки',
	PRIORITY: 'Приоритет: {level}',
	PRIORITY_LOWEST: 'самый низкий',
	PRIORITY_LOW: 'низкий',
	PRIORITY_MEDIUM: 'средний',
	PRIORITY_HIGH: 'высокий',
	PRIORITY_HIGHEST: 'самый высокий',
	DUE: 'Срок: {date}',
	DUE_OVERDUE: 'Срок: {date}, просрочен',
	DUE_TODAY: 'Срок: сегодня',
	DUE_TOMORROW: 'Срок: завтра',
	TODAY: 'Сегодня',
	TOMORROW: 'Завтра',
	SUBTASKS: 'Подзадачи: {done} из {total}',
	ESTIMATE: 'Оценка: {value}',
	ASSIGNEES: 'Исполнители: {names}',
	LABELS: 'Метки: {labels}',
	ADD_CARD: 'Добавить карточку',
	ADD: 'Добавить',
	CANCEL: 'Отмена',
	NEW_CARD: 'Название новой карточки в «{column}»',
	RENAME: 'Переименовать',
	RENAME_LABEL: 'Название карточки',
	DELETE: 'Удалить',
	CREATED: 'Карточка «{card}» добавлена в «{column}»',
	RENAMED: 'Карточка переименована: «{card}»',
	DELETED: 'Карточка «{card}» удалена',
	COLLAPSE: 'Свернуть колонку «{column}»',
	EXPAND: 'Развернуть колонку «{column}»',
	FILTERED: '{shown} из {total}',
}

/** Графики: сводка для скринридера, «Другое» у круговой диаграммы, шкала календаря активности */
export const ruCharts = {
	SUMMARY: '{label}: от {min} до {max}, последнее значение {last}',
	OTHER: 'Другое',
	TOTAL: 'Всего',
	LESS: 'Меньше',
	MORE: 'Больше',
	HEATMAP_SUMMARY: '{label}: всего {total}, больше всего {max} — {date}',
	CHART_SUMMARY: '{label}: {series}; значения от {min} до {max}',
	CHART_HINT:
		'Стрелки влево и вправо — переход по точкам, Home и End — к первой и последней, PageUp и PageDown — на десятую часть, Escape — скрыть подсказку; таблица данных — после графика',
	CHART_POINT: '{label}: {values}',
	CATEGORY: 'Категория',
	LEGEND: 'Ряды графика',
	NO_VALUE: 'нет значения',
}

/** Список «поле — значение»: пустое значение, пустой список, копирование */
export const ruDescriptions = {
	EMPTY_VALUE: '—',
	EMPTY: 'Нет данных',
	COPY: 'Копировать: {label}',
	COPIED: 'Скопировано: {label}',
	COPY_FAILED: 'Не удалось скопировать: {label}',
}

/** Блок кода BaseCode: имя области, копирование, пустой код */
export const ruCodeBlock = {
	LABEL: 'Код',
	LABEL_LANGUAGE: 'Код, {language}',
	COPY: 'Копировать',
	COPIED: 'Скопировано',
	/** Имя кнопки копирования для скринридера: различает блоки на странице по заголовку или языку */
	COPY_LABEL: 'Копировать код',
	COPY_LABEL_NAMED: 'Копировать код: {name}',
	COPIED_LABEL_NAMED: 'Скопировано: {name}',
	COPY_DONE: 'Код скопирован в буфер обмена',
	COPY_FAILED: 'Не удалось скопировать код',
	EMPTY: 'Кода нет',
}

/** Просмотр JSON: кнопки над деревом и сообщение о копировании */
export const ruJsonViewer = {
	EXPAND_ALL: 'Развернуть всё',
	COLLAPSE_ALL: 'Свернуть всё',
	COPY: 'Копировать JSON',
	COPIED: 'JSON скопирован',
	COPY_FAILED: 'Не удалось скопировать',
}

/** Сравнение текстов: подписи колонок, строк и итог для скринридера */
export const ruTextDiff = {
	BEFORE: 'Было',
	AFTER: 'Стало',
	ADDED: 'Добавлено',
	REMOVED: 'Удалено',
	SUMMARY: '{label}: добавлено строк — {added}, удалено — {removed}',
	NO_CHANGES: 'Изменений нет',
	CHANGE: 'Изменение',
	TEXT: 'Текст',
}

/** Карта: имя области, метки, заглушка без ключа и ошибка загрузки */
export const ruMap = {
	LABEL: 'Карта',
	MARKER: 'Метка {id}',
	LOADING: 'Загрузка карты...',
	NO_KEY_TITLE: 'Нужен ключ API',
	NO_KEY: 'Для карты ({provider}) нужен ключ: передайте его в apiKey или в настройки плагина',
	NO_MAP_ID_TITLE: 'Нужен Map ID',
	NO_MAP_ID: 'Метки {provider} работают только со стилем карты: передайте Map ID в mapId или в настройки плагина',
	ERROR_TITLE: 'Карта не загрузилась',
	ERROR: 'Проверьте ключ API и доступ к сервису {provider}',
	YANDEX: 'Яндекс Карты',
	GOOGLE: 'Google Maps',
	SHAPES: 'Линии и области на карте',
	POLYLINE: 'Линия {id}',
	POLYGON: 'Область {id}',
	CONTROLS: 'Управление картой',
	ZOOM_IN: 'Приблизить',
	ZOOM_OUT: 'Отдалить',
	LOCATE: 'Моё местоположение',
	LOCATE_DENIED: 'Доступ к местоположению запрещён',
	LOCATE_UNAVAILABLE: 'Не удалось определить местоположение',
	LOCATE_UNSUPPORTED: 'Браузер не определяет местоположение',
	SCROLL_HINT: 'Чтобы изменить масштаб, прокручивайте колесо мыши с зажатым Ctrl',
	SCROLL_HINT_MAC: 'Чтобы изменить масштаб, прокручивайте колесо мыши с зажатой клавишей ⌘',
	CLUSTER: 'Группа меток, всего {count}',
}

/** Отсчёт до даты: имя таймера и текст для скринридера (обновляется раз в минуту) */
export const ruCountdown = {
	LABEL: 'Осталось',
	REMAINING: '{label}: {time}',
	LESS_THAN_MINUTE: 'меньше минуты',
	FINISHED: 'время вышло',
}

/** Список BaseList: пустое состояние, подсказки и объявления при перестановке строк */
export const ruList = {
	EMPTY: 'Список пуст',
	HINT_SORTABLE: 'Space — взять строку, стрелки — переместить, Alt + стрелки — сдвинуть сразу, Enter — открыть',
	HINT_SORTABLE_SELECT: 'Alt + стрелка вверх или вниз — переместить строку',
	PICKED: 'Строка «{item}» взята, место {position} из {total}. Стрелки перемещают её, Space кладёт, Escape отменяет',
	MOVED: 'Место {position} из {total}',
	DROPPED: 'Строка «{item}» на месте {position} из {total}',
	CANCELLED: 'Перемещение отменено, строка «{item}» на прежнем месте',
	BLOCKED: 'Строку «{item}» нельзя переместить сюда',
}

export const ruTransfer = {
	SOURCE: 'Доступно',
	TARGET: 'Выбрано',
	SEARCH: 'Поиск',
	SEARCH_IN: 'Поиск: {list}',
	SELECT_ALL: 'Выбрать все',
	COUNT: '{checked} из {total}',
	MOVE_TO: 'Перенести отмеченные в «{list}»',
	MOVED: 'Перенесено в «{list}»: {count}',
	NOT_FOUND: 'Ничего не найдено',
	HINT_TO_TARGET: 'Space отмечает строку, Ctrl или Alt + стрелка вправо переносит отмеченные',
	HINT_TO_SOURCE: 'Space отмечает строку, Ctrl или Alt + стрелка влево возвращает отмеченные',
}

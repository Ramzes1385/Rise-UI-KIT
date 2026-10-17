/** Роадмап BaseRoadmap: сводка, фильтры, раскладки, статусы, панель темы, материалы и объявления */
export const ruRoadmap = {
	/** Статус темы: значок, бейдж панели и текст для скринридера */
	TOPIC_DONE: 'Изучена',
	TOPIC_IN_PROGRESS: 'В процессе',
	TOPIC_AVAILABLE: 'Доступна',
	TOPIC_LOCKED: 'Закрыта',
	TOPIC_SKIPPED: 'Пропущена',
	/** Вид темы: бейдж панели, подпись в списке и легенда */
	KIND_REQUIRED: 'Обязательная',
	KIND_OPTIONAL: 'По желанию',
	KIND_ALTERNATIVE: 'Альтернатива',
	/** Развилка «или» между темами одной группы */
	OR: 'или',
	RECOMMENDED: 'советуем',
	/** Этап: номер для скринридера (`{n}` — с единицы), состояние и подсказка закрытого этапа; `{title}` — что нужно пройти */
	STAGE_NUMBER: 'Этап {n}',
	STAGE_DONE: 'Пройден',
	STAGE_CURRENT: 'Текущий',
	STAGE_LOCKED: 'Закрыт',
	STAGE_HERE: 'Вы здесь',
	STAGE_UNLOCK: 'Откроется после «{title}»',
	/** Сводка этапа: `{done}` из `{of}` (форма из `plural.ROADMAP_OF_TOPICS`) и часы; пройденный — число тем и часы */
	STAGE_PROGRESS: '{done} из {of} · {hours}',
	STAGE_TOTAL: '{topics} · {hours}',
	/** Часы и минуты (`{n}` — число в формате языка) */
	HOURS: '{n} ч',
	MINUTES: '{n} мин',
	/** Шапка: подзаголовок без `description`; `{stages}` и `{topics}` — числа с подписью из plural */
	SUBTITLE: '{stages} · {topics}',
	SUMMARY_LABEL: 'Прогресс пути',
	SUMMARY_DONE: '{done} из {of}',
	SUMMARY_PERCENT: '{percent} %',
	SUMMARY_HOURS: 'осталось ≈ {hours} ч',
	CONTINUE: 'Продолжить: {topic}',
	/** Раскладки и фильтр */
	LAYOUT_LABEL: 'Раскладка пути',
	LAYOUT_PATH: 'Путь',
	LAYOUT_SNAKE: 'Змейка',
	LAYOUT_LIST: 'Список',
	LAYOUT_HORIZONTAL: 'Лента',
	FILTER_LABEL: 'Какие темы показывать',
	FILTER_ALL: 'Все',
	FILTER_REQUIRED: 'Обязательные',
	FILTER_OPTIONAL: 'По желанию',
	LEGEND_LABEL: 'Обозначения',
	/** Метки начала и конца пути в раскладках; `{goal}` — `data.goal` */
	START: 'Старт',
	GOAL: 'Цель — {goal}',
	/** Тема в списке для скринридера: части склеиваются запятой; `{titles}` — названия требований */
	TOPIC_SUBTOPICS: '{done} из {of}',
	TOPIC_NEEDS: 'закрыта: нужно знать {titles}',
	TOPIC_TOGGLE_DONE: 'Отметить изученной: {title}',
	TOPIC_TOGGLE_UNDONE: 'Вернуть в работу: {title}',
	/** Панель темы */
	PANEL_LABEL: 'Подробности темы',
	PANEL_STAGE: 'Этап {n} · {title}',
	SUBTOPICS: 'Что изучить',
	SUBTOPICS_LABEL: 'Подтемы',
	MATERIALS: 'Материалы',
	REQUIRES: 'Нужно знать',
	MARK_DONE: 'Отметить изученной',
	MARK_UNDONE: 'Вернуть в работу',
	NEXT_TOPIC: 'Следующая тема',
	MORE: 'Ещё',
	SKIP: 'Пропустить',
	RESET: 'Сбросить',
	/** Вид материала */
	MATERIAL_DOC: 'Документация',
	MATERIAL_ARTICLE: 'Статья',
	MATERIAL_VIDEO: 'Видео',
	MATERIAL_COURSE: 'Курс',
	MATERIAL_BOOK: 'Книга',
	MATERIAL_PRACTICE: 'Практика',
	MATERIAL_LINK: 'Ссылка',
	/** Объявления `aria-live` после смены статуса; `{title}` — тема, `{done}` из `{of}` — как в сводке */
	LIVE_DONE: '{title} изучена · {done} из {of}',
	LIVE_PROGRESS: '{title}: в процессе · {done} из {of}',
	LIVE_SKIPPED: '{title} пропущена · {done} из {of}',
	LIVE_RESET: '{title}: отметка снята · {done} из {of}',
	/** Нет этапов и загрузка */
	EMPTY: 'В пути пока нет этапов',
	LOADING: 'Загрузка пути',
	LOADING_TOPIC: 'Загрузка темы',
	/** Ошибка `save` у `createLocalStorageProgress`, когда localStorage недоступен */
	STORAGE_UNAVAILABLE: 'Хранилище прогресса недоступно',
	/** Предупреждение: хук упал; `{error}` — текст ошибки */
	HOOK_FAILED: 'BaseRoadmap: хук beforeStatusChange завершился ошибкой — смена статуса отменена: {error}',
	/** Предупреждения о данных: `{path}` — цепочка «a» → «b» → «a»; `{id}`, `{target}`; `{path}` и `{value}` в UNKNOWN_KIND — поле и значение, `{expected}` — допустимые */
	CYCLE: 'BaseRoadmap: requires {path} образует цикл — связь не учтена',
	DUPLICATE_ID: 'BaseRoadmap: id «{id}» повторяется — учтено первое вхождение',
	UNKNOWN_REQUIRE: 'BaseRoadmap: «{id}» требует несуществующий «{target}» — связь не учтена',
	NEGATIVE_HOURS: 'BaseRoadmap: у темы «{id}» hours = {value} меньше нуля — оценка не учтена',
	UNKNOWN_KIND: 'BaseRoadmap: {path} = {value} не учтено — ожидается {expected}',
}

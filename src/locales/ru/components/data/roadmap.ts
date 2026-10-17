/** Роадмап BaseRoadmap: статусы, сводка и предупреждения о данных */
export const ruRoadmap = {
	/** Ошибка `save` у `createLocalStorageProgress`, когда localStorage недоступен */
	STORAGE_UNAVAILABLE: 'Хранилище прогресса недоступно',
	/** Предупреждение: хук упал; `{error}` — текст ошибки */
	HOOK_FAILED: 'BaseRoadmap: хук beforeStatusChange завершился ошибкой — смена статуса отменена: {error}',
	/** Статусы темы */
	TOPIC_LOCKED: 'Закрыта',
	TOPIC_AVAILABLE: 'Доступна',
	TOPIC_IN_PROGRESS: 'В процессе',
	TOPIC_DONE: 'Изучена',
	TOPIC_SKIPPED: 'Пропущена',
	/** Статусы этапа */
	STAGE_LOCKED: 'Закрыт',
	STAGE_AVAILABLE: 'Доступен',
	STAGE_CURRENT: 'Текущий',
	STAGE_DONE: 'Пройден',
	/** Сводка: `{done}` изучено, `{total}` всего; `{percent}`; `{hours}`; `{topic}` — название темы */
	SUMMARY_TOPICS: '{done} из {total} тем',
	SUMMARY_PERCENT: '{percent} %',
	SUMMARY_HOURS: 'осталось ≈ {hours} ч',
	CONTINUE: 'Продолжить: {topic}',
	/** Предупреждения о данных: `{path}` — цепочка «a» → «b» → «a»; `{id}`, `{target}`; `{path}` и `{value}` в UNKNOWN_KIND — поле и значение, `{expected}` — допустимые */
	CYCLE: 'BaseRoadmap: requires {path} образует цикл — связь не учтена',
	DUPLICATE_ID: 'BaseRoadmap: id «{id}» повторяется — учтено первое вхождение',
	UNKNOWN_REQUIRE: 'BaseRoadmap: «{id}» требует несуществующий «{target}» — связь не учтена',
	NEGATIVE_HOURS: 'BaseRoadmap: у темы «{id}» hours = {value} меньше нуля — оценка не учтена',
	UNKNOWN_KIND: 'BaseRoadmap: {path} = {value} не учтено — ожидается {expected}',
}

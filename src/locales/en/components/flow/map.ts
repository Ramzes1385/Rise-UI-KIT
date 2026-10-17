/** BaseFlowMap: подписи области, проверка данных, предупреждения и ошибки */
export const enFlowMap = {
	flowMap: {
		/** Тип области для скринридера (`aria-roledescription`) */
		ROLE: 'interaction map',
		/** Имя области, если нет `ariaLabel` и заголовка данных */
		DEFAULT_LABEL: 'Interaction map',
		/** Проверка: данные не объект */
		ISSUE_INVALID_DATA: 'Map data is not an object — showing an empty map',
		/** Проверка: нет версии формата; `{version}` — принятая версия */
		ISSUE_VERSION_MISSING: 'The data has no format version — version {version} assumed',
		/** Проверка: версия новее поддерживаемой; `{found}` — в данных, `{supported}` — поддерживаемая */
		ISSUE_VERSION_UNSUPPORTED: 'Data version {found} is newer than the supported one ({supported}) — view only',
		/** Проверка: нет списка; `{name}` — `nodes` или `edges` */
		ISSUE_COLLECTION_MISSING: 'The data has no “{name}” list — an empty one is used',
		/** Проверка: повтор id; `{entity}` — одно из ENTITY_* */
		ISSUE_DUPLICATE_ID: 'Duplicate id “{id}” ({entity})',
		/** Название сущности для проверки */
		ENTITY_NODE: 'node',
		/** Название сущности для проверки */
		ENTITY_EDGE: 'edge',
		/** Название сущности для проверки */
		ENTITY_GROUP: 'group',
		/** Название сущности для проверки */
		ENTITY_SCENARIO: 'scenario',
		/** Проверка: связь к несуществующему узлу */
		ISSUE_MISSING_NODE: 'Edge “{edge}” points to a missing node “{node}”',
		/** Проверка: связь к несуществующему порту */
		ISSUE_MISSING_PORT: 'Node “{node}” has no port “{port}” (edge “{edge}”)',
		/** Проверка: цикл родителей группы */
		ISSUE_GROUP_CYCLE: 'Parent cycle in group “{group}”',
		/** Проверка: группа не найдена; `{target}` — id узла или группы */
		ISSUE_MISSING_GROUP: 'Group “{group}” not found (for “{target}”)',
		/** Предупреждение разработчику: вид не найден в нотации */
		WARN_UNKNOWN_KIND: 'BaseFlowMap: kind “{kind}” not found in notation “{notation}” — a rectangle is used',
		/** Предупреждение разработчику: нотация не подключена */
		WARN_UNKNOWN_NOTATION: 'BaseFlowMap: notation “{id}” is not registered — “{fallback}” is used',
		/** Предупреждение разработчику: повтор id нотации */
		WARN_DUPLICATE_NOTATION: 'BaseFlowMap: notation “{id}” is registered twice — the last one wins',
		/** Предупреждение разработчику: повтор id раскладки, маршрутизатора или проверки; `{entry}` — вид, `{id}` — id */
		WARN_DUPLICATE_ENTRY: 'BaseFlowMap: {entry} “{id}” is registered twice — the later one wins',
		/** Предупреждение разработчику: обработчик хука выбросил ошибку */
		WARN_HOOK_FAILED: 'BaseFlowMap: the “{hook}” hook handler threw an error: {message}',
		/** Текст ошибки `hook-failed` */
		ERROR_HOOK_FAILED: 'The “{hook}” handler failed — the action was cancelled',
		/** Отказ: изменение создало бы ошибку в данных */
		REJECT_LIMIT_ISSUES: 'Not allowed: the change would break the map structure',
		/** Отказ: карта отключена */
		REJECT_DISABLED: 'Not allowed: the map is disabled',
		/** Отказ: хук отменил без причины; `{hook}` — имя хука */
		REJECT_HOOK: 'Cancelled by the “{hook}” handler',
		/** Отказ: команда в режиме «Правки» без права предлагать */
		REJECT_REVIEW_DRAFT: 'Not allowed: in review mode changes go into a suggestion',
	},
}

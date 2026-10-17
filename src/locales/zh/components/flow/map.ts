/** BaseFlowMap: подписи области, проверка данных, предупреждения и ошибки */
export const zhFlowMap = {
	flowMap: {
		/** Тип области для скринридера (`aria-roledescription`) */
		ROLE: '交互图',
		/** Имя области, если нет `ariaLabel` и заголовка данных */
		DEFAULT_LABEL: '交互图',
		/** Проверка: данные не объект */
		ISSUE_INVALID_DATA: '地图数据不是对象，已显示空白地图',
		/** Проверка: нет версии формата; `{version}` — принятая версия */
		ISSUE_VERSION_MISSING: '数据中没有格式版本，已按版本 {version} 处理',
		/** Проверка: версия новее поддерживаемой; `{found}` — в данных, `{supported}` — поддерживаемая */
		ISSUE_VERSION_UNSUPPORTED: '数据版本 {found} 高于支持的版本（{supported}），仅可查看',
		/** Проверка: нет списка; `{name}` — `nodes` или `edges` */
		ISSUE_COLLECTION_MISSING: '数据中没有“{name}”列表，已按空列表处理',
		/** Проверка: повтор id; `{entity}` — одно из ENTITY_* */
		ISSUE_DUPLICATE_ID: 'id“{id}”重复（{entity}）',
		/** Название сущности для проверки */
		ENTITY_NODE: '节点',
		/** Название сущности для проверки */
		ENTITY_EDGE: '连线',
		/** Название сущности для проверки */
		ENTITY_GROUP: '分组',
		/** Название сущности для проверки */
		ENTITY_SCENARIO: '场景',
		/** Проверка: связь к несуществующему узлу */
		ISSUE_MISSING_NODE: '连线“{edge}”指向不存在的节点“{node}”',
		/** Проверка: связь к несуществующему порту */
		ISSUE_MISSING_PORT: '节点“{node}”没有端口“{port}”（连线“{edge}”）',
		/** Проверка: цикл родителей группы */
		ISSUE_GROUP_CYCLE: '分组“{group}”的父级形成循环',
		/** Проверка: группа не найдена; `{target}` — id узла или группы */
		ISSUE_MISSING_GROUP: '找不到分组“{group}”（用于“{target}”）',
		/** Предупреждение разработчику: вид не найден в нотации */
		WARN_UNKNOWN_KIND: 'BaseFlowMap: 在记法“{notation}”中找不到类型“{kind}”，已使用矩形',
		/** Предупреждение разработчику: нотация не подключена */
		WARN_UNKNOWN_NOTATION: 'BaseFlowMap: 记法“{id}”未注册，已使用“{fallback}”',
		/** Предупреждение разработчику: повтор id нотации */
		WARN_DUPLICATE_NOTATION: 'BaseFlowMap: 记法“{id}”重复注册，以最后一个为准',
		/** Предупреждение разработчику: повтор id раскладки, маршрутизатора или проверки; `{entry}` — вид, `{id}` — id */
		WARN_DUPLICATE_ENTRY: 'BaseFlowMap: {entry}“{id}”重复注册，以后者为准',
		/** Предупреждение разработчику: обработчик хука выбросил ошибку */
		WARN_HOOK_FAILED: 'BaseFlowMap: 钩子“{hook}”的处理函数抛出错误：{message}',
		/** Текст ошибки `hook-failed` */
		ERROR_HOOK_FAILED: '处理函数“{hook}”出错，操作已取消',
		/** Отказ: изменение создало бы ошибку в данных */
		REJECT_LIMIT_ISSUES: '不允许：此更改会破坏地图结构',
		/** Отказ: карта отключена */
		REJECT_DISABLED: '不允许：地图已禁用',
		/** Отказ: хук отменил без причины; `{hook}` — имя хука */
		REJECT_HOOK: '已被处理函数“{hook}”取消',
		/** Отказ: команда в режиме «Правки» без права предлагать */
		REJECT_REVIEW_DRAFT: '不允许：审阅模式下的更改会进入建议',
	},
}

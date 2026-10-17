/** BaseFlowMap: подписи области, проверка данных, предупреждения и ошибки */
export const uzFlowMap = {
	flowMap: {
		/** Тип области для скринридера (`aria-roledescription`) */
		ROLE: 'oʻzaro taʼsir xaritasi',
		/** Имя области, если нет `ariaLabel` и заголовка данных */
		DEFAULT_LABEL: 'Oʻzaro taʼsir xaritasi',
		/** Проверка: данные не объект */
		ISSUE_INVALID_DATA: 'Xarita maʼlumoti obyekt emas — boʻsh xarita koʻrsatildi',
		/** Проверка: нет версии формата; `{version}` — принятая версия */
		ISSUE_VERSION_MISSING: 'Maʼlumotda format versiyasi yoʻq — {version}-versiya qabul qilindi',
		/** Проверка: версия новее поддерживаемой; `{found}` — в данных, `{supported}` — поддерживаемая */
		ISSUE_VERSION_UNSUPPORTED: 'Maʼlumot versiyasi {found} qoʻllab-quvvatlanadiganidan ({supported}) yangi — faqat koʻrish uchun',
		/** Проверка: нет списка; `{name}` — `nodes` или `edges` */
		ISSUE_COLLECTION_MISSING: 'Maʼlumotda «{name}» roʻyxati yoʻq — boʻsh roʻyxat qabul qilindi',
		/** Проверка: повтор id; `{entity}` — одно из ENTITY_* */
		ISSUE_DUPLICATE_ID: '«{id}» id takrorlandi ({entity})',
		/** Название сущности для проверки */
		ENTITY_NODE: 'tugun',
		/** Название сущности для проверки */
		ENTITY_EDGE: 'bogʻlanish',
		/** Название сущности для проверки */
		ENTITY_GROUP: 'guruh',
		/** Название сущности для проверки */
		ENTITY_SCENARIO: 'ssenariy',
		/** Проверка: связь к несуществующему узлу */
		ISSUE_MISSING_NODE: '«{edge}» bogʻlanishi mavjud boʻlmagan «{node}» tuguniga olib boradi',
		/** Проверка: связь к несуществующему порту */
		ISSUE_MISSING_PORT: '«{node}» tugunida «{port}» porti yoʻq («{edge}» bogʻlanishi)',
		/** Проверка: цикл родителей группы */
		ISSUE_GROUP_CYCLE: '«{group}» guruhining ota-onalari tsiklga tushgan',
		/** Проверка: группа не найдена; `{target}` — id узла или группы */
		ISSUE_MISSING_GROUP: '«{group}» guruhi topilmadi («{target}» uchun)',
		/** Предупреждение разработчику: вид не найден в нотации */
		WARN_UNKNOWN_KIND: 'BaseFlowMap: «{kind}» turi «{notation}» notatsiyasida topilmadi — toʻgʻri toʻrtburchak ishlatildi',
		/** Предупреждение разработчику: нотация не подключена */
		WARN_UNKNOWN_NOTATION: 'BaseFlowMap: «{id}» notatsiyasi ulanmagan — «{fallback}» ishlatildi',
		/** Предупреждение разработчику: повтор id нотации */
		WARN_DUPLICATE_NOTATION: 'BaseFlowMap: «{id}» notatsiyasi qayta ulandi — oxirgisi ishlatiladi',
		/** Предупреждение разработчику: повтор id раскладки, маршрутизатора или проверки; `{entry}` — вид, `{id}` — id */
		WARN_DUPLICATE_ENTRY: 'BaseFlowMap: {entry} «{id}» qayta ulandi — keyingisi ishlatiladi',
		/** Предупреждение разработчику: обработчик хука выбросил ошибку */
		WARN_HOOK_FAILED: 'BaseFlowMap: «{hook}» hukining ishlovchisi xato tashladi: {message}',
		/** Текст ошибки `hook-failed` */
		ERROR_HOOK_FAILED: '«{hook}» ishlovchisi xato bilan tugadi — amal bekor qilindi',
		/** Отказ: изменение создало бы ошибку в данных */
		REJECT_LIMIT_ISSUES: 'Mumkin emas: oʻzgarish xarita tuzilmasini buzadi',
		/** Отказ: карта отключена */
		REJECT_DISABLED: 'Mumkin emas: xarita oʻchirilgan',
		/** Отказ: хук отменил без причины; `{hook}` — имя хука */
		REJECT_HOOK: '«{hook}» ishlovchisi bekor qildi',
		/** Отказ: команда в режиме «Правки» без права предлагать */
		REJECT_REVIEW_DRAFT: 'Mumkin emas: «Tuzatishlar» rejimida oʻzgarishlar taklifga tushadi',
	},
}

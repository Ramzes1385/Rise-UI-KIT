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
		/** Название сущности для предупреждения о повторе */
		ENTITY_ROUTER: 'yoʻnaltirgich',
		/** Название сущности для предупреждения о повторе */
		ENTITY_LAYOUT: 'joylashuv',
		/** Отказ: элемент не найден; `{id}` — id */
		REJECT_NOT_FOUND: 'Mumkin emas: «{id}» topilmadi',
		/** Отказ: id занят; `{id}` — id */
		REJECT_DUPLICATE: 'Mumkin emas: «{id}» identifikatori band',
		/** Отказ: данные изменились, пока шла проверка хуками */
		REJECT_STALE: 'Tekshiruv paytida maʼlumotlar oʻzgardi — amal bekor qilindi',
		/** Шаг истории: добавление узла; `{label}` — подпись */
		CMD_ADD_NODE: '«{label}» tugunini qoʻshish',
		/** Шаг истории: добавление связи */
		CMD_ADD_EDGE: '«{source}» → «{target}» bogʻlanishini qoʻshish',
		/** Шаг истории: соединение узлов */
		CMD_CONNECT: '«{source}» → «{target}» ulash',
		/** Шаг истории: изменение элемента; `{label}` — подпись или id */
		CMD_UPDATE: '«{label}» ni tahrirlash',
		/** Шаг истории: добавление группы */
		CMD_ADD_GROUP: '«{label}» guruhini qoʻshish',
		/** Шаг истории: удаление; `{count}` — сколько элементов */
		CMD_DELETE: 'Oʻchirish: {count}',
		/** Шаг истории: перемещение; `{count}` — сколько узлов */
		CMD_MOVE: 'Koʻchirish: {count}',
		/** Шаг истории: авто-раскладка */
		CMD_LAYOUT: 'Avto-joylashuv',
		/** Шаг истории: импорт JSON */
		CMD_IMPORT: 'Maʼlumotlarni import qilish',
		/** Шаг истории: принятое предложение; `{label}` — подпись */
		CMD_ACCEPT: '«{label}» taklifi qabul qilindi',
		/** Подпись предложения без названия */
		SUGGESTION_DEFAULT: 'Tahrir taklifi',
		/** Озвучка отмены; `{label}` — шаг */
		ANNOUNCE_UNDO: 'Bekor qilindi: {label}',
		/** Озвучка повтора; `{label}` — шаг */
		ANNOUNCE_REDO: 'Takrorlandi: {label}',
		/** Отказ: нотация не допускает связь; `{kind}` — вид связи, `{from}` и `{to}` — подписи узлов */
		REJECT_CONNECTION: 'Mumkin emas: notatsiya «{from}» dan «{to}» ga «{kind}» bogʻlanishiga ruxsat bermaydi',
		/** Отказ: порт не принимает связь этого направления; `{node}` — подпись узла, `{port}` — порт */
		REJECT_PORT_DIRECTION: 'Mumkin emas: «{node}» ning «{port}» porti bunday bogʻlanishni qabul qilmaydi',
		/** Отказ: порт занят; `{node}` — подпись узла, `{port}` — порт, `{max}` — предел */
		REJECT_PORT_FULL: 'Mumkin emas: «{node}» ning «{port}» portiga koʻpi bilan {max} ta ulash mumkin',
		/** Отказ: связь возможна только внутри одного пула */
		REJECT_POOLS_SAME: 'Mumkin emas: bunday bogʻlanish faqat bitta pul ichida mumkin',
		/** Отказ: связь возможна только между разными пулами */
		REJECT_POOLS_DIFFERENT: 'Mumkin emas: bunday bogʻlanish faqat turli pullar orasida mumkin',
		/** Предупреждение разработчику: раскладка не найдена; `{id}` — id, `{fallback}` — запасная */
		WARN_UNKNOWN_LAYOUT: 'BaseFlowMap: «{id}» joylashuvi topilmadi — «{fallback}» ishlatildi',
		/** Кнопка: увеличить масштаб */
		ZOOM_IN: 'Kattalashtirish',
		/** Кнопка: уменьшить масштаб */
		ZOOM_OUT: 'Kichraytirish',
		/** Кнопка: вписать карту в область */
		FIT: 'Ekranga sigʻdirish',
		/** Масштаб в процентах; `{percent}` — значение */
		ZOOM_VALUE: 'Masshtab {percent} %',
		/** Подпись панели инструментов карты */
		TOOLBAR: 'Xarita vositalari',
		/** Подпись и подсказка поля поиска узла */
		SEARCH: 'Tugunni topish',
		/** Подсказка при прокрутке колесом без Ctrl */
		WHEEL_HINT: 'Masshtab: Ctrl yoki ⌘ va sichqoncha gʻildiragi',
		/** Подсказка клавиш для скринридера */
		KEYBOARD_HINT:
			'Strelkalar — tugunlar orasida, ] va [ — tugun bogʻlanishlari boʻyicha, Enter — tanlash, Escape — tanlovni bekor qilish',
		/** Заголовок структурного списка карты */
		LIST_TITLE: 'Xarita tuzilmasi',
		/** Заголовок списка узлов */
		LIST_NODES: 'Tugunlar',
		/** Заголовок списка связей */
		LIST_EDGES: 'Bogʻlanishlar',
		/** Текст пустой карты */
		EMPTY: 'Xaritada hozircha tugun yoʻq',
		/** Подпись загрузки карты */
		LOADING: 'Xarita yuklanmoqda…',
		/** Статус: всё работает */
		STATUS_OK: 'Ishlayapti',
		/** Статус: предупреждение */
		STATUS_WARNING: 'Ogohlantirish',
		/** Статус: ошибка */
		STATUS_ERROR: 'Xato',
		/** Статус: недоступен */
		STATUS_DOWN: 'Mavjud emas',
		/** Статус: нет данных */
		STATUS_UNKNOWN: 'Maʼlumot yoʻq',
		/** Описание узла для скринридера; `{label}` — подпись, `{kind}` — вид */
		NODE_ARIA: '{label}, {kind}',
		/** Описание узла со статусом; `{status}` — статус */
		NODE_ARIA_STATUS: '{label}, {kind}, holati: {status}',
		/** Число связей узла; `{incoming}` — входящих, `{outgoing}` — исходящих */
		ARIA_LINKS: 'Kiruvchi bogʻlanish: {incoming}, chiquvchi: {outgoing}',
		/** Описание связи; `{kind}` — вид, `{source}` и `{target}` — подписи узлов */
		EDGE_ARIA: '{kind}: {source} → {target}',
		/** Описание связи с подписью; `{label}` — подпись связи */
		EDGE_ARIA_LABELED: '{kind} «{label}»: {source} → {target}',
		/** Озвучка выбора; `{label}` — подпись */
		ANNOUNCE_SELECTED: 'Tanlandi: {label}',
		/** Озвучка снятия выбора */
		ANNOUNCE_CLEARED: 'Tanlov bekor qilindi',
		/** Заголовок ошибки загрузки карты */
		ERROR_TITLE: 'Xaritani koʻrsatib boʻlmadi',
		/** Подпись холста для скринридера; `{title}` — название карты */
		CANVAS_ARIA: 'Sxema: {title}',
		/** Режим «Просмотр» в переключателе шапки */
		MODE_VIEW: 'Koʻrish',
		/** Режим «Правка» в переключателе шапки */
		MODE_EDIT: 'Tahrirlash',
		/** Режим «Правки» в переключателе шапки */
		MODE_REVIEW: 'Koʻrib chiqish',
		/** Подпись переключателя режимов */
		MODES: 'Xarita rejimi',
	},
}

/** Карта BaseFlowMap3D: подписи нижней панели, переход в 2D, объявления и предупреждения о 3D-полях данных */
export const ruFlowMap3d = {
	/** Тип области для скринридера (`aria-roledescription`) */
	ROLE: '3D-карта связей',
	/** Сообщение `role="status"`, когда вместо 3D показана карта в 2D: нет WebGL */
	FALLBACK_UNSUPPORTED: 'Браузер не поддерживает 3D — показана карта в 2D',
	/** То же, когда рендерер не запустился или контекст потерян */
	FALLBACK_ERROR: 'Не удалось запустить 3D — показана карта в 2D',
	/** Плашка на время сборки сцены */
	BUILDING: 'Собираю 3D-сцену…',
	/** Кнопка на плашке отката: открыть 2D */
	OPEN_2D: 'Открыть карту в 2D',
	/** Переключатель вида в нижней панели */
	VIEW: 'Вид карты',
	VIEW_3D: '3D',
	VIEW_2D: '2D',
	/** Нижняя панель управления сценой */
	DOCK: 'Управление сценой',
	/** Переключатель частиц трафика */
	PARTICLES: 'Частицы',
	/** Переключатель «Слои» */
	LAYERS: 'Слои',
	/** Кнопка пресета камеры «1»: изометрия */
	PRESET_1: 'Вид 1: изометрия',
	/** Кнопка пресета камеры «2»: изометрия, повёрнутая на 90° */
	PRESET_2: 'Вид 2: изометрия, поворот на 90°',
	/** Кнопка «Правка»: правка карты в 2D-виде */
	EDIT: 'Правка',
	/** Кнопка снимка сцены */
	SNAPSHOT: 'Снимок сцены',
	/** Группа кнопок масштаба */
	ZOOM: 'Масштаб',
	/** Подсказка над сценой */
	HINT: 'Перетаскивание — поворот · Ctrl + колесо — масштаб',
	/** Дополнение к подсказке клавиатуры ядра сцены: связи и поиск по названию */
	KEYBOARD_HINT_FLOW:
		'Квадратные скобки — по связям вперёд и назад, буквы — поиск узла по названию; если название начинается с Q, E, R или C, первую букву — с Shift',
	/** Раздел скрытого списка: узлы без группы */
	LIST_NO_GROUP: 'Без группы',
	/** Объявление `aria-live`: показан 3D */
	ANNOUNCE_VIEW_3D: 'Показан 3D-вид',
	/** Объявление `aria-live`: показан 2D */
	ANNOUNCE_VIEW_2D: 'Показан 2D-вид',
	ANNOUNCE_LAYERS_ON: 'Слои включены',
	ANNOUNCE_LAYERS_OFF: 'Слои выключены',
	ANNOUNCE_PARTICLES_ON: 'Частицы включены',
	ANNOUNCE_PARTICLES_OFF: 'Частицы выключены',
	/** Объявление при переходе стрелками; `{name}` — узел, `{status}` — статус (может быть пустым) */
	ANNOUNCE_FOCUS: '{name}, {status}',
	/** Объявление после снимка сцены */
	ANNOUNCE_SNAPSHOT: 'Снимок сцены готов',
	/** Ошибка `exportSvg`, когда 2D-вид не подключён */
	ERROR_EXPORT_SVG: 'BaseFlowMap3D: SVG строится в 2D-виде — откройте 2D и повторите',
	/** Ошибка `exportPng`, когда сцена не собрана */
	ERROR_EXPORT_PNG: 'BaseFlowMap3D: сцена ещё не собрана — снимок невозможен',
	/** Предупреждение модели узла; `{message}` — текст реестра */
	WARN_MODEL: 'BaseFlowMap3D: {message}',
	/** Поворот узла не кратен 90°; `{id}`, `{value}`, `{rounded}` */
	WARN_ROTATION: 'BaseFlowMap3D: у узла «{id}» поворот {value}° не кратен 90° — взято {rounded}°',
	/** Масштаб узла не больше нуля; `{id}`, `{value}` */
	WARN_SCALE: 'BaseFlowMap3D: у узла «{id}» масштаб {value} не больше 0 — взят 1',
	/** Подъём узла не число; `{id}` */
	WARN_ELEVATION: 'BaseFlowMap3D: у узла «{id}» подъём не число — взят 0',
	/** Неизвестная форма связи; `{id}`, `{value}` */
	WARN_EDGE_SHAPE: 'BaseFlowMap3D: у связи «{id}» форма «{value}» неизвестна — нарисована лента',
	/** Высота дуги не больше нуля; `{id}`, `{value}` */
	WARN_EDGE_HEIGHT: 'BaseFlowMap3D: у связи «{id}» высота дуги {value} не больше 0 — взята 1,5',
	/** Неизвестное основание группы; `{id}`, `{value}` */
	WARN_GROUP_BASE: 'BaseFlowMap3D: у группы «{id}» основание «{value}» неизвестно — взята пунктирная рамка',
	/** Неизвестный пресет камеры в `view3d.camera`; `{value}` */
	WARN_CAMERA: 'BaseFlowMap3D: view3d.camera «{value}» неизвестен — взята изометрия',
	/** `view3d.unit` не больше нуля; `{value}` */
	WARN_UNIT: 'BaseFlowMap3D: view3d.unit {value} не больше 0 — взято 40',
	/** Неизвестное качество в `view3d.quality`; `{value}` */
	WARN_QUALITY: 'BaseFlowMap3D: view3d.quality «{value}» неизвестно — взято auto',
	/** Узлов больше предела; `{count}`, `{max}` */
	WARN_CROWDED: 'BaseFlowMap3D: узлов {count} — больше {max}, сцена может отставать',
	/** Подсказка над сценой в режиме правки */
	EDIT_HINT: 'Правка: тяните узел — перемещение, R — поворот, C — связь, Delete — удалить',
	/** Подсказка, пока включена протяжка связи */
	EDIT_HINT_LINK: 'Связь: щёлкните по узлу-цели или протяните линию · Esc — отмена',
	/** Скрытая подсказка клавиатуры в режиме правки */
	KEYBOARD_HINT_EDIT:
		'Правка: стрелки — сдвиг узла на шаг сетки, Alt и стрелки — к соседнему узлу, R — поворот, C — связь, Delete — удалить, Enter — свойства, Ctrl Z — отмена',
	/** Имя панели выбранного узла */
	EDIT_TOOLBAR: 'Правка объекта',
	EDIT_ROTATE: 'Повернуть 90°',
	EDIT_SWAP: 'Заменить модель',
	EDIT_LINK: 'Связать',
	EDIT_REMOVE: 'Удалить',
	/** Название панели при нескольких выбранных узлах */
	EDIT_SELECTED_MANY: 'Узлов: {count}',
	EDIT_ON: 'Режим правки включён',
	EDIT_OFF: 'Режим правки выключен',
	EDIT_MOVED: 'Узел перемещён',
	EDIT_ROTATED: 'Узел повёрнут: {angle}°',
	EDIT_REMOVED: 'Удалено узлов: {count}',
	EDIT_MODEL_REPLACED: 'Модель заменена: {title}',
	EDIT_TINT_SET: 'Акцент изменён',
	EDIT_STATUS_SET: 'Статус изменён',
	EDIT_RENAMED: 'Название изменено',
	EDIT_POSE_SET: 'Положение изменено',
	EDIT_LINKED: 'Связь создана: {from} → {to}',
	EDIT_LINK_FAILED: 'Связь не создана: {reason}',
	EDIT_FAILED: 'Правка не выполнена: {reason}',
	/** Причина по умолчанию, когда ядро карты не назвало свою */
	EDIT_NOT_APPLIED: 'изменение не применено',
	EDIT_BLOCKED: 'Клетка занята — узел не перемещён',
	EDIT_CANCELLED: 'Перенос отменён',
	EDIT_LINK_START: 'Связать «{name}»: выберите цель стрелками и нажмите Enter или щёлкните по узлу',
	EDIT_LINK_OFF: 'Связывание отменено',
	LINK_SELF: 'Нельзя соединить узел с самим собой',
	LINK_NO_TARGET: 'Выберите узел-цель',
	LINK_CAN: 'Связать с «{name}»: можно',
	LINK_CANNOT: 'Связать с «{name}»: нельзя. {reason}',
	/** Подпись шага истории при правке нескольких узлов */
	CMD_EDIT_NODES: 'Правка узлов: {count}',
	PALETTE_TITLE: 'Заменить модель',
	PALETTE_CURRENT: 'сейчас: {title}',
	PALETTE_SCHEME: 'Схема',
	PALETTE_MORE: 'Ещё в реестре',
	PALETTE_OWN: 'Своя модель',
	PALETTE_URL: 'Ссылка на модель GLB или GLTF',
	PALETTE_URL_PLACEHOLDER: 'https://cdn.example.ru/model.glb',
	PALETTE_LOAD: 'Загрузить',
	PALETTE_CLOSE: 'Закрыть',
	PALETTE_URL_INVALID: 'Адрес модели не подходит: нужна ссылка http, https или путь к файлу',
	INSPECTOR: 'Свойства узла',
	INSPECTOR_EYEBROW: 'Режим правки',
	INSPECTOR_EMPTY: 'Выберите узел на схеме — здесь появятся название, модель, цвет и статус. Пустое место — поворот сцены.',
	FIELD_NAME: 'Название',
	FIELD_TYPE: 'Тип узла',
	FIELD_STATUS: 'Статус',
	STATUS_OK: 'Норма',
	STATUS_WARNING: 'Задержки',
	STATUS_DOWN: 'Сбой',
	/** Раздел свойств: поля 3D узла */
	SECTION_3D: '3D',
	FIELD_MODEL: 'Модель',
	/** Ключ модели узла в данных */
	MODEL_KEY: 'model: {key}',
	MODEL_REPLACE: 'Заменить',
	FIELD_TINT: 'Акцент',
	TINT_GROUP: 'Акцентный цвет',
	TINT_SWATCH: 'Цвет {index}',
	TINT_CUSTOM: 'Свой цвет',
	FIELD_POSITION: 'Положение',
	POSITION_VALUE: 'x {x} · y {y} · {angle}°',
	POSITION_ROTATE: 'Повернуть',
	FIELD_SCALE: 'Масштаб',
	FIELD_ELEVATION: 'Подъём',
	UNDO: 'Отменить',
	REDO: 'Повторить',
	HISTORY: 'Правок: {count}',
	HISTORY_UNDO: 'Правок: {count} · Отмена · {label}',
}

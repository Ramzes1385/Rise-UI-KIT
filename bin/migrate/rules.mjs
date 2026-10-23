/** Таблицы правил кодмода: что переименовывается само (механика) и о чём предупреждаем (решает человек). Источник — docs/v2/MIGRATION.md. */

export const KIT = '@ramzes1385/rise-ui-kit'
export const MIGRATION_URL = 'https://github.com/Ramzes1385/Rise-UI-KIT/blob/main/docs/v2/MIGRATION.md'

/** Якорь заголовка Markdown по правилам GitHub: строчные буквы, знаки препинания и символы убраны, пробел → дефис. */
export function slugify(title) {
	return title
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s_-]/gu, '')
		.trim()
		.replace(/\s/g, '-')
}

/** Заголовки MIGRATION.md (без обратных кавычек), на которые ссылаются предупреждения. */
export const SECTION = {
	order: 'Порядок перехода',
	brief: 'Коротко: что нового и что изменилось',
	utils: 'Утилиты: объект вместо длинного списка параметров (порция С.5)',
	slots: 'Слоты и props, которые компонент не показывал',
	crumbs: 'BaseBreadcrumbs: крошки — ссылки',
	megaLeaf: 'BaseMegaMenu: листья — ссылки',
	menus: 'Меню и боковая панель (эпик menus, порции Р.26–Р.29)',
	treeLinks: 'BaseTree: узлы-ссылки',
	formField: 'BaseFormField: контекст для контрола внутри',
	inputAttrs: 'BaseInput и BaseTextarea: ariaLabel и inputAttrs',
	seo: 'Р.35 — SEO: BaseBreadcrumbs, BaseAccordion, BaseRating',
	overlays: 'Задача fu-overlays: BaseModal, BaseSlideover, BaseDropdown (FOLLOW_UPS № 17–19)',
	tabs: 'Задача fu-tour-tabs: BaseTour и BaseTabs (FOLLOW_UPS № 22, № 26)',
	upload: 'BaseFileUpload: прогресс — от приложения, без имитации (FOLLOW_UPS № 37, FU-2)',
	media: 'Задача fu-media: просмотр BaseImage, карусель BaseSlider, токены медиа',
	tableAudit: 'Задача table-audit',
	tableSearch: 'Задача table-search',
	chatFeatures: 'Задача chat-features: BaseChat',
	fixChat: 'Задача fix-chat',
	formsNames: 'Задача fu-forms: имена и контекст полей форм',
	tokenSplit: 'Задача fix-a11y-ssr: доступность и серверный рендер',
	text: 'BaseText: weight по умолчанию не задан (ломающее, FOLLOW_UPS № 43)',
	animation: 'BaseAnimation: классы переходов с префиксом rise- (ломающее, FOLLOW_UPS № 25)',
	mediaCss: 'Стили плеера отдельным файлом media.css (ломающее, PLAN Н.2)',
	tooltip: 'BaseTooltip',
	popoverArrow: 'Эпик overlays-nav: стрелка у всплывающих окон (порция Р.9)',
	emojiPicker: 'Эпик chat: BaseChat — BaseEmojiPicker в поле ввода (порция Р.6)',
	fuNav: 'Задача fu-nav: доступность навигации (FOLLOW_UPS № 27, № 30)',
	sliderThumbs: 'Задача feat-slider-vertical-thumbs: BaseSlider — вертикальная лента миниатюр',
	stepperLayout: 'Задача fix-stepper-layout: BaseStepper на узкой ширине',
	motionCore: 'Задача motion-core: система движения (решение research-motion)',
	themeData: 'Задача theme-data: темизация и движение группы Data',
	polish1: 'Задача polish-1: хвосты плана 13.10',
	compose1: 'Задача compose-1',
	compose2: 'Задача compose-2',
	compose3: 'Задача compose-3',
	editorPickers: 'Задача editor-pickers',
	editor2: 'Задача editor-2',
	wave3Fix: 'Задача wave3-fix: правки после проверки волны 3',
	wave7Fix: 'Задача wave7-fix',
	fixTokens: 'Задача fix-tokens',
	storiesInfra: 'Задача stories-infra: BaseTag — колонка значка',
	smallFixes7c: 'Задача small-fixes-7c: мелкие правки после new-marquee, fu-media, fu-upload-docs, fu-overlays',
	imageMap: 'Задача new-image-map: BaseImageMap',
	l10nDeep: 'Задача w14-l10n-deep',
	releasePrep: 'Задача release-prep',
	lazyLocale: 'Задача w16-lazy-locale !',
}

/** Готовые словари, которые в 2.0 не встроены: без `createUiKitPlugin` приложение подключает их `registerLocale` (задача w16-lazy-locale). */
export const OPT_IN_LOCALES = ['en', 'kk', 'uz', 'zh', 'ja']

/** Признак, что проект подключает словари сам: `registerLocale(…)` или плагин кита, который подключает `en`. */
export const LOCALE_REGISTRATION = /\b(?:registerLocale|createUiKitPlugin)\b/

export const DEFAULT_SLOT_SECTION = SECTION.slots

/** Наборы суффиксов Vue Transition. */
const TRANSITION_STATES = ['enter-active', 'enter-from', 'enter-to', 'leave-active', 'leave-from', 'leave-to']

/** Имена BaseAnimation: у `list` есть ещё `move`. Классы получили префикс `rise-`. */
export const ANIMATION_NAMES = [
	'fade',
	'slide-up',
	'slide-down',
	'slide-left',
	'slide-right',
	'scale',
	'bounce',
	'rotate',
	'flip',
	'zoom',
	'collapse',
	'list',
]

/** Переименование глобальных классов переходов: [регулярное выражение по селектору, новое имя перехода, имя перехода у приложения при конфликте]. */
export const CLASS_RENAMES = [
	...ANIMATION_NAMES.map(name => ({
		from: name,
		to: `rise-${name}`,
		states: name === 'list' ? [...TRANSITION_STATES, 'move'] : TRANSITION_STATES,
		needsAnimation: true,
		section: SECTION.animation,
	})),
	{ from: 'modal-fade', to: 'base-modal', states: TRANSITION_STATES, needsAnimation: false, section: SECTION.order },
	{ from: 'slideover', to: 'base-slideover', states: TRANSITION_STATES, needsAnimation: false, section: SECTION.order },
	{ from: 'dropdown', to: 'base-dropdown', states: TRANSITION_STATES, needsAnimation: false, section: SECTION.order },
]

/** Классы переходов подсказки: кит объединил четыре стороны в один `base-tooltip-*`, механически сторону не сохранить. */
export const TOOLTIP_CLASS =
	/\.tooltip-(top|bottom|left|right)-(enter-active|enter-from|enter-to|leave-active|leave-from|leave-to)(?![\w-])/g

/** Пропсы, которые были объявлены, но не работали: удаляются из шаблона. */
export const DEAD_PROPS = {
	BaseAnimation: ['variant', 'size-scale', 'color'],
	BaseImage: ['variant'],
	BaseSlider: ['variant', 'color'],
}

/** Функции utils, у которых список параметров стал объектом. */
export const OBJECT_ARGS = {
	calcTotalColumns: {
		counts: [4],
		build: a => `${a[0]}, { ${pair('isSelectable', a[1])}, ${pair('hasRowNumber', a[2])}, ${pair('hasExpandableRows', a[3])} }`,
	},
	resolveTooltipPlacement: {
		counts: [4, 5],
		build: a => `${a[0]}, { ${pair('coords', a[1])}, ${pair('size', a[2])}, ${pair('viewport', a[3])} }${a[4] ? `, ${a[4]}` : ''}`,
	},
	calcTooltipShift: { counts: [4], build: a => `${a[0]}, { ${pair('coords', a[1])}, ${pair('size', a[2])}, ${pair('viewport', a[3])} }` },
}

function pair(key, value) {
	return key === value ? key : `${key}: ${value}`
}

/** Экспорты, которых в 2.0 нет: только предупреждение. */
export const REMOVED_EXPORTS = {
	storybookUtils: ['storybookUtils удалён из utils: хелперы историй Storybook в пакет не входят', SECTION.brief],
	buildBreadcrumbsSchema: ['buildBreadcrumbsSchema удалена: замените на serializeJsonLd или проп seo у BaseBreadcrumbs', SECTION.seo],
	SchemaBreadcrumbItem: ['тип SchemaBreadcrumbItem удалён вместе с buildBreadcrumbsSchema', SECTION.seo],
	CalendarEvent: ['корневой тип CalendarEvent удалён: у BaseCalendar события заменены на highlights (CalendarHighlight)', SECTION.slots],
	useMegaMenuTree: ['useMegaMenuTree удалён вместе с columns/layout у BaseMegaMenu', SECTION.menus],
	MegaMenuColumn: ['тип MegaMenuColumn удалён: меню строится из items с вложенными уровнями', SECTION.menus],
	MegaMenuLayout: ['тип MegaMenuLayout удалён: меню строится из items с вложенными уровнями', SECTION.menus],
	...Object.fromEntries(
		[
			'useTableComposition',
			'useTableColumns',
			'useTableToolbar',
			'UseTableCompositionOptions',
			'UseTableColumnsOptions',
			'UseTableColumnsReturn',
			'UseTableToolbarOptions',
			'UseTableToolbarReturn',
			'FilterOperatorOption',
		].map(name => [
			name,
			[`${name} убран из composables: нужен emit и контекст BaseTable, отдельно от таблицы он не работал`, SECTION.tableAudit],
		]),
	),
}

/** Экспорты, у которых изменился контракт: предупреждение при импорте. */
export const CHANGED_EXPORTS = {
	useChatActions: [
		'контракт useChatActions изменился (handleKickMember/handleBanMember убраны, ban-member отдаёт { memberId })',
		SECTION.fixChat,
	],
	useChatState: [
		'контракт useChatState изменился (закрепы: currentPinnedMessage, handleNextPinned, handlePrevPinned убраны)',
		SECTION.fixChat,
	],
	useImageZoom: ['useImageZoom: клавиатура слушается на window, проверьте свои обработчики и тесты', SECTION.media],
	useSlider: ['useSlider: изменились фокус и клавиатура, проверьте свои обработчики и тесты', SECTION.media],
	useTableSelection: ['useTableSelection().selectedIds стал ComputedRef: читайте .value', SECTION.tableSearch],
	useTableFilter: ['useTableFilter().addFilter принимает один объект { column, operator, value }', SECTION.tableAudit],
}

/** Ключи словаря, удалённые из ru/en: раздел → [ключ, раздел MIGRATION]. */
export const REMOVED_LOCALE_KEYS = {
	INSERT_EMOJI: SECTION.emojiPicker,
	CLOSE_PANEL: SECTION.fixTokens,
	ATTACH_ERRORS: SECTION.wave7Fix,
	VIOLATION: SECTION.wave7Fix,
	URL_PROMPT: SECTION.editor2,
	FILE_STATUS_PENDING: SECTION.smallFixes7c,
	FILE_MAX_COUNT_PREFIX: SECTION.smallFixes7c,
	EXIT_FULLSCREEN: SECTION.imageMap,
	PARTICIPANTS_SUFFIX: SECTION.l10nDeep,
}

/** Компоненты, у которых убран слот `default`: [замена]. */
export const DEFAULT_SLOT_REMOVED = {
	BaseChat: 'чат строится из messages, title и других props',
	BaseFileUpload: 'используйте слот trigger',
	BaseMenu: 'пункты задаются через items',
	BaseNotification: 'уведомления: add() или items, обёртка приложения: BaseApp',
	BasePagination: 'содержимого у компонента нет',
	BasePin: 'содержимого у компонента нет',
	BaseRadio: 'варианты: options, подпись: слот option',
	BaseRange: 'ползунок: слот thumb',
	BaseRating: 'иконки: props icon и filledIcon',
	BaseSelect: 'варианты: options, вид: слоты option, selected, header, footer, empty',
	BaseStepper: 'слоты header, footer, item',
	BaseTable: 'колонки: columns, ячейки: cell-<key>, прочее: header, footer, empty, toolbar-*',
	BaseTextarea: 'содержимого у компонента нет',
}

/** Предупреждения по атрибутам и слотам тегов шаблона. */
export const TAG_WARNINGS = [
	{
		tags: ['BaseModal'],
		kind: 'event',
		keys: ['confirm'],
		id: 'modal-confirm',
		text: 'BaseModal: событие confirm удалено (окно его не эмитило), кнопки подтверждения — в слоте footer',
		section: SECTION.overlays,
	},
	{
		tags: ['BaseCalendar'],
		kind: 'prop',
		keys: ['events'],
		id: 'calendar-events',
		text: 'BaseCalendar: проп events удалён, события заменены на highlights { date, label, color }',
		section: SECTION.slots,
	},
	{
		tags: ['BaseCalendar'],
		kind: 'slot',
		keys: ['navigation', 'event'],
		id: 'calendar-slots',
		text: 'BaseCalendar: слоты navigation и event удалены (шапка — слот header с { month, year })',
		section: SECTION.slots,
	},
	{
		tags: ['BaseMegaMenu'],
		kind: 'prop',
		keys: ['columns', 'layout', 'hover-delay'],
		id: 'mega-props',
		text: 'BaseMegaMenu: пропсы columns, layout, hoverDelay удалены (меню из items с вложенными уровнями, задержки — openDelay/closeDelay)',
		section: SECTION.menus,
	},
	{
		tags: ['BaseMegaMenu'],
		kind: 'event',
		keys: ['navigate', 'item-click', 'column-click'],
		id: 'mega-events',
		text: 'BaseMegaMenu: события navigate, item-click, column-click заменены на select',
		section: SECTION.menus,
	},
	{
		tags: ['BaseMegaMenu'],
		kind: 'slot',
		keys: ['column-title', 'nav-item', 'item'],
		id: 'mega-slots',
		text: 'BaseMegaMenu: слоты column-title, nav-item, item заменены на link',
		section: SECTION.menus,
	},
	{
		tags: ['BaseChat'],
		kind: 'event',
		keys: ['avatar-click'],
		id: 'chat-avatar',
		text: 'BaseChat: avatar-click в шапке открывает вкладку «Информация»; «Написать сообщение» — событие write-message',
		section: SECTION.fixChat,
	},
	{
		tags: ['BaseChat'],
		kind: 'event',
		keys: ['ban-member', 'add-member'],
		id: 'chat-members',
		text: 'BaseChat: ban-member отдаёт только { memberId }, add-member — без аргументов',
		section: SECTION.chatFeatures,
	},
	{
		tags: ['BaseFormField'],
		kind: 'prop',
		keys: ['for'],
		id: 'formfield-for',
		text: 'BaseFormField: for не нужен вокруг контролов кита — они сами сообщают обёртке свой id',
		section: SECTION.formField,
	},
	{
		tags: ['BaseInput', 'BaseTextarea'],
		kind: 'prop',
		keys: ['name', 'autocomplete', 'data-testid'],
		id: 'input-attrs',
		text: 'name, autocomplete и data-testid на корне BaseInput/BaseTextarea не попадают в поле: передайте через inputAttrs',
		section: SECTION.inputAttrs,
	},
]

/** Теги, события которых в 2.0 переходят по ссылке сами: router.push в обработчике даст двойной переход. */
export const SELF_NAVIGATING = ['BaseBreadcrumbs', 'BaseMegaMenu', 'BaseTree', 'BaseSideBar']

/** Компоненты с aria-label и role="group" на корне: имя теперь у самого контрола. */
export const ARIA_GROUP_TAGS = ['BaseCheckbox', 'BaseSwitch', 'BaseSelect', 'BaseRadio', 'BaseColorPicker']

/** Заголовки и `strong` без явного weight стали жирными. */
export const BOLD_TEXT_TAGS = /^(?:h[1-6]|strong|b)$/

/** Токены, у которых разведены запасные значения или которые удалены: имя → [что делать, раздел MIGRATION]. */
export const CSS_TOKENS = {
	...Object.fromEntries(
		[
			['--rise-anchor-gap', '--rise-anchor-horizontal-gap', 'горизонтального Anchor', SECTION.tokenSplit],
			['--rise-anchor-padding-x', '--rise-anchor-horizontal-padding-x', 'горизонтального Anchor', SECTION.tokenSplit],
			['--rise-anchor-padding-y', '--rise-anchor-horizontal-padding-y', 'горизонтального Anchor', SECTION.tokenSplit],
			['--rise-tabs-list-radius', '--rise-tabs-rounded-list-radius', 'Tabs rounded', SECTION.tokenSplit],
			['--rise-tabs-indicator-radius', '--rise-tabs-rounded-indicator-radius', 'Tabs rounded', SECTION.tokenSplit],
			['--rise-stepper-indicator-radius', '--rise-stepper-indicator-square-radius', 'Stepper square', SECTION.tokenSplit],
			['--rise-bottom-nav-border', '--rise-bottom-nav-outline-border', 'BottomNav outline', SECTION.tokenSplit],
			['--rise-tabs-indicator-bg', '--rise-tabs-pills-indicator-bg', 'подложки Tabs pills и rounded', SECTION.polish1],
			['--rise-anchor-indicator-bg', '--rise-anchor-soft-indicator-bg', 'Anchor soft', SECTION.polish1],
		].map(([from, to, target, section]) => [from, [`${from} больше не красит ${target}: для этого задайте ${to}`, section]]),
	),
	'--rise-text-font-weight': [
		'токен --rise-text-font-weight удалён: вес задайте через defaults.BaseText.weight или CSS по классу',
		SECTION.text,
	],
	'--kanban-ease': ['--kanban-ease удалена: карточки едут на токенах --rise-ease-emphasized и --rise-duration-base', SECTION.themeData],
	'--media-next-seconds': ['--media-next-seconds переименована в --media-next-duration (значение сверьте с документом)', SECTION.polish1],
}

/** Алиасы 1.x, которые остались читаемыми, но компоненты их больше не читают. */
export const ALIAS_TOKENS = new RegExp(
	'^--(?:color-(?:accent(?:-hover)?|bg(?:-soft)?|border|code-(?:bg|border|header-bg|text)|error|info|primary(?:-soft(?:-hover)?)?|' +
		'sidebar-[a-z-]+|success|surface(?:-muted)?|text(?:-inverse|-muted)?|warning|white)|' +
		'border-radius-(?:base|full|lg|sm)|shadow-(?:sm|md|lg|xl)|transition-(?:base|slow)|font-family-(?:base|heading|mono))$',
)

/** Удалённые и изменившиеся селекторы CSS: [регулярное выражение по маске кода, текст, раздел]. */
export const CSS_SELECTORS = [
	[
		/\.base-mega-menu__(?:column|title|nav[\w-]*|node[\w-]*|dropdown|sub-list)(?![\w-])/g,
		'классы колонок и узлов BaseMegaMenu удалены, меню перестроено',
		SECTION.menus,
	],
	[
		/\.base-popover__arrow--(?:top|bottom|left|right)(?![\w-])/g,
		'модификаторы стрелки popover убраны: сторону задаёт base-dropdown__panel--arrow-<край>',
		SECTION.popoverArrow,
	],
	[
		/\.base-chat-input__emoji-item(?![\w-])/g,
		'класс base-chat-input__emoji-item удалён: эмодзи выбирает BaseEmojiPicker',
		SECTION.emojiPicker,
	],
	[
		/\.base-table__settings-(?:list|item|option)(?![\w-])/g,
		'классы панели «Колонки» BaseTable удалены: теперь это BaseDropdownMenu',
		SECTION.overlays,
	],
	[
		/\.base-tour__progress-bar-fill(?![\w-])/g,
		'часть progress-bar-fill у BaseTour удалена: полоса шагов — BaseProgress',
		SECTION.compose2,
	],
	[/\.base-search-(?:modal|sidebar)-[\w-]+/g, 'переходы BaseSearch заменены на base-modal-* и base-slideover-*', SECTION.compose3],
	[
		/\.base-image-zoom-(?:enter|leave)-(?:active|from|to)(?![\w-])/g,
		'переходы зума BaseImage заменены на base-modal-*',
		SECTION.compose3,
	],
	[
		/\.base-editor__btn--file(?![\w-])/g,
		'класс base-editor__btn--file удалён: «Изображение» и «Видео» — BaseButton',
		SECTION.editorPickers,
	],
	[
		/\.base-media-player__row-(?:enter-from|leave-to)(?![\w-])/g,
		'классы второго ряда BaseMediaPlayer удалены: ряд раскрывают Web Animations',
		SECTION.wave3Fix,
	],
	[
		/\.base-table__filter-tag-text(?![\w-])/g,
		'класс base-table__filter-tag-text удалён: теги фильтров рисует BaseBadge',
		SECTION.compose2,
	],
	[/\.base-checklist__checkbox(?![\w-])/g, 'класс base-checklist__checkbox заменён разметкой BaseCheckbox', SECTION.compose1],
	[
		/\.base-tag__main\s*>\s*\.base-tag__icon(?![\w-])/g,
		'значок BaseTag теперь в двух обёртках: замените селектор на .base-tag__icon',
		SECTION.storiesInfra,
	],
	[/\bdiv\.base-tooltip(?![\w-])/g, 'у обёртки BaseTooltip теперь span: уберите тег из селектора', SECTION.tooltip],
	[
		/\.base-slider\s*>\s*\.base-slider__(?:stage|navigation)(?![\w-])/g,
		'у BaseSlider появился слой __body: стрелки и сцена внутри него',
		SECTION.sliderThumbs,
	],
	[/\.base-animation\s*>\s*[.\w]/g, 'у BaseAnimation collapse содержимое лежит в .base-animation__inner', SECTION.motionCore],
	[/\blabel\.base-switch__row(?![\w-])/g, '.base-switch__row теперь div, а не label', SECTION.formsNames],
	[
		/\.base-stepper__step\s*:(?:hover|focus[\w-]*|active)/g,
		'hover и focus шага BaseStepper перенесены на .base-stepper__trigger',
		SECTION.fuNav,
	],
	[
		/--stepper-progress-scale(?![\w-])/g,
		'линия прогресса BaseStepper перестроена: --stepper-progress-scale больше не читается',
		SECTION.stepperLayout,
	],
]

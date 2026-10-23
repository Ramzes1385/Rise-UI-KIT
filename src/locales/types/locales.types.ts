import type { ru } from '../ru'

type Base = typeof ru

/** Прежние ключи-куски составных подписей: в словарях кита их нет; заданные приложением, они работают (см. `legacyKeys.ts`) */
interface LegacyKeys {
	rating: 'OF' | 'ARIA_PREFIX'
	text: 'FILE_MAX_SIZE_PREFIX' | 'FILE_MAX_SIZE_SUFFIX'
	chat:
		| 'TYPING_SUFFIX'
		| 'PINNED_COUNTER'
		| 'SELECTED_PREFIX'
		| 'PARTICIPANTS_SUFFIX'
		| 'PROFILE_ARIA'
		| 'ADD_REACTION'
		| 'DOWNLOAD_IMAGE'
		| 'DOWNLOAD_FILE'
		| 'MEMBER_ACTIONS'
		| 'QUICK_REPLY'
		| 'REMOVE_ATTACHMENT'
}

type Legacy<K> = K extends keyof LegacyKeys ? { readonly [P in LegacyKeys[K]]?: string } : unknown

/** Строки раздела словаря: ключи как в русском словаре, значения — строки */
type Section<K extends keyof Base> = { readonly [P in keyof Base[K]]: string } & Legacy<K>

/** Формы слова для чисел: ключи — категории `Intl.PluralRules` (`one`, `few`, `many`, `other`…), `{n}` — число */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { readonly other: string }

/** Шаблоны даты с названием месяца для `calendarNames`: `{day}`, `{month}`, `{year}`, `{weekday}`, `{date}` */
export interface CalendarPatterns {
	/** День, месяц и год: `{year} ж. {day} {month}` (kk), `{day}-{month}, {year}` (uz) */
	readonly dayMonthYear: string
	/** День и месяц: `{day} {month}` */
	readonly dayMonth: string
	/** Месяц и год: `{year} ж. {month}` */
	readonly monthYear: string
	/** Дата цифрами: `{day}.{month}.{year}`; отсутствующие части отбрасываются вместе с разделителем */
	readonly numeric: string
	/** Дата и день недели: `{date}, {weekday}` (kk), `{weekday}, {date}` (uz) */
	readonly withWeekday: string
}

/**
 * Запасные названия месяцев и дней недели языка: используются, когда в браузере нет данных `Intl` для языка
 * (урезанный ICU: для `kk` формат уходит в английский, для `uz` остаются корневые «M05»).
 * Нужны только языкам, у которых такая нехватка бывает; остальным поле не задают.
 */
export interface CalendarNames {
	/** Двенадцать названий месяцев с января, как отдельное слово (заголовок): «Мамыр». Внутри даты берутся в нижнем регистре */
	readonly months: readonly string[]
	/** Двенадцать кратких названий месяцев с января: «мам.» */
	readonly monthsShort: readonly string[]
	/** Семь названий дней недели с воскресенья: «сәрсенбі» */
	readonly weekdays: readonly string[]
	/** Семь кратких названий дней недели с воскресенья: «ср» */
	readonly weekdaysShort: readonly string[]
	readonly patterns: CalendarPatterns
}

/** Единицы относительного времени, для которых у языка есть запасные фразы */
export type RelativeTimeUnit = 'minute' | 'hour' | 'day'

/**
 * Запасные фразы относительного времени («5 минут бұрын») для языка без данных `Intl.RelativeTimeFormat` в браузере;
 * `{n}` — число. Задаются вместе с `calendarNames`.
 */
export interface RelativeTimeNames {
	/** «Сейчас» (меньше минуты) */
	readonly now: string
	readonly yesterday: string
	readonly tomorrow: string
	/** В прошлом: «{n} минут бұрын» */
	readonly past: Readonly<Record<RelativeTimeUnit, string>>
	/** В будущем: «{n} минуттан кейін» */
	readonly future: Readonly<Record<RelativeTimeUnit, string>>
}

/**
 * Язык кита: строки интерфейса, языковой тег для Intl и первый день недели.
 * Свой язык — `defineLocale(en, { … })` поверх готового словаря.
 */
export interface UiKitLocale {
	/** Код языка: `ru`, `en` */
	code: string
	/** Языковой тег для Intl (даты, числа, множественное число): `ru-RU`, `en-US` */
	intl: string
	/** Первый день недели в календаре: 0 — воскресенье, 1 — понедельник */
	firstDayOfWeek: number
	/** Запасные названия месяцев и дней для браузеров без данных `Intl` этого языка; необязательно (см. `CalendarNames`) */
	calendarNames?: CalendarNames
	/** Запасные фразы относительного времени для браузеров без данных `Intl` этого языка; необязательно */
	relativeTime?: RelativeTimeNames
	text: Section<'text'>
	aria: Section<'aria'>
	tour: Section<'tour'>
	stepper: Section<'stepper'>
	filter: Section<'filter'>
	calendar: Section<'calendar'>
	colorPicker: Section<'colorPicker'>
	rating: Section<'rating'>
	player: Section<'player'>
	presentation: Section<'presentation'>
	audio: Section<'audio'>
	subtitles: Section<'subtitles'>
	transcript: Section<'transcript'>
	chat: Section<'chat'>
	editor: Section<'editor'>
	table: Section<'table'>
	tableExport: Section<'tableExport'>
	markdown: Section<'markdown'>
	ai: Section<'ai'>
	emoji: Section<'emoji'>
	mention: Section<'mention'>
	kanban: Section<'kanban'>
	list: Section<'list'>
	transfer: Section<'transfer'>
	filterBuilder: Section<'filterBuilder'>
	checklist: Section<'checklist'>
	phoneInput: Section<'phoneInput'>
	requisites: Section<'requisites'>
	dadata: Section<'dadata'>
	cryptopro: Section<'cryptopro'>
	commandPalette: Section<'commandPalette'>
	charts: Section<'charts'>
	codeBlock: Section<'codeBlock'>
	imageCompare: Section<'imageCompare'>
	imageViewer: Section<'imageViewer'>
	carousel: Section<'carousel'>
	fileUpload: Section<'fileUpload'>
	descriptions: Section<'descriptions'>
	imageMap: Section<'imageMap'>
	imageMapRoutes: Section<'imageMapRoutes'>
	imageMapEditor: Section<'imageMapEditor'>
	imageMap3d: Section<'imageMap3d'>
	flowMap3d: Section<'flowMap3d'>
	flowMap: Section<'flowMap'>
	flowScenario: Section<'flowScenario'>
	flowPanels: Section<'flowPanels'>
	flowReview: Section<'flowReview'>
	flowEditor: Section<'flowEditor'>
	flowServices: Section<'flowServices'>
	flowBpmn: Section<'flowBpmn'>
	flowIdef: Section<'flowIdef'>
	flowDfd: Section<'flowDfd'>
	flowEpc: Section<'flowEpc'>
	flowSequence: Section<'flowSequence'>
	flowC4: Section<'flowC4'>
	flowEventStorming: Section<'flowEventStorming'>
	scene3d: Section<'scene3d'>
	models3d: Section<'models3d'>
	jsonViewer: Section<'jsonViewer'>
	map: Section<'map'>
	textDiff: Section<'textDiff'>
	qrCode: Section<'qrCode'>
	marquee: Section<'marquee'>
	tag: Section<'tag'>
	signaturePad: Section<'signaturePad'>
	avatarCropper: Section<'avatarCropper'>
	valueWarnings: Section<'valueWarnings'>
	notificationCenter: Section<'notificationCenter'>
	commentThread: Section<'commentThread'>
	countdown: Section<'countdown'>
	eventCalendar: Section<'eventCalendar'>
	card: Section<'card'>
	result: Section<'result'>
	banner: Section<'banner'>
	cookieConsent: Section<'cookieConsent'>
	dashboardGrid: Section<'dashboardGrid'>
	gantt: Section<'gantt'>
	fileManager: Section<'fileManager'>
	formWizard: Section<'formWizard'>
	roadmap: Section<'roadmap'>
	roadmapEdit: Section<'roadmapEdit'>
	roadmap3d: Section<'roadmap3d'>
	roadmapReview: Section<'roadmapReview'>
	datePicker: Section<'datePicker'>
	warnings: Section<'warnings'>
	plural: { readonly [P in keyof Base['plural']]: PluralForms }
}

export type LocaleSection = Exclude<keyof UiKitLocale, 'code' | 'intl' | 'firstDayOfWeek' | 'plural' | 'calendarNames' | 'relativeTime'>

/** Поля языка без строк: код, тег Intl, первый день недели и запасные названия для браузеров без данных `Intl` */
export type LocaleCore = Pick<UiKitLocale, 'code' | 'intl' | 'firstDayOfWeek' | 'calendarNames' | 'relativeTime'>

/**
 * Текущий язык кита: словарь целиком (`registerLocale`, `setLocale(словарь)`) или русский по умолчанию без строк —
 * строки русского компоненты берут из своих разделов (`messages.ts`), поэтому в сборку попадают только прочитанные разделы
 */
export type ActiveLocale = LocaleCore & Partial<Omit<UiKitLocale, keyof LocaleCore>>

/** Коды готовых словарей кита: `ru` встроен, остальные подключаются через `registerLocale()` (`en` подключает и `createUiKitPlugin`) */
export const KIT_LOCALE_CODES = ['ru', 'en', 'kk', 'uz', 'zh', 'ja'] as const

/** Код готового словаря кита */
export type KitLocaleCode = (typeof KIT_LOCALE_CODES)[number]

export type LocaleOverrides = Partial<Pick<UiKitLocale, 'code' | 'intl' | 'firstDayOfWeek'>> & {
	calendarNames?: Partial<CalendarNames>
	relativeTime?: Partial<RelativeTimeNames>
} & {
	[K in LocaleSection | 'plural']?: Partial<UiKitLocale[K]>
}

/** Язык: код готового словаря (подсказка редактора; кроме `ru` — после `registerLocale()`), код своего языка из `registerLocale()` или словарь (`defineLocale`) */
export type LocaleInput = KitLocaleCode | (string & Record<never, never>) | UiKitLocale

/** Строки раздела словаря как карта: ключ — строка или `undefined` */
export type MessageMap = Readonly<Record<string, string | undefined>>

/** Правило прежнего ключа-куска: что должно быть задано и как собрать шаблон нового ключа */
export interface LegacyMessage {
	/** Старые ключи, которые должно задать приложение, чтобы подпись собралась по-старому */
	readonly requires: readonly string[]
	/** Шаблон нового ключа, собранный из старых кусков */
	readonly build: (messages: MessageMap) => string
}

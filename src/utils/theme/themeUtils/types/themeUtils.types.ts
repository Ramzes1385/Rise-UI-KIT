/** Оттенки палитры кита: от самого светлого 50 до самого тёмного 950 */
export const THEME_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

/** Оттенок палитры */
export type ThemeShade = (typeof THEME_SHADES)[number]

/** Цветовые роли кита с палитрой; нейтраль — отдельно (`ThemeNeutralPalette`) */
export const THEME_ROLES = ['primary', 'success', 'info', 'warning', 'error'] as const

/** Цветовая роль */
export type ThemeRole = (typeof THEME_ROLES)[number]

/** Палитра роли: HEX каждого оттенка */
export type ThemePalette = Record<ThemeShade, string>

/** Нейтральная палитра: оттенки 50…950 и `0` — фон светлой темы (`--rise-color-neutral-0`) */
export type ThemeNeutralPalette = ThemePalette & { 0: string }

/** Скругление темы → `--rise-radius`: `none` 0, `sm` 2px, `md` 4px (как в ките), `lg` 8px, `full` 14px (пилюли); число — пиксели */
export const THEME_RADII = ['none', 'sm', 'md', 'lg', 'full'] as const

/** Именованное скругление */
export type ThemeRadius = (typeof THEME_RADII)[number]

/** Плотность → `--rise-density`: `compact` 0.75, `default` 1, `comfortable` 1.25; число — множитель */
export const THEME_DENSITIES = ['compact', 'default', 'comfortable'] as const

/** Именованная плотность */
export type ThemeDensity = (typeof THEME_DENSITIES)[number]

/** Сила теней → `--rise-shadow-strength`: `none` 0, `soft` 0.6, `default` 1, `strong` 1.8; число — множитель */
export const THEME_SHADOWS = ['none', 'soft', 'default', 'strong'] as const

/** Именованная сила теней */
export type ThemeShadows = (typeof THEME_SHADOWS)[number]

/** Движение → `--rise-duration-fast/-/-slow` и `--rise-ease`: `none` — без анимаций, `subtle` — короче, `standard` — как в ките, `expressive` — дольше и с отскоком */
export const THEME_MOTIONS = ['none', 'subtle', 'standard', 'expressive'] as const

/** Именованное движение */
export type ThemeMotion = (typeof THEME_MOTIONS)[number]

/** Имена готовых тем `THEME_PRESETS` */
export const THEME_PRESET_NAMES = ['rise', 'corporate', 'playful', 'minimal'] as const

/** Имя готовой темы */
export type ThemePresetName = (typeof THEME_PRESET_NAMES)[number]

/** Режим, для которого считается контраст */
export type ThemeMode = 'light' | 'dark'

/** Шрифты темы → `--rise-font-sans`, `--rise-font-heading`, `--rise-font-mono`; `@font-face` подключает приложение */
export interface ThemeFonts {
	/** Основной стек */
	sans?: string
	/** Стек заголовков; не задан — как основной */
	heading?: string
	/** Моноширинный стек */
	mono?: string
}

/** Вход `createTheme`: обязательны имя и цвет бренда, остальное — по желанию (не задано — наследуется от кита или `:root` приложения) */
export interface ThemeInput {
	/** Имя темы → `[data-rise-theme="name"]`: латиница, цифры и дефис, с буквы */
	name: string
	/** Цвет бренда, HEX: встаёт на главный оттенок 700; светлый бренд затемняется до контраста 4.5:1 с белым */
	primary: string
	/** Свой цвет бренда для тёмного режима, HEX (чёрный бренд → светлая кнопка): оттенки 400 и 300 тёмной темы */
	primaryDark?: string
	/** Нейтраль: `tinted` — серый с оттенком бренда (по умолчанию), `gray` — чистый серый, HEX — тон и хрома из цвета (slate, stone…) */
	neutral?: 'tinted' | 'gray' | (string & {})
	/** Цвет роли success, HEX; не задан — палитра кита */
	success?: string
	/** Цвет роли info, HEX; не задан — палитра кита */
	info?: string
	/** Цвет роли warning, HEX; не задан — палитра кита */
	warning?: string
	/** Цвет роли error, HEX; не задан — палитра кита */
	error?: string
	/** Готовые палитры ролей вместо генератора — оттенки берутся как есть (так устроен пресет `rise`) */
	palettes?: Partial<Record<ThemeRole, ThemePalette>> & { neutral?: ThemeNeutralPalette }
	/** Скругление; число — пиксели */
	radius?: ThemeRadius | number
	/** Плотность отступов; число — множитель */
	density?: ThemeDensity | number
	/** Шрифты */
	font?: ThemeFonts
	/** Сила теней; число — множитель */
	shadows?: ThemeShadows | number
	/** Длительности и кривая анимаций */
	motion?: ThemeMotion
	/** Любые сиды и токены компонентов поверх сгенерированных (выход для крайних случаев) */
	tokens?: Partial<Record<`--rise-${string}`, string>>
}

/** Одна проверяемая пара контраста: токен текста или графики и токен фона */
export interface ThemeContrastPair {
	/** Токен переднего плана */
	fg: `--rise-${string}`
	/** Токен фона */
	bg: `--rise-${string}`
	/** Порог WCAG 2.2 AA: 4.5 — текст, 3 — графика и кольцо фокуса */
	min: number
	/** Вид пары — ключ подписи в отчёте `check-contrast.mjs` */
	kind: string
	/** Справочная пара: провал не считается ошибкой (плейсхолдер, рамка поля) */
	informational?: boolean
}

/** Строка отчёта контраста темы */
export interface ThemeContrastRow extends ThemeContrastPair {
	/** Режим */
	mode: ThemeMode
	/** Цвет переднего плана, HEX */
	fgColor: string
	/** Цвет фона, HEX */
	bgColor: string
	/** Контраст, два знака после запятой */
	ratio: number
	/** Порог взят */
	ok: boolean
}

/** Палитра из одного цвета: оттенки, главный цвет и признак подстройки */
export interface ThemePaletteResult {
	/** Оттенки 50…950 */
	shades: ThemePalette
	/** Исходный цвет */
	seed: string
	/** Цвет главного оттенка — исходный или подстроенный под контраст */
	main: string
	/** Главный цвет пришлось сдвинуть по светлоте, чтобы взять контраст 4.5:1 */
	adjusted: boolean
}

/** Тема: готовый CSS, сиды, отчёт контраста */
export interface Theme {
	/** Имя → `[data-rise-theme="name"]` */
	name: string
	/** CSS темы: литералы сидов на `[data-rise-theme="name"][data-rise-theme]`; без JS вставляется как есть */
	css: string
	/** Сиды основного правила: имя переменной → значение */
	vars: Record<string, string>
	/** Сиды тёмного режима (из `primaryDark`); пусто, если не задан */
	darkVars: Record<string, string>
	/** Контраст всех обязательных и справочных пар в светлом и тёмном режиме */
	contrast: ThemeContrastRow[]
	/** Цвет бренда пришлось сдвинуть ради контраста */
	adjusted: boolean
}

/** Переменные CSS: имя → значение (сиды темы, семантические цвета) */
export type ThemeVars = Record<string, string>

/** Чтение оттенка палитры роли из сидов темы с запасом из палитр кита */
export type ThemeShadeReader = (role: string, shade: number) => string

/** Цель дотяжки контраста: фон, порог, направление сдвига светлоты (1 — светлее, -1 — темнее) и шаг */
export interface ThemeContrastTarget {
	bg: string
	min: number
	direction: 1 | -1
	step?: number
}

/** Сиды цветов темы: основное правило, тёмный режим и признак подстройки бренда */
export interface ThemeColorSeeds {
	vars: ThemeVars
	darkVars: ThemeVars
	adjusted: boolean
}

import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Вид карточки показателя: `default` — с рамкой, `soft` — на приглушённом фоне без рамки,
 * `outline` — заметная рамка без фона, `ghost` — без рамки и фона (внутри своей карточки)
 */
export const STAT_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части карточки для пропа `ui` (БЭМ-элементы `.base-stat__<часть>`, `root` — корень):
 * body — список `dl` с подписью, значением и изменением, label — подпись `dt`, value — ячейка значения `dd`,
 * content — значение внутри ячейки (текст или слот `value`; заглушка загрузки сменяется им с перекрёстным затуханием),
 * change — строка изменения `dd`, trend — стрелка направления, delta — число изменения, period — подпись периода `changeLabel`,
 * icon — значок в углу (слот `icon`), chart — место графика (слот `chart`).
 */
export const STAT_PARTS = ['body', 'label', 'value', 'content', 'change', 'trend', 'delta', 'period', 'icon', 'chart'] as const

export type BaseStatPart = (typeof STAT_PARTS)[number]

/** Направление изменения: `up` — рост, `down` — снижение, `flat` — без изменений */
export type StatTrend = 'up' | 'down' | 'flat'

/** Оценка изменения, от неё зависит цвет: `positive` — хорошо, `negative` — плохо, `neutral` — без изменений */
export type StatTone = 'positive' | 'negative' | 'neutral'

/**
 * Пропсы компонента BaseStat
 */
export interface BaseStatProps extends BaseComponentProps<(typeof STAT_VARIANTS)[number], 'root' | 'label' | 'value' | 'change' | 'chart'> {
	/** Подпись показателя: «Выручка», «Заказы» */
	label: string
	/** Значение: число форматируется по языку кита с `valueFormat`, строка выводится как есть */
	value?: number | string
	/** Формат числового значения — параметры `Intl.NumberFormat`: валюта, проценты, `notation: 'compact'` */
	valueFormat?: Intl.NumberFormatOptions
	/**
	 * Изменение за период. С форматом по умолчанию — доля: `0.12` → «+12 %».
	 * Знак задаёт стрелку и цвет, `0` — без изменений
	 */
	change?: number
	/** Формат изменения — параметры `Intl.NumberFormat`. По умолчанию — проценты со знаком, до одной цифры после запятой */
	changeFormat?: Intl.NumberFormatOptions
	/** Текст после изменения: «за неделю», «к августу» */
	changeLabel?: string
	/** Рост — плохо, снижение — хорошо (отток, возвраты, время ответа): цвета изменения меняются местами */
	isInverse?: boolean
	/** Загрузка: вместо значения и изменения — заглушки, на корне `aria-busy` */
	isLoading?: boolean
	/**
	 * Классы частей карточки (`root`, `body`, `label`, `value`, `content`, `change`, `trend`, `delta`, `period`, `icon`, `chart`) —
	 * добавляются к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseStat: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseStat label="Выручка" :value="4820000" :ui="{ root: 'shadow-md', value: 'text-emerald-600' }" />
	 */
	ui?: UiProp<BaseStatPart>
}

/**
 * Слоты компонента BaseStat
 */
export interface BaseStatSlots {
	/** Подпись вместо `label` */
	label?: () => unknown
	/** Значение вместо форматированного `value`; `formatted` — значение в формате языка */
	value?: (props: { formatted: string }) => unknown
	/** Изменение вместо стандартного: форматированное число, направление и оценка */
	change?: (props: { formatted: string; trend: StatTrend; tone: StatTone }) => unknown
	/** Значок или действие в правом верхнем углу */
	icon?: () => unknown
	/** График под значением, обычно BaseSparkline */
	chart?: () => unknown
}

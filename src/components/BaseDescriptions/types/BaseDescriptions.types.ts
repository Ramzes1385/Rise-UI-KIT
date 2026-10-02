import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseDescriptions: default — рамка на фоне страницы, soft — подложка `bg-elevated` без рамки,
 * outline — рамка `border-accented`, ghost — без рамки, фона и отступов (для вставки в карточку).
 */
export const DESCRIPTIONS_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Раскладка поля: horizontal — подпись слева, значение справа (в узкой колонке значение уходит под подпись),
 * vertical — подпись над значением
 */
export const DESCRIPTIONS_LAYOUTS = ['horizontal', 'vertical'] as const

/** Раскладка поля BaseDescriptions */
export type DescriptionsLayout = (typeof DESCRIPTIONS_LAYOUTS)[number]

/** Поле списка «поле — значение» */
export interface DescriptionsItem {
	/** Уникальный ключ поля: по нему — слоты `label-<key>` и `value-<key>` */
	key: string
	/** Подпись поля — `dt` */
	label: string
	/** Значение — `dd`. Пустое (`null`, `undefined`, `''`) показывается текстом `emptyValue` и не копируется */
	value?: string | number | null
	/**
	 * Сколько колонок занимает поле: число (не больше колонок, что сейчас помещаются) или `full` — всю строку,
	 * например для адреса или комментария
	 */
	span?: number | 'full'
	/** Кнопка «Копировать» у этого поля; без значения — как у всего списка (`isCopyable`) */
	isCopyable?: boolean
	/** Текст для буфера обмена, если он отличается от показанного значения (например, номер без пробелов) */
	copyText?: string
}

/** Данные события copy */
export interface DescriptionsCopyEvent {
	/** Поле, значение которого скопировано */
	item: DescriptionsItem
	/** Скопированный текст */
	text: string
}

/**
 * Пропсы компонента BaseDescriptions
 */
export interface BaseDescriptionsProps extends BaseComponentProps<(typeof DESCRIPTIONS_VARIANTS)[number], 'root' | 'header' | 'list'> {
	/** Поля списка в порядке показа */
	items?: DescriptionsItem[]
	/** Заголовок над списком (заменяется слотом title); он же имя списка для скринридера */
	title?: string
	/** Наибольшее число колонок: в узком контейнере их меньше — каждая не уже `minItemWidth` */
	columns?: number
	/** Наименьшая ширина колонки в px: если колонки не помещаются, их число уменьшается вплоть до одной */
	minItemWidth?: number
	/** Раскладка поля: подпись слева от значения или над ним */
	layout?: DescriptionsLayout
	/** Ширина подписи в горизонтальной раскладке — любое значение CSS (`40%`, `12em`) */
	labelWidth?: string
	/** Кнопка «Копировать» у всех полей со значением; у поля можно переопределить `isCopyable` */
	isCopyable?: boolean
	/** Текст пустого значения; по умолчанию — из словаря («—») */
	emptyValue?: string
	/** Текст, когда полей нет (заменяется слотом empty); по умолчанию — из словаря («Нет данных») */
	emptyText?: string
}

/**
 * События компонента BaseDescriptions
 */
export interface BaseDescriptionsEmits {
	/** Значение поля скопировано в буфер обмена кнопкой «Копировать» */
	(event: 'copy', payload: DescriptionsCopyEvent): void
}

/** Данные слотов поля */
export interface DescriptionsItemSlotProps {
	/** Поле */
	item: DescriptionsItem
	/** Номер поля в items, с нуля */
	index: number
}

/**
 * Слоты компонента BaseDescriptions
 */
export interface BaseDescriptionsSlots {
	/** Заголовок вместо title */
	title?: () => unknown
	/** Действия справа от заголовка: кнопки «Изменить», «Ещё» */
	extra?: () => unknown
	/** Подпись любого поля вместо `item.label` */
	label?: (props: DescriptionsItemSlotProps) => unknown
	/** Значение любого поля вместо `item.value`: ссылка, BaseBadge, BaseUser */
	value?: (props: DescriptionsItemSlotProps) => unknown
	/** Подпись одного поля по его `key`: `label-inn` — поле `inn`. Важнее слота label */
	[name: `label-${string}`]: ((props: DescriptionsItemSlotProps) => unknown) | undefined
	/** Значение одного поля по его `key`: `value-status` — поле `status`. Важнее слота value */
	[name: `value-${string}`]: ((props: DescriptionsItemSlotProps) => unknown) | undefined
	/** Содержимое, когда полей нет, вместо emptyText */
	empty?: () => unknown
}

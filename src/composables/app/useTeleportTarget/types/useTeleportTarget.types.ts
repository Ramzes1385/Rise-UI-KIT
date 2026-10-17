/** Цель телепорта: CSS-селектор или элемент */
export type TeleportTarget = string | HTMLElement

/**
 * Атрибуты области ближайших предков якоря для телепортированной панели: режим (`data-theme`), тема бренда
 * (`data-rise-theme`) и пресет движения (`data-rise-motion`)
 */
export interface InheritedThemeAttrs {
	/** Режим светлая / тёмная / системная ближайшего предка с `data-theme` */
	'data-theme'?: string
	/** Тема (`createTheme`, пресет) ближайшего предка с `data-rise-theme` */
	'data-rise-theme'?: string
	/** Пресет движения ближайшего предка с `data-rise-motion`: `none`, `subtle`, `standard`, `expressive` */
	'data-rise-motion'?: string
	/** Направление письма якоря, если оно отличается от направления страницы: панель в `body` не видит `dir` своего блока */
	dir?: 'ltr' | 'rtl'
}

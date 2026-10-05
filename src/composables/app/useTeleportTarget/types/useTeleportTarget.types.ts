/** Цель телепорта: CSS-селектор или элемент */
export type TeleportTarget = string | HTMLElement

/** Атрибуты темы ближайших предков якоря для телепортированной панели: режим (`data-theme`) и тема бренда (`data-rise-theme`) */
export interface InheritedThemeAttrs {
	/** Режим светлая / тёмная / системная ближайшего предка с `data-theme` */
	'data-theme'?: string
	/** Тема (`createTheme`, пресет) ближайшего предка с `data-rise-theme` */
	'data-rise-theme'?: string
}

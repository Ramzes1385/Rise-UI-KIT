/** Числовой проп компонента на проверку: откуда он, что пришло и что взять вместо недопустимого */
export interface NumberPropCheck {
	/** Имя компонента для предупреждения, например `BaseRange` */
	component: string
	/** Имя пропа, например `step` */
	prop: string
	/** Значение, которое передало приложение */
	value: number
	/** Значение вместо недопустимого */
	fallback: number
}

/** Числовой проп без замены: недопустимое значение не применяется */
export type OptionalNumberPropCheck = Omit<NumberPropCheck, 'fallback'>

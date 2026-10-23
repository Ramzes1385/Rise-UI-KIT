import type { EditorField } from './imageMapEditorInternal.types'

/** Пропсы поля панели свойств (внутренний компонент) */
export interface ImageMapEditorFieldProps {
	/** Описание поля */
	field: EditorField
	/** Поле отключено */
	isDisabled: boolean
}

/** События поля панели свойств */
export interface ImageMapEditorFieldEmits {
	/** Новое значение */
	(event: 'update', value: EditorField['value']): void
}

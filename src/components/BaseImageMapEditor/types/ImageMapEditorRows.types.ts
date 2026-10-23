import type { EditorFieldValue, EditorListRow, EditorRowPath } from './imageMapEditorInternal.types'

/** Пропсы списка строк панели свойств: фильтры, стили, части объекта (внутренний компонент) */
export interface ImageMapEditorRowsProps {
	/** Строки списка */
	rows: EditorListRow[]
	/** Подпись кнопки «Добавить» */
	addLabel: string
	/** Пояснение, когда строк нет */
	emptyText: string
	/** Редактор отключён */
	isDisabled: boolean
}

/** События списка строк панели свойств */
export interface ImageMapEditorRowsEmits {
	/** Изменено поле строки: номер строки, ключ поля, значение */
	(event: 'update', index: number, key: string, value: EditorFieldValue): void
	/** Нажата «Добавить» */
	(event: 'add'): void
	/** Удалена строка */
	(event: 'remove', index: number): void
	/** Изменено поле вложенной строки: адрес, ключ, значение */
	(event: 'update-child', at: EditorRowPath, key: string, value: EditorFieldValue): void
	/** Нажата «Добавить» вложенную строку */
	(event: 'add-child', index: number): void
	/** Удалена вложенная строка */
	(event: 'remove-child', index: number, child: number): void
}

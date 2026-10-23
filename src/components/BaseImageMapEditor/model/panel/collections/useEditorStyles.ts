import { computed, watch } from 'vue'
import { createId } from '../../document/editorOps'
import { useFieldErrors } from '../field/useFieldErrors'
import { isStyleKey, styleIssue, styleName, styleRows } from './collectionFields'
import { addStyle, patchStyleBase, removeStyle, renameStyle } from '../../document/collectionOps'
import type { EditorContext, EditorFieldValue as FieldValue } from '../../../types/imageMapEditorInternal.types'

export function useEditorStyles(ctx: EditorContext) {
	const errors = useFieldErrors()
	watch(ctx.doc.getData, errors.clear)

	return {
		styleRows: computed(() => styleRows(ctx.doc.getData(), errors.errors.value)),
		addStyle(): void {
			if (ctx.isDisabled()) return
			ctx.doc.apply(draft => {
				const name = createId('style', Object.keys(draft.styles ?? {}))
				addStyle(draft, name)
			})
		},
		removeStyle(index: number): void {
			const name = styleName(ctx.doc.getData(), index)
			if (ctx.isDisabled() || name === undefined) return
			ctx.doc.apply(draft => removeStyle(draft, name))
		},
		setStyleField(index: number, key: string, value: FieldValue): void {
			const name = styleName(ctx.doc.getData(), index)
			if (ctx.isDisabled() || name === undefined) return
			if (!errors.check(`${index}.${key}`, styleIssue(ctx.doc.getData(), name, { key, value }))) return
			if (key === 'name') ctx.doc.apply(draft => renameStyle(draft, name, String(value ?? '')), `style.name:${index}`)
			else if (isStyleKey(key)) ctx.doc.apply(draft => patchStyleBase(draft, name, { key, value }), `style.${key}:${index}`)
		},
	}
}

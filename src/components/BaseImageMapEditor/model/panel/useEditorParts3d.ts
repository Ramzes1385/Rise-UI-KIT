import { computed, watch } from 'vue'
import { useFieldErrors } from './useFieldErrors'
import { findObject } from '../document/editorOps'
import { addPart, applyPart, partIssue, partRows, removePart } from './parts3d'
import type { EditorContext, EditorFieldValue as FieldValue } from '../../types/imageMapEditorInternal.types'

export function useEditorParts3d(ctx: EditorContext, isEnabled: () => boolean) {
	const errors = useFieldErrors()
	watch(() => ctx.selection.getSelected()?.id, errors.clear)
	watch(ctx.doc.getData, errors.clear)

	function edit(mutate: (object: NonNullable<ReturnType<typeof findObject>>) => void, mergeKey?: string): void {
		const selected = ctx.selection.getSelected()
		if (!selected || ctx.isDisabled()) return
		ctx.doc.apply(draft => {
			const object = findObject(draft, selected.id)
			if (object) mutate(object)
		}, mergeKey)
	}

	return {
		partRows: computed(() => (isEnabled() ? partRows(ctx.selection.getSelected(), errors.errors.value) : [])),
		addPart: () => edit(addPart),
		removePart: (index: number) => edit(object => removePart(object, index)),
		setPartField(index: number, key: string, value: FieldValue): void {
			const selected = ctx.selection.getSelected()
			if (!selected || !errors.check(`${index}.${key}`, partIssue(selected, index, { key, value }))) return
			edit(object => applyPart(object, index, { key, value }), `part.${key}:${selected.id}.${index}`)
		},
	}
}

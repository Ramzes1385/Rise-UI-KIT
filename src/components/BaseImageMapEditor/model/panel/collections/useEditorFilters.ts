import { computed, watch } from 'vue'
import { formatMessage } from '@/locales/state'
import { useFieldErrors } from '../field/useFieldErrors'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { filterIssue, filterRows, optionIssue } from './collectionFields'
import type { EditorContext, EditorRowPath, EditorFieldValue as FieldValue } from '../../../types/imageMapEditorInternal.types'
import { addFilter, addFilterOption, patchFilter, patchFilterOption, removeFilter, removeFilterOption } from '../../document/collectionOps'

export function useEditorFilters(ctx: EditorContext) {
	const errors = useFieldErrors()
	watch(ctx.doc.getData, errors.clear)

	return {
		filterRows: computed(() => filterRows(ctx.doc.getData(), errors.errors.value)),
		addFilter(): void {
			if (ctx.isDisabled()) return
			ctx.doc.apply(draft => {
				addFilter(draft, formatMessage(UI_IMAGE_MAP_EDITOR.NEW_FILTER, { n: (draft.filters?.length ?? 0) + 1 }))
			})
		},
		removeFilter(index: number): void {
			if (ctx.isDisabled()) return
			ctx.doc.apply(draft => removeFilter(draft, index))
		},
		setFilterField(index: number, key: string, value: FieldValue): void {
			if (ctx.isDisabled() || !errors.check(`${index}.${key}`, filterIssue(ctx.doc.getData(), { index, key }, value))) return
			ctx.doc.apply(
				draft => patchFilter(draft, index, { [key]: key === 'type' || key === 'logic' ? value : String(value ?? '') }),
				`filter.${key}:${index}`,
			)
		},
		addFilterOption(index: number): void {
			if (ctx.isDisabled()) return
			ctx.doc.apply(draft => {
				const count = draft.filters?.[index]?.options?.length ?? 0
				addFilterOption(draft, index, formatMessage(UI_IMAGE_MAP_EDITOR.NEW_FILTER_OPTION, { n: count + 1 }))
			})
		},
		removeFilterOption(index: number, child: number): void {
			if (ctx.isDisabled()) return
			ctx.doc.apply(draft => removeFilterOption(draft, index, child))
		},
		setFilterOption(at: EditorRowPath, key: string, value: FieldValue): void {
			const issue = optionIssue(ctx.doc.getData(), { ...at, key }, value)
			if (ctx.isDisabled() || !errors.check(`${at.index}.${at.child}.${key}`, issue)) return
			ctx.doc.apply(
				draft => patchFilterOption(draft, at, { [key]: String(value ?? '') }),
				`filter.option.${key}:${at.index}.${at.child}`,
			)
		},
	}
}

import { computed, ref, watch } from 'vue'
import { objectSections } from './objectFields'
import { formatMessage } from '@/locales/state'
import { applyField, parsePoints } from './applyField'
import { groupFields, layerFields } from './mapFields'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import type { EditorContext, EditorFieldValue as FieldValue } from '../../types/imageMapEditorInternal.types'
import {
	addGroup,
	duplicateObject,
	findObject,
	moveLayer,
	patchGroup,
	patchLayer,
	removeGroup,
	removeLayer,
	removeObject,
} from '../document/editorOps'

function useObjectFields(ctx: EditorContext) {
	const errors = ref<Record<string, string>>({})
	const selectedId = computed(() => ctx.selection.getSelected()?.id)
	watch(selectedId, () => {
		errors.value = {}
	})

	const validators: Record<string, (value: string) => string | undefined> = {
		id: value => {
			if (!value) return UI_IMAGE_MAP_EDITOR.ID_REQUIRED
			return value !== selectedId.value && findObject(ctx.doc.getData(), value) ? UI_IMAGE_MAP_EDITOR.ID_TAKEN : undefined
		},
		elementId: value => (value ? undefined : UI_IMAGE_MAP_EDITOR.ID_REQUIRED),
		'geo.points': value => (parsePoints(value) ? undefined : UI_IMAGE_MAP_EDITOR.POINTS_INVALID),
	}

	function validate(key: string, value: FieldValue): string | undefined {
		return validators[key]?.(String(value ?? '').trim())
	}

	function write(id: string, key: string, value: FieldValue): void {
		ctx.doc.apply(draft => {
			const object = findObject(draft, id)
			if (!object) return
			if (key === 'geo.points' && object.type === 'polygon') object.points = parsePoints(String(value)) ?? object.points
			else applyField(object, key, typeof value === 'string' && key === 'id' ? value.trim() : value)
		}, `${key}:${id}`)
	}

	return {
		sections: computed(() => {
			const selected = ctx.selection.getSelected()
			return selected ? objectSections(selected, ctx.doc.getData(), errors.value) : []
		}),
		setField(key: string, value: FieldValue): void {
			const id = selectedId.value
			if (!id || ctx.isDisabled()) return
			const error = validate(key, value)
			errors.value = { ...errors.value, [key]: error ?? '' }
			if (error) return
			write(id, key, value)
			if (key === 'id') ctx.selection.select(String(value).trim())
		},
	}
}

function useMapFields(ctx: EditorContext) {
	return {
		layerFields: computed(() => {
			const layer = ctx.selection.getLayer()
			return layer ? layerFields(layer) : []
		}),
		groups: computed(() =>
			(ctx.doc.getData().groups ?? []).map(group => ({ id: group.id, title: group.title, fields: groupFields(group) })),
		),
		setLayerField(key: string, value: FieldValue): void {
			const layer = ctx.selection.getLayer()
			const isNumber = key === 'width' || key === 'height'
			if (!layer || ctx.isDisabled() || (isNumber && !(Number(value) > 0))) return
			const patch = { [key]: isNumber ? Number(value) : String(value ?? '') || undefined }
			ctx.doc.apply(draft => patchLayer(draft, layer.id, patch), `layer.${key}:${layer.id}`)
		},
		setGroupField(id: string, key: string, value: FieldValue): void {
			if (ctx.isDisabled() || (key === 'title' && !String(value ?? '').trim())) return
			ctx.doc.apply(draft => patchGroup(draft, id, { [key]: String(value ?? '') }), `group.${key}:${id}`)
		},
		addGroup(): void {
			ctx.doc.apply(draft => {
				addGroup(draft, formatMessage(UI_IMAGE_MAP_EDITOR.NEW_GROUP, { n: (draft.groups?.length ?? 0) + 1 }))
			})
		},
		removeGroup(id: string): void {
			ctx.doc.apply(draft => removeGroup(draft, id))
		},
	}
}

function useLayerActions(ctx: EditorContext, setLayer: (id: string) => void) {
	return {
		removeLayer(id: string): void {
			const layers = ctx.doc.getData().layers
			const next = layers.find(layer => layer.id !== id)
			ctx.doc.apply(draft => removeLayer(draft, id))
			if (next) setLayer(next.id)
			ctx.announcer.announce(UI_IMAGE_MAP_EDITOR.LAYER_DELETED)
		},
		moveLayer(id: string, delta: number): void {
			ctx.doc.apply(draft => moveLayer(draft, id, delta))
		},
	}
}

function useObjectActions(ctx: EditorContext) {
	return {
		deleteSelected(): void {
			const selected = ctx.selection.getSelected()
			if (!selected || ctx.isDisabled()) return
			ctx.doc.apply(draft => removeObject(draft, selected.id))
			ctx.selection.select(null)
			ctx.announcer.announce(formatMessage(UI_IMAGE_MAP_EDITOR.DELETED, { title: selected.title }))
		},
		duplicate(): void {
			const selected = ctx.selection.getSelected()
			if (!selected || ctx.isDisabled()) return
			let copyId: string | undefined
			ctx.doc.apply(draft => {
				copyId = duplicateObject(draft, selected.id)?.id
			})
			if (copyId) ctx.selection.select(copyId)
		},
	}
}

export function useEditorPanel(ctx: EditorContext, setLayer: (id: string) => void) {
	return {
		...useObjectFields(ctx),
		...useMapFields(ctx),
		...useLayerActions(ctx, setLayer),
		...useObjectActions(ctx),
	}
}

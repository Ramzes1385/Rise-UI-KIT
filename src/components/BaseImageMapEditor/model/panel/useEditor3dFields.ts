import { computed, watch } from 'vue'
import { useFieldErrors } from './field/useFieldErrors'
import type { ImageMap3DData } from '@components/BaseImageMap3D/types/imageMap3dData.types'
import type { EditorContext, EditorFieldValue as FieldValue } from '../../types/imageMapEditorInternal.types'
import { applyLayer3d, applyScene3d, layer3dFields, layer3dIssue, scene3dFields, scene3dIssue } from './fields3d'

export function useEditor3dFields(ctx: EditorContext, isEnabled: () => boolean) {
	const layerErrors = useFieldErrors()
	const sceneErrors = useFieldErrors()
	watch(
		() => ctx.selection.getLayer()?.id,
		() => {
			layerErrors.errors.value = {}
		},
	)
	watch(ctx.doc.getData, () => {
		layerErrors.errors.value = {}
		sceneErrors.errors.value = {}
	})

	return {
		layer3dFields: computed(() => {
			const layer = ctx.selection.getLayer()
			return isEnabled() && layer ? layer3dFields(layer, layerErrors.errors.value) : []
		}),
		scene3dFields: computed(() =>
			isEnabled() ? scene3dFields((ctx.doc.getData() as ImageMap3DData).scene3d, sceneErrors.errors.value) : [],
		),
		setLayer3dField(key: string, value: FieldValue): void {
			const layer = ctx.selection.getLayer()
			if (!layer || ctx.isDisabled() || !layerErrors.check(key, layer3dIssue(layer, key, value))) return
			ctx.doc.apply(draft => {
				const target = draft.layers.find(item => item.id === layer.id)
				if (target) applyLayer3d(target, key, value)
			}, `layer3d.${key}:${layer.id}`)
		},
		setScene3dField(key: string, value: FieldValue): void {
			if (ctx.isDisabled() || !sceneErrors.check(key, scene3dIssue(ctx.doc.getData() as ImageMap3DData, key, value))) return
			ctx.doc.apply(draft => applyScene3d(draft as ImageMap3DData, key, value), `scene3d.${key}`)
		},
	}
}

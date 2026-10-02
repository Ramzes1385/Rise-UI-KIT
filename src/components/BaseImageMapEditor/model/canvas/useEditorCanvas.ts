import type { Ref } from 'vue'
import { layerObjects } from '../document/editorOps'
import { computed, useId, watchPostEffect } from 'vue'
import { EDITOR_OBJECT_ATTR } from './useEditorPointer'
import { useSvgMarkup } from '@components/BaseImageMap/model/svg/useImageMapSvg'
import { resolveObject } from '@components/BaseImageMap/model/data/resolveObject'
import { shapeGeometry } from '@components/BaseImageMap/model/data/shapeGeometry'
import { createShape, dragBounds, objectHandles } from '../geometry/editorGeometry'
import type { ImageMapLayer, ImageMapObject, ImageMapPoint } from '@components/BaseImageMap/types/imageMapData.types'
import type { EditorCanvasOptions, EditorContext, EditorPoint, EditorToolApi } from '../../types/imageMapEditorInternal.types'

const POINT_SIZE = 28
const OBJECT_CLASS = 'base-image-map-editor__svg-object'
const SELECTED_CLASS = `${OBJECT_CLASS}--selected`

function percentStyle(point: EditorPoint): Record<string, string> {
	return { left: `${point.x * 100}%`, top: `${point.y * 100}%` }
}

function useDraft(tool: EditorToolApi, options: EditorCanvasOptions, getLayer: () => ImageMapLayer | undefined) {
	return computed(() => {
		const layer = getLayer()
		const drag = tool.drag.value
		const start = drag?.kind === 'draw' ? drag.start : options.getKeyStart()
		const end = drag?.kind === 'draw' ? drag.current : options.getCursor()
		if (!layer || !start || (tool.tool.value !== 'rect' && tool.tool.value !== 'ellipse')) return undefined
		return shapeGeometry(createShape(tool.tool.value, dragBounds(start, end)) as ImageMapObject, layer)
	})
}

function usePolygonPreview(tool: EditorToolApi, options: EditorCanvasOptions, getLayer: () => ImageMapLayer | undefined) {
	return computed(() => {
		const layer = getLayer()
		const points = tool.polygon.points.value
		if (!layer || !points.length) return undefined
		const next = options.getHover() ?? options.getCursor()
		return [...points, [next.x, next.y]].map(([x, y]) => `${(x as number) * layer.width},${(y as number) * layer.height}`).join(' ')
	})
}

function bindElement(element: Element | null, object: { id: string; isSelected: boolean }): void {
	if (!element) return
	element.setAttribute(EDITOR_OBJECT_ATTR, object.id)
	element.classList.add(OBJECT_CLASS)
	element.classList.toggle(SELECTED_CLASS, object.isSelected)
}

function unbindAll(container: HTMLElement): void {
	for (const element of container.querySelectorAll(`[${EDITOR_OBJECT_ATTR}]`)) {
		element.removeAttribute(EDITOR_OBJECT_ATTR)
		element.classList.remove(OBJECT_CLASS, SELECTED_CLASS)
	}
}

function useSvgSelection(ctx: EditorContext, svg: { containerRef: Ref<HTMLElement | null>; prefix: string; markup: Ref<string> }) {
	watchPostEffect(() => {
		const container = svg.containerRef.value
		if (!container || !svg.markup.value) return
		const selectedId = ctx.selection.getSelected()?.id
		unbindAll(container)
		for (const object of layerObjects(ctx.doc.getData(), ctx.selection.getLayer()?.id)) {
			if (object.type !== 'svg') continue
			const element = container.querySelector(`[id="${svg.prefix}${object.elementId}"]`)
			bindElement(element, { id: object.id, isSelected: object.id === selectedId })
		}
	})
}

export function useEditorCanvas(ctx: EditorContext, tool: EditorToolApi, options: EditorCanvasOptions) {
	const prefix = `rise-ime-${useId()}-`
	const getLayer = () => ctx.selection.getLayer()
	const svg = useSvgMarkup(getLayer, prefix)
	useSvgSelection(ctx, { containerRef: options.svgContainerRef, prefix, markup: svg.markup })
	const objects = computed(() => layerObjects(ctx.doc.getData(), getLayer()?.id))
	const selectedId = computed(() => ctx.selection.getSelected()?.id)
	const styleOf = (object: ImageMapObject) => resolveObject(object, ctx.doc.getData(), 'none').style

	return {
		svgPrefix: prefix,
		objects,
		svgMarkup: svg.markup,
		isSvgLoading: svg.isLoading,
		hasSvgError: svg.hasError,
		shapes: computed(() =>
			objects.value.flatMap(object => {
				const layer = getLayer()
				const geometry = layer && shapeGeometry(object, layer)
				return geometry ? [{ id: object.id, geometry, style: styleOf(object), isSelected: object.id === selectedId.value }] : []
			}),
		),
		points: computed(() =>
			objects.value
				.filter((object): object is ImageMapPoint => object.type === 'point')
				.map(point => ({
					id: point.id,
					icon: point.icon ?? ctx.doc.getData().groups?.find(group => group.id === point.group)?.icon,
					style: { ...styleOf(point), ...percentStyle(point), '--im-point-size': `${point.size ?? POINT_SIZE}px` },
					isSelected: point.id === selectedId.value,
				})),
		),
		handles: computed(() => {
			const selected = ctx.selection.getSelected()
			if (!selected || !objects.value.includes(selected)) return []
			return objectHandles(selected).map(handle => ({ index: handle.index, style: percentStyle(handle) }))
		}),
		draft: useDraft(tool, options, getLayer),
		polygonPreview: usePolygonPreview(tool, options, getLayer),
		cursorStyle: computed(() => percentStyle(options.getCursor())),
	}
}

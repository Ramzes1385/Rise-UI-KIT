import { nextTick, ref, watch } from 'vue'
import { objectArea } from '../data/shapeGeometry'
import type { ImageMapArea } from '../../types/imageMapData.types'
import type { ActionContext } from '../../types/imageMapInternal.types'
import { IMAGE_MAP_OBJECT_ATTR } from '../../types/imageMapModel.types'
import type { ResolvedImageMapObject } from '../../types/imageMapModel.types'
import type { BaseImageMapEmits, ImageMapProps } from '../../types/BaseImageMap.types'

function elementArea(stage: HTMLElement | null, id: string): ImageMapArea | undefined {
	const element = stage?.querySelector(`[${IMAGE_MAP_OBJECT_ATTR}="${id}"]`)
	if (!stage || !element) return undefined
	const box = stage.getBoundingClientRect()
	const rect = element.getBoundingClientRect()
	if (!box.width || !box.height) return undefined
	return {
		x: (rect.left - box.left) / box.width,
		y: (rect.top - box.top) / box.height,
		width: rect.width / box.width,
		height: rect.height / box.height,
	}
}

function navigate(item: ResolvedImageMapObject): void {
	if (!item.href) return
	if (item.object.isLinkExternal) window.open(item.href, '_blank', 'noopener,noreferrer')
	else window.location.assign(item.href)
}

function useActiveModel(props: ImageMapProps, emit: BaseImageMapEmits) {
	const localActive = ref<string | null>(props.active)
	watch(
		() => props.active,
		value => {
			localActive.value = value
		},
	)
	return {
		localActive,
		setActive(id: string | null): void {
			if (localActive.value === id) return
			localActive.value = id
			emit('update:active', id)
		},
	}
}

export function useImageMapActions(props: ImageMapProps, emit: BaseImageMapEmits, context: ActionContext) {
	const { localActive, setActive } = useActiveModel(props, emit)

	function setLayer(id: string): void {
		if (context.localLayer.value === id || !props.data.layers.some(layer => layer.id === id)) return
		context.localLayer.value = id
		emit('update:layer', id)
		emit('layer-change', id)
	}

	async function zoomToObject(id: string): Promise<void> {
		const item = context.findObject(id)
		const layer = context.layerOf(id)
		if (!item || !layer) return
		setLayer(layer)
		await nextTick()
		const area = item.object.type === 'svg' ? elementArea(context.stageRef.value, id) : objectArea(item.object)
		if (area) context.zoomToArea(area, item.object.zoom)
	}

	function runAction(item: ResolvedImageMapObject, isNativeLink: boolean): void {
		if (item.action === 'popup') context.openPopup(item.object.id)
		if (item.action === 'layer' && item.object.targetLayer) setLayer(item.object.targetLayer)
		if (item.action === 'link' && !isNativeLink) navigate(item)
	}

	return {
		localActive,
		setActive,
		setLayer,
		zoomToObject,
		activate(id: string, event?: Event): void {
			const item = context.findObject(id)
			if (!item || item.isDisabled) return event?.preventDefault()
			emit('select', item.object)
			setActive(id)
			if (props.hasZoomToActive && item.action !== 'layer') void zoomToObject(id)
			runAction(item, event?.target instanceof Element && event.target.closest('a[href]') instanceof HTMLAnchorElement)
		},
	}
}

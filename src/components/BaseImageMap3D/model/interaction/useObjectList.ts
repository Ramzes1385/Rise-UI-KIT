import type { Ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import type { ImageMap3DProps } from '../../types/BaseImageMap3D.types'
import { UI_ARIA, UI_IMAGE_MAP, UI_IMAGE_MAP_3D } from '@/locales/messages'
import type { ResolvedImageMapObject } from '@components/BaseImageMap/types/internal/imageMapModel.types'
import type { Map3DParts, ObjectListEntry, ObjectListGroup } from '../../types/internal/imageMap3dInternal.types'

function linkAttributes(item: ResolvedImageMapObject): Record<string, string | undefined> {
	if (!item.href || item.isDisabled) return { type: 'button' }
	const isExternal = Boolean(item.object.isLinkExternal)
	return { href: item.href, target: isExternal ? '_blank' : undefined, rel: isExternal ? 'noopener noreferrer' : undefined }
}

function objectEntry(item: ResolvedImageMapObject, activeId: string | null): ObjectListEntry {
	const isLink = Boolean(item.href && !item.isDisabled)
	return {
		item,
		tag: isLink ? 'a' : 'button',
		label: isLink && item.object.isLinkExternal ? `${item.object.title} ${UI_ARIA.OPENS_IN_NEW_TAB}` : item.object.title,
		attributes: {
			...linkAttributes(item),
			'aria-current': item.object.id === activeId ? 'true' : undefined,
			'aria-disabled': item.isDisabled ? 'true' : undefined,
			'aria-haspopup': item.action === 'popup' ? 'dialog' : undefined,
		},
	}
}

function isFocusLost(): boolean {
	return !document.activeElement || document.activeElement === document.body
}

function keepFocus(listRef: Readonly<Ref<HTMLElement | null>>, hostRef: Readonly<Ref<HTMLElement | null>>): void {
	if (!listRef.value?.contains(document.activeElement)) return
	void nextTick(() => {
		if (isFocusLost()) hostRef.value?.focus()
	})
}

function floorGroups(props: ImageMap3DProps, map: Map3DParts): ObjectListGroup[] {
	const currentId = map.data.currentLayer.value?.id
	const active = map.actions.localActive.value
	const shown = map.data.resolved.value.filter(item => map.filters.isShown(item.object))
	const groups = props.data.layers.map(layer => ({
		id: layer.id,
		label: formatMessage(UI_IMAGE_MAP_3D.REGION_LABEL, { label: UI_IMAGE_MAP.DIRECTORY, layer: layer.title }),
		entries: shown.filter(item => map.data.layerOf(item.object.id) === layer.id).map(item => objectEntry(item, active)),
	}))
	return [...groups.filter(group => group.id === currentId), ...groups.filter(group => group.id !== currentId)].filter(
		group => group.entries.length,
	)
}

export function useObjectList(props: ImageMap3DProps, map: Map3DParts, hostRef: Readonly<Ref<HTMLElement | null>>) {
	const listRef = useTemplateRef<HTMLElement>('objectsRef')
	const objectGroups = computed((): ObjectListGroup[] => (props.hasDirectory ? [] : floorGroups(props, map)))
	const isCurrent = (item: ResolvedImageMapObject): boolean => map.data.layerOf(item.object.id) === map.data.currentLayer.value?.id
	watch(objectGroups, () => keepFocus(listRef, hostRef), { flush: 'pre' })
	return {
		objectGroups,
		onObjectClick(item: ResolvedImageMapObject, event: Event): void {
			const layer = map.data.layerOf(item.object.id)
			if (layer && !isCurrent(item) && !item.isDisabled) map.actions.setLayer(layer)
			map.actions.activate(item.object.id, event)
		},
		onObjectFocus: (item: ResolvedImageMapObject): void => map.setHover(isCurrent(item) ? item.object.id : null),
	}
}

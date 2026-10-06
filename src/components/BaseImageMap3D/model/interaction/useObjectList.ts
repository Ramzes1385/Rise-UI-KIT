import type { Ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { UI_IMAGE_MAP, UI_IMAGE_MAP_3D } from '@/locales/messages'
import type { ImageMap3DProps } from '../../types/BaseImageMap3D.types'
import type { Map3DParts, ObjectListEntry } from '../../types/internal/imageMap3dInternal.types'
import type { ResolvedImageMapObject } from '@components/BaseImageMap/types/internal/imageMapModel.types'

function linkAttributes(item: ResolvedImageMapObject): Record<string, string | undefined> {
	if (!item.href || item.isDisabled) return { type: 'button' }
	const isExternal = Boolean(item.object.isLinkExternal)
	return { href: item.href, target: isExternal ? '_blank' : undefined, rel: isExternal ? 'noopener noreferrer' : undefined }
}

function objectEntry(item: ResolvedImageMapObject, activeId: string | null): ObjectListEntry {
	return {
		item,
		tag: item.href && !item.isDisabled ? 'a' : 'button',
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

export function useObjectList(props: ImageMap3DProps, map: Map3DParts, hostRef: Readonly<Ref<HTMLElement | null>>) {
	const listRef = useTemplateRef<HTMLElement>('objectsRef')
	const objectEntries = computed((): ObjectListEntry[] =>
		props.hasDirectory ? [] : (map.data.view.value?.objects ?? []).map(item => objectEntry(item, map.actions.localActive.value)),
	)
	watch(objectEntries, () => keepFocus(listRef, hostRef), { flush: 'pre' })
	return {
		objectEntries,
		objectsLabel: computed(() =>
			formatMessage(UI_IMAGE_MAP_3D.REGION_LABEL, { label: UI_IMAGE_MAP.DIRECTORY, layer: map.data.currentLayer.value?.title ?? '' }),
		),
		onObjectClick: (item: ResolvedImageMapObject, event: Event): void => map.actions.activate(item.object.id, event),
		onObjectFocus: (item: ResolvedImageMapObject): void => map.setHover(item.object.id),
	}
}

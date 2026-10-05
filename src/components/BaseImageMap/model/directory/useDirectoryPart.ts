import { nextTick } from 'vue'
import { useImageMapDeepLink } from './useImageMapDeepLink'
import { useImageMapDirectory } from './useImageMapDirectory'
import type { MapParts } from '../../types/internal/imageMapInternal.types'
import { focusDirectoryStart, keepFocusInDirectory } from './directoryFocus'
import type { BaseImageMapEmits, ImageMapProps } from '../../types/BaseImageMap.types'
import type { ResolvedImageMapObject } from '../../types/internal/imageMapModel.types'
import type { ImageMapFilterToggle } from '../../types/internal/ImageMapDirectory.types'

function useDirectoryHandlers(props: ImageMapProps, emit: BaseImageMapEmits, core: MapParts) {
	const { refs, data, actions, overlay, filters } = core
	return {
		selectFromDirectory(id: string, event: Event): void {
			const row = event.currentTarget
			const hadFocus = document.activeElement === row
			const layer = data.layerOf(id)
			if (layer && !data.findObject(id)?.isDisabled) actions.setLayer(layer)
			actions.activate(id, event)
			if (hadFocus) void nextTick(() => keepFocusInDirectory(refs.rootRef.value, row))
		},
		clearFromDirectory(): void {
			filters.clearFilters()
			void nextTick(() => focusDirectoryStart(refs.rootRef.value, false))
		},
		hoverFromDirectory(id: string | null): void {
			if (overlay.hoverId.value === id) return
			overlay.hoverId.value = id
			emit('hover', data.findObject(id)?.object ?? null)
		},
		toggleFilter: (payload: ImageMapFilterToggle): void => filters.toggleFilter(payload.id, payload.value, payload.isOn),
		activateFromLink(id: string): void {
			const layer = data.layerOf(id)
			if (layer) actions.setLayer(layer)
			actions.setActive(id)
			void nextTick(() => {
				if (data.findObject(id)?.action === 'popup') overlay.openPopup(id)
				if (props.hasZoomToActive) void actions.zoomToObject(id)
			})
		},
	}
}

export function useDirectoryPart(props: ImageMapProps, emit: BaseImageMapEmits, core: MapParts) {
	const { data, actions, overlay, filters } = core
	const handlers = useDirectoryHandlers(props, emit, core)
	const directory = useImageMapDirectory(props, {
		resolved: () => data.resolved.value,
		layerOf: data.layerOf,
		getLayer: () => data.currentLayer.value,
		getActive: () => actions.localActive.value,
		getHover: () => overlay.hoverId.value,
		hoursOf: core.hours.hoursOf,
		filters,
	})
	useImageMapDeepLink(props, {
		findObject: data.findObject,
		isShown: (item: ResolvedImageMapObject) => filters.isShown(item.object),
		getActive: () => actions.localActive.value,
		...handlers,
	})

	return {
		...directory,
		...handlers,
		searchQuery: filters.search,
		setSearch: filters.setSearch,
		setFilter: filters.setFilter,
	}
}

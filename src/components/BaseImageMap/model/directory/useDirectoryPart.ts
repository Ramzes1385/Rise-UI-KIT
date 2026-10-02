import { nextTick } from 'vue'
import { useImageMapDeepLink } from './useImageMapDeepLink'
import { useImageMapDirectory } from './useImageMapDirectory'
import type { MapCore } from '../../types/imageMapInternal.types'
import type { ImageMapFilterToggle } from '../../types/ImageMapDirectory.types'
import type { BaseImageMapEmits, ImageMapProps } from '../../types/BaseImageMap.types'

function useDirectoryHandlers(props: ImageMapProps, emit: BaseImageMapEmits, core: MapCore) {
	const { data, actions, overlay, filters } = core
	return {
		selectFromDirectory(id: string, event: Event): void {
			const layer = data.layerOf(id)
			if (layer && !data.findObject(id)?.isDisabled) actions.setLayer(layer)
			actions.activate(id, event)
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

export function useDirectoryPart(props: ImageMapProps, emit: BaseImageMapEmits, core: MapCore) {
	const { data, actions, overlay, filters } = core
	const handlers = useDirectoryHandlers(props, emit, core)
	const directory = useImageMapDirectory(props, {
		resolved: () => data.resolved.value,
		layerOf: data.layerOf,
		getLayer: () => data.currentLayer.value,
		getActive: () => actions.localActive.value,
		getHover: () => overlay.hoverId.value,
		filters,
	})
	useImageMapDeepLink(props, { findObject: data.findObject, getActive: () => actions.localActive.value, ...handlers })

	return {
		...directory,
		...handlers,
		searchQuery: filters.search,
		setSearch: filters.setSearch,
		setFilter: filters.setFilter,
		clearFilters: filters.clearFilters,
	}
}

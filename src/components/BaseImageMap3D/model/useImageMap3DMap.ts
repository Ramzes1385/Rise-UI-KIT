import { ref } from 'vue'
import type { Map3DOptions } from '../types/internal/imageMap3dInternal.types'
import { useImageMapData } from '@components/BaseImageMap/model/data/useImageMapData'
import type { ImageMapProps } from '@components/BaseImageMap/types/BaseImageMap.types'
import { useImageMapHours } from '@components/BaseImageMap/model/hours/useImageMapHours'
import type { BaseImageMap3DEmits, ImageMap3DProps } from '../types/BaseImageMap3D.types'
import { useImageMapRoutes } from '@components/BaseImageMap/model/routes/useImageMapRoutes'
import { useDirectoryPart } from '@components/BaseImageMap/model/directory/useDirectoryPart'
import type { MapParts } from '@components/BaseImageMap/types/internal/imageMapInternal.types'
import { useImageMapFilters } from '@components/BaseImageMap/model/directory/useImageMapFilters'
import { useImageMapActions } from '@components/BaseImageMap/model/interaction/useImageMapActions'
import { useImageMapOverlay } from '@components/BaseImageMap/model/interaction/useImageMapOverlay'

export function useImageMap3DMap(props: ImageMap3DProps, emit: BaseImageMap3DEmits, options: Map3DOptions) {
	const mapProps = props as unknown as ImageMapProps
	const hasTooltip = () => props.hasTooltip
	const hours = useImageMapHours(mapProps)
	const filters = useImageMapFilters(mapProps, emit, hours.isOpenNow)
	const data = useImageMapData(mapProps, filters.isShown)
	const overlay = useImageMapOverlay({
		rootRef: options.rootRef,
		stageRef: ref(null),
		findObject: data.findObject,
		hasTooltip,
		getSheetBreakpoint: () => props.sheetBreakpoint,
	})
	const actions = useImageMapActions(mapProps, emit, {
		stageRef: ref(null),
		localLayer: data.localLayer,
		findObject: data.findObject,
		layerOf: data.layerOf,
		openPopup: overlay.openPopup,
		zoomTo: item => options.zoomTo(item.object.id),
	})
	const parts: MapParts = { refs: { rootRef: options.rootRef }, hours, filters, data, overlay, actions }

	function setHover(id: string | null): void {
		if (overlay.hoverId.value === id) return
		overlay.hoverId.value = id
		emit('hover', data.findObject(id)?.object ?? null)
	}

	return {
		...parts,
		overlay,
		hasTooltip,
		setHover,
		directory: useDirectoryPart(mapProps, emit, parts),
		routes: useImageMapRoutes(mapProps, emit, parts),
	}
}

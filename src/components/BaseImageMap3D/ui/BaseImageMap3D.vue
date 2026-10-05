<template>
	<div class="base-image-map-3d" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseImageMap v-if="shownView === '2d'" v-bind="mapBindings">
			<template v-if="$slots.tooltip" #tooltip="slotProps"><slot name="tooltip" v-bind="slotProps" /></template>
			<template v-if="$slots.popup" #popup="slotProps"><slot name="popup" v-bind="slotProps" /></template>
			<template v-if="$slots.point" #point="slotProps"><slot name="point" v-bind="slotProps" /></template>
			<template v-if="$slots['directory-item']" #directory-item="slotProps"
				><slot name="directory-item" v-bind="slotProps"
			/></template>
			<template v-if="$slots['directory-empty']" #directory-empty><slot name="directory-empty" /></template>
		</BaseImageMap>
		<div
			v-else
			ref="viewportRef"
			class="base-image-map-3d__viewport"
			:class="classes.viewport"
			:style="viewportStyle"
			tabindex="0"
			role="group"
			:aria-label="mapLabel"
			:aria-roledescription="UI_IMAGE_MAP_3D.ROLE">
			<canvas v-if="hasCanvas" ref="canvasRef" class="base-image-map-3d__canvas" :class="classes.canvas" aria-hidden="true" />
		</div>
		<p class="base-image-map-3d__status" :class="classes.status" role="status">{{ statusText }}</p>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseImageMap3D.style.scss'
import { UI_IMAGE_MAP_3D } from '@/locales/messages'
import { BaseImageMap } from '@components/BaseImageMap'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseImageMap3D } from '../model/useBaseImageMap3D'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseImageMap3DEmits, BaseImageMap3DProps, BaseImageMap3DSlots } from '../types/BaseImageMap3D.types'

const props = withDefaults(
	defineProps<BaseImageMap3DProps>(),
	kitDefaults('BaseImageMap3D', {
		active: null,
		defaultAction: 'popup',
		hasZoomControls: true,
		hasFullscreen: true,
		hasTooltip: true,
		hasZoomToActive: false,
		isPulsing: false,
		sheetBreakpoint: 640,
		hasDirectory: false,
		directoryPosition: 'start',
		directoryView: 'list',
		directoryGroupBy: 'group',
		directoryScope: 'all',
		hasSearch: true,
		hasFilters: true,
		hasLegend: false,
		hasDeepLinking: false,
		deepLinkParam: 'location',
		hasRoutes: false,
		route: null,
		view: '3d',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseImageMap3DEmits>()

defineSlots<BaseImageMap3DSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	shownView,
	hasCanvas,
	mapLabel,
	viewportStyle,
	statusText,
	mapBindings,
	exposed,
} = useBaseImageMap3D(props, emit)

defineExpose(exposed)
</script>

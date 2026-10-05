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
		<template v-else>
			<div v-if="layerOptions.length > 1 || hasZoomControls" class="base-image-map-3d__toolbar" :class="classes.toolbar">
				<BaseSegmented
					v-if="layerOptions.length > 1"
					:custom-class="classes.layers"
					:model-value="activeLayer?.id"
					:options="layerOptions"
					:aria-label="UI_IMAGE_MAP.LAYERS"
					@update:model-value="setLayer(String($event))" />
				<div
					v-if="hasZoomControls"
					class="base-image-map-3d__camera"
					:class="classes.camera"
					role="group"
					:aria-label="UI_IMAGE_MAP_3D.CAMERA">
					<BaseButton
						variant="ghost"
						:aria-label="UI_ARIA.ZOOM_IN"
						:is-disabled="camera.isMaxZoom.value"
						is-focusable-when-disabled
						@click="camera.zoomIn">
						<template #left><BaseIcon name="plus" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						:aria-label="UI_ARIA.ZOOM_OUT"
						:is-disabled="camera.isMinZoom.value"
						is-focusable-when-disabled
						@click="camera.zoomOut">
						<template #left><BaseIcon name="minus" /></template>
					</BaseButton>
					<BaseButton variant="ghost" :aria-label="UI_IMAGE_MAP_3D.ROTATE_LEFT" @click="camera.rotate(-15)">
						<template #left><BaseIcon name="rotate-left" /></template>
					</BaseButton>
					<BaseButton variant="ghost" :aria-label="UI_IMAGE_MAP_3D.ROTATE_RIGHT" @click="camera.rotate(15)">
						<template #left><BaseIcon name="rotate-right" /></template>
					</BaseButton>
					<BaseButton variant="ghost" :aria-label="UI_IMAGE_MAP_3D.RESET_CAMERA" @click="camera.resetCamera()">
						<template #left><BaseIcon name="rotate-ccw" /></template>
					</BaseButton>
				</div>
			</div>
			<div
				ref="viewportRef"
				class="base-image-map-3d__viewport"
				:class="classes.viewport"
				:style="viewportStyle"
				tabindex="0"
				role="group"
				:aria-label="mapLabel"
				:aria-roledescription="UI_IMAGE_MAP_3D.ROLE"
				:aria-describedby="hintId"
				@keydown="onKeydown"
				@wheel.capture="onWheel">
				<canvas v-if="hasCanvas" ref="canvasRef" class="base-image-map-3d__canvas" :class="classes.canvas" aria-hidden="true" />
				<p :id="hintId" class="base-image-map-3d__hint">{{ UI_IMAGE_MAP_3D.KEYBOARD_HINT }}</p>
			</div>
		</template>
		<p class="base-image-map-3d__status" :class="classes.status" role="status">{{ statusText }}</p>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseImageMap3D.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseImageMap } from '@components/BaseImageMap'
import { BaseSegmented } from '@components/BaseSegmented'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseImageMap3D } from '../model/useBaseImageMap3D'
import { UI_ARIA, UI_IMAGE_MAP, UI_IMAGE_MAP_3D } from '@/locales/messages'
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
		camera: 'isometric',
		layerMode: 'stack',
		hasOrbit: true,
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
	layerOptions,
	activeLayer,
	setLayer,
	camera,
	onKeydown,
	onWheel,
	hintId,
	exposed,
} = useBaseImageMap3D(props, emit)

defineExpose(exposed)
</script>

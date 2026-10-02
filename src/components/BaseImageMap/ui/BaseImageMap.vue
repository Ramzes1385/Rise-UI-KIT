<template>
	<section
		ref="rootRef"
		class="base-image-map"
		:class="[variantClass, classes.root, { 'base-image-map--fullscreen': isFullscreen }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="mapLabel">
		<div
			v-if="layerOptions.length > 1 || hasZoomControls || (hasFullscreen && isFullscreenSupported)"
			class="base-image-map__toolbar"
			:class="classes.toolbar">
			<BaseSegmented
				v-if="layerOptions.length > 1"
				class="base-image-map__layers"
				:custom-class="classes.layers"
				:model-value="view?.layer.id"
				:options="layerOptions"
				:aria-label="UI_IMAGE_MAP.LAYERS"
				@update:model-value="setLayer(String($event))" />
			<div
				v-if="hasZoomControls || hasFullscreen"
				class="base-image-map__zoom"
				:class="classes.zoom"
				role="group"
				:aria-label="UI_IMAGE_MAP.ZOOM">
				<template v-if="hasZoomControls">
					<BaseButton variant="ghost" :aria-label="UI_ARIA.ZOOM_IN" :is-disabled="zoom.isMaxZoom.value" @click="zoom.zoomIn">
						<template #left><BaseIcon name="plus" /></template>
					</BaseButton>
					<BaseButton variant="ghost" :aria-label="UI_ARIA.ZOOM_OUT" :is-disabled="zoom.isMinZoom.value" @click="zoom.zoomOut">
						<template #left><BaseIcon name="minus" /></template>
					</BaseButton>
					<BaseButton variant="ghost" :aria-label="UI_ARIA.ZOOM_RESET" @click="zoom.resetZoom()">
						<template #left><BaseIcon name="rotate-ccw" /></template>
					</BaseButton>
				</template>
				<BaseButton
					v-if="hasFullscreen && isFullscreenSupported"
					variant="ghost"
					:aria-label="UI_IMAGE_MAP.FULLSCREEN"
					:aria-pressed="isFullscreen"
					@click="toggleFullscreen">
					<template #left><BaseIcon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" /></template>
				</BaseButton>
			</div>
		</div>

		<div
			ref="viewportRef"
			class="base-image-map__viewport"
			:class="[
				classes.viewport,
				{
					'base-image-map__viewport--zoomed': !zoom.isMinZoom.value,
					'base-image-map__viewport--dragging': gestures.isDragging.value,
				},
			]"
			:style="viewportStyle"
			:tabindex="zoom.isMinZoom.value ? undefined : 0"
			:role="zoom.isMinZoom.value ? undefined : 'group'"
			:aria-label="zoom.isMinZoom.value ? undefined : UI_IMAGE_MAP.VIEWPORT"
			@pointerdown="gestures.handlePointerDown"
			@pointermove="gestures.handlePointerMove"
			@pointerup="gestures.handlePointerUp"
			@pointercancel="gestures.handlePointerUp"
			@keydown="handleViewportKeydown">
			<div
				v-if="view"
				ref="stageRef"
				class="base-image-map__stage"
				:class="[classes.stage, { 'base-image-map__stage--animated': zoom.isAnimated.value }]"
				:style="zoom.stageStyle.value"
				@click="handleStageClick"
				@auxclick="handleStageAuxClick"
				@pointerover="handleStagePointerOver"
				@pointerleave="handleStagePointerLeave"
				@focusin="handleStageFocusIn"
				@focusout="handleStageFocusOut">
				<img
					v-if="view.layer.image && !svgMarkup"
					class="base-image-map__image"
					:src="view.layer.image"
					:alt="view.layer.imageAlt ?? ''"
					draggable="false" />
				<div v-if="svgMarkup" ref="svgContainerRef" class="base-image-map__svg" v-html="svgMarkup" />
				<svg
					v-if="shapes.length"
					class="base-image-map__shapes"
					:viewBox="`0 0 ${view.layer.width} ${view.layer.height}`"
					preserveAspectRatio="none"
					role="presentation">
					<component
						:is="shape.geometry.tag"
						v-for="shape in shapes"
						:key="shape.item.object.id"
						v-bind="{ ...shape.geometry.attributes, ...shape.attributes }"
						class="base-image-map__object"
						:class="[shape.classes, classes.object]"
						:style="shape.item.style"
						vector-effect="non-scaling-stroke" />
				</svg>
				<component
					:is="point.tag"
					v-for="point in points"
					:key="point.item.object.id"
					v-bind="point.attributes"
					class="base-image-map__object base-image-map__point"
					:class="[point.classes, classes.object, classes.point]"
					:style="point.style">
					<span class="base-image-map__marker" aria-hidden="true">
						<slot name="point" :object="point.item.object" :group="point.item.group" :is-active="point.isActive">
							<BaseIcon
								v-if="point.point.icon ?? point.item.group?.icon"
								:name="(point.point.icon ?? point.item.group?.icon) as string" />
						</slot>
					</span>
					<span v-if="point.point.label" class="base-image-map__label" aria-hidden="true">{{ point.point.label }}</span>
				</component>
			</div>
			<div v-if="!view" class="base-image-map__status">{{ UI_IMAGE_MAP.EMPTY }}</div>
			<template v-else>
				<div class="base-image-map__status" role="status">{{ isSvgLoading ? UI_IMAGE_MAP.LOADING : '' }}</div>
				<div class="base-image-map__status base-image-map__status--error" role="alert">
					{{ hasSvgError ? UI_IMAGE_MAP.ERROR : '' }}
				</div>
			</template>
			<div v-if="gestures.isWheelHintVisible.value" class="base-image-map__hint" aria-hidden="true">{{ wheelHint }}</div>
		</div>

		<BaseDropdown
			v-if="tooltipView"
			:key="tooltipView.item.object.id"
			class="base-image-map__anchor"
			:style="tooltipView.style"
			:is-open="true"
			position="top"
			:gap="10"
			:match-width="false"
			:prevent-mousedown="false"
			:padding="0"
			:show-arrow="true"
			panel-class="base-image-map__tooltip-panel"
			@close="overlay.hideTooltip">
			<div class="base-image-map__anchor-trigger" />
			<template #dropdown>
				<div
					:id="overlay.tooltipDomId"
					class="base-image-map__tooltip"
					:class="classes.tooltip"
					role="tooltip"
					@mouseenter="overlay.cancelHide"
					@mouseleave="overlay.scheduleHide">
					<slot name="tooltip" :object="tooltipView.item.object" :group="tooltipView.item.group">
						<ImageMapCard :item="tooltipView.item" />
					</slot>
				</div>
			</template>
		</BaseDropdown>

		<component
			:is="overlay.isSheet.value ? BaseDrawer : BaseModal"
			v-if="overlay.popupItem.value"
			:is-open="true"
			:title="overlay.popupItem.value.object.title"
			:direction="overlay.isSheet.value ? 'bottom' : undefined"
			:custom-class="{ root: classes.popup }"
			@close="overlay.closePopup"
			@update:is-open="overlay.closePopup">
			<slot name="popup" :object="overlay.popupItem.value.object" :group="overlay.popupItem.value.group" :close="overlay.closePopup">
				<ImageMapCard :item="overlay.popupItem.value" is-full />
			</slot>
		</component>
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseImageMap.style.scss'
import ImageMapCard from './ImageMapCard.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseModal } from '@components/BaseModal'
import { BaseButton } from '@components/BaseButton'
import { BaseDrawer } from '@components/BaseDrawer'
import { BaseDropdown } from '@components/BaseDropdown'
import { BaseSegmented } from '@components/BaseSegmented'
import { useBaseImageMap } from '../model/useBaseImageMap'
import { UI_ARIA, UI_IMAGE_MAP } from '@/locales/messages'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseImageMapEmits, BaseImageMapProps, BaseImageMapSlots } from '../types/BaseImageMap.types'

const props = withDefaults(
	defineProps<BaseImageMapProps>(),
	kitDefaults('BaseImageMap', {
		active: null,
		defaultAction: 'popup',
		wheelZoom: 'ctrl',
		maxZoom: 4,
		hasZoomControls: true,
		hasFullscreen: true,
		hasTooltip: true,
		hasZoomToActive: false,
		isPulsing: false,
		sheetBreakpoint: 640,
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseImageMapEmits>()

defineSlots<BaseImageMapSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	viewportRef,
	stageRef,
	svgContainerRef,
	isFullscreen,
	isFullscreenSupported,
	toggleFullscreen,
	points,
	shapes,
	handleStageClick,
	handleStageAuxClick,
	handleStagePointerOver,
	handleStagePointerLeave,
	handleStageFocusIn,
	handleStageFocusOut,
	handleViewportKeydown,
	view,
	layerOptions,
	mapLabel,
	viewportStyle,
	tooltipView,
	wheelHint,
	svgMarkup,
	isSvgLoading,
	hasSvgError,
	zoom,
	gestures,
	overlay,
	setLayer,
	exposed,
} = useBaseImageMap(props, emit)

defineExpose(exposed)
</script>

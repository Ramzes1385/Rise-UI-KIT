<template>
	<div
		ref="rootRef"
		class="base-image-map-3d"
		:class="[
			variantClass,
			classes.root,
			{ 'base-image-map-3d--fullscreen': isFullscreen, 'base-image-map-3d--fullscreen-fallback': isFullscreenFallback },
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseSegmented
			v-if="hasViewSwitch"
			class="base-image-map-3d__views"
			:custom-class="classes.views"
			:model-value="shownView"
			:options="viewOptions"
			:aria-label="UI_IMAGE_MAP_3D.VIEW"
			@update:model-value="setView($event === '2d' ? '2d' : '3d')" />
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
			class="base-image-map-3d__layout"
			:class="{
				'base-image-map-3d__layout--with-directory': hasDirectory,
				'base-image-map-3d__layout--end': directoryPosition === 'end',
			}">
			<div class="base-image-map-3d__main">
				<div
					v-if="layerOptions.length > 1 || hasZoomControls || hasFullscreenButton"
					class="base-image-map-3d__toolbar"
					:class="classes.toolbar">
					<BaseSegmented
						v-if="layerOptions.length > 1"
						:custom-class="classes.layers"
						:model-value="map.data.currentLayer.value?.id"
						:options="layerOptions"
						:aria-label="UI_IMAGE_MAP.LAYERS"
						@update:model-value="map.actions.setLayer(String($event))" />
					<div
						v-if="hasZoomControls || hasFullscreenButton"
						class="base-image-map-3d__camera"
						:class="classes.camera"
						role="group"
						:aria-label="UI_IMAGE_MAP_3D.CAMERA">
						<template v-if="hasZoomControls">
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
							<BaseButton variant="ghost" :aria-label="UI_IMAGE_MAP_3D.ROTATE_LEFT" @click="camera.rotateLeft">
								<template #left><BaseIcon name="rotate-left" /></template>
							</BaseButton>
							<BaseButton variant="ghost" :aria-label="UI_IMAGE_MAP_3D.ROTATE_RIGHT" @click="camera.rotateRight">
								<template #left><BaseIcon name="rotate-right" /></template>
							</BaseButton>
							<BaseButton variant="ghost" :aria-label="UI_IMAGE_MAP_3D.RESET_CAMERA" @click="camera.resetCamera()">
								<template #left><BaseIcon name="rotate-ccw" /></template>
							</BaseButton>
						</template>
						<BaseButton
							v-if="hasFullscreenButton"
							variant="ghost"
							data-map-fullscreen
							:aria-label="UI_IMAGE_MAP.FULLSCREEN"
							:aria-pressed="isFullscreen"
							@click="toggleFullscreen">
							<template #left><BaseIcon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" /></template>
						</BaseButton>
					</div>
				</div>
				<div
					ref="viewportRef"
					class="base-image-map-3d__viewport"
					:class="[classes.viewport, { 'base-image-map-3d__viewport--empty': !map.data.currentLayer.value }]"
					:style="isFullscreen ? undefined : viewportStyle"
					tabindex="0"
					role="group"
					:aria-busy="loadState?.kind === 'loading'"
					:aria-label="mapLabel"
					:aria-roledescription="UI_IMAGE_MAP_3D.ROLE"
					:aria-describedby="cardItem ? `${hintId} ${map.overlay.tooltipDomId}` : hintId"
					@keydown="onKeydown"
					@focusout="onFocusOut"
					@wheel.capture="onWheel"
					@pointerdown="onPointerDown"
					@pointermove="onPointerMove"
					@pointerup="onPointerUp"
					@pointercancel="onPointerUp"
					@pointerleave="onPointerLeave"
					@click="onClick">
					<canvas v-if="hasCanvas" ref="canvasRef" class="base-image-map-3d__canvas" :class="classes.canvas" aria-hidden="true" />
					<div
						v-if="loadState"
						class="base-image-map-3d__state"
						:class="`base-image-map-3d__state--${loadState.kind}`"
						aria-hidden="true">
						<span class="base-image-map-3d__state-text">{{ loadState.text }}</span>
					</div>
					<div v-if="points.length" class="base-image-map-3d__points" aria-hidden="true">
						<span
							v-for="point in points"
							v-show="point.isVisible"
							:key="point.item.object.id"
							v-bind="point.attributes"
							class="base-image-map-3d__point"
							:class="[
								classes.point,
								{
									'base-image-map-3d__point--active': point.isActive,
									'base-image-map-3d__point--hover': point.isHovered,
									'base-image-map-3d__point--disabled': point.item.isDisabled,
									'base-image-map-3d__point--pulsing': point.isPulsing,
								},
							]"
							:style="point.style">
							<span class="base-image-map-3d__marker">
								<slot name="point" :object="point.item.object" :group="point.item.group" :is-active="point.isActive">
									<BaseIcon
										v-if="point.point.icon ?? point.item.group?.icon"
										:name="(point.point.icon ?? point.item.group?.icon) as string" />
								</slot>
							</span>
							<span v-if="point.point.label" class="base-image-map-3d__label">{{ point.point.label }}</span>
						</span>
					</div>
					<div
						v-if="cardItem"
						:id="map.overlay.tooltipDomId"
						ref="cardRef"
						class="base-image-map-3d__card"
						:class="[
							classes.tooltip,
							{ 'base-image-map-3d__card--below': card?.isBelow, 'base-image-map-3d__card--pending': !card },
						]"
						:style="card ? { left: `${card.left}px`, top: `${card.top}px` } : undefined"
						role="tooltip">
						<slot
							name="tooltip"
							:object="cardItem.object"
							:group="cardItem.group"
							:hours="map.hours.hoursOf(cardItem.object.id)">
							<ImageMapCard :item="cardItem" :hours="map.hours.hoursOf(cardItem.object.id)" />
						</slot>
					</div>
					<p :id="hintId" class="base-image-map-3d__hint">{{ UI_IMAGE_MAP_3D.KEYBOARD_HINT }}</p>
					<p class="base-image-map-3d__hint" aria-live="polite">{{ liveText }}</p>
				</div>
				<div v-if="objectGroups.length" ref="objectsRef" @focusout="onFocusOut">
					<ul v-for="group in objectGroups" :key="group.id" class="base-image-map-3d__objects" :aria-label="group.label">
						<li v-for="entry in group.entries" :key="entry.item.object.id">
							<component
								:is="entry.tag"
								v-bind="entry.attributes"
								class="base-image-map-3d__object"
								tabindex="-1"
								@focus="onObjectFocus(entry.item)"
								@click="onObjectClick(entry.item, $event)">
								{{ entry.label }}
							</component>
						</li>
					</ul>
				</div>
				<ImageMapLegend
					v-if="map.directory.legend.value.length"
					:groups="map.directory.legend.value"
					:custom-class="classes.legend" />
				<ImageMapRoutePanel
					v-if="hasRoutes && data.routes"
					:custom-class="classes.route"
					:options="map.routes.routeOptions.value"
					:value="map.routes.route.value"
					:steps="map.routes.routeSteps.value"
					:summary="map.routes.routeSummary.value"
					:is-unreachable="map.routes.isRouteUnreachable.value"
					:has-step-free="map.routes.hasStepFree.value"
					@update:value="map.routes.setRoute"
					@show-layer="map.routes.showRouteLayer" />
			</div>
			<ImageMapDirectory
				v-if="hasDirectory"
				:sections="map.directory.sections.value"
				:controls="map.directory.controls.value"
				:search="map.filters.search.value"
				:has-search="hasSearch"
				:view="directoryView"
				:status-text="map.directory.statusText.value"
				:has-clear="map.directory.hasClear.value"
				:classes="directoryClasses"
				@update:search="map.filters.setSearch"
				@set-filter="map.filters.setFilter"
				@toggle-filter="map.directory.toggleFilter"
				@select="map.directory.selectFromDirectory"
				@hover="map.directory.hoverFromDirectory"
				@clear="map.directory.clearFromDirectory">
				<template v-if="$slots['directory-item']" #item="slotProps">
					<slot name="directory-item" v-bind="slotProps" />
				</template>
				<template v-if="$slots['directory-empty']" #empty>
					<slot name="directory-empty" />
				</template>
			</ImageMapDirectory>
		</div>
		<p
			class="base-image-map-3d__status"
			:class="[classes.status, { 'base-image-map-3d__status--hidden': !isStatusShown }]"
			role="status">
			{{ statusText }}
		</p>
		<component
			:is="map.overlay.isSheet.value ? BaseDrawer : BaseModal"
			v-if="map.overlay.popupItem.value"
			:is-open="true"
			:title="map.overlay.popupItem.value.object.title"
			v-bind="map.overlay.isSheet.value ? { direction: 'bottom' } : {}"
			:custom-class="{ root: classes.popup }"
			@close="map.overlay.closePopup"
			@update:is-open="map.overlay.closePopup">
			<slot
				name="popup"
				:object="map.overlay.popupItem.value.object"
				:group="map.overlay.popupItem.value.group"
				:hours="map.hours.hoursOf(map.overlay.popupItem.value.object.id)"
				:close="map.overlay.closePopup">
				<ImageMapCard
					:item="map.overlay.popupItem.value"
					:hours="map.hours.hoursOf(map.overlay.popupItem.value.object.id)"
					is-full />
			</slot>
		</component>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseImageMap3D.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseModal } from '@components/BaseModal'
import { BaseButton } from '@components/BaseButton'
import { BaseDrawer } from '@components/BaseDrawer'
import { BaseImageMap } from '@components/BaseImageMap'
import { BaseSegmented } from '@components/BaseSegmented'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseImageMap3D } from '../model/useBaseImageMap3D'
import ImageMapCard from '@components/BaseImageMap/ui/ImageMapCard.vue'
import { UI_ARIA, UI_IMAGE_MAP, UI_IMAGE_MAP_3D } from '@/locales/messages'
import ImageMapLegend from '@components/BaseImageMap/ui/ImageMapLegend.vue'
import ImageMapDirectory from '@components/BaseImageMap/ui/ImageMapDirectory.vue'
import ImageMapRoutePanel from '@components/BaseImageMap/ui/ImageMapRoutePanel.vue'
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
		has2dToggle: false,
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
	map,
	shownView,
	setView,
	hasCanvas,
	hasViewSwitch,
	viewOptions,
	mapLabel,
	viewportStyle,
	statusText,
	isStatusShown,
	loadState,
	liveText,
	mapBindings,
	layerOptions,
	directoryClasses,
	camera,
	card,
	cardItem,
	points,
	onKeydown,
	onFocusOut,
	onWheel,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onPointerLeave,
	onClick,
	hintId,
	objectGroups,
	onObjectClick,
	onObjectFocus,
	isFullscreen,
	isFullscreenFallback,
	hasFullscreenButton,
	toggleFullscreen,
	exposed,
} = useBaseImageMap3D(props, emit)

defineExpose(exposed)
</script>

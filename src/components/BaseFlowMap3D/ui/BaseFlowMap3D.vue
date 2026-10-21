<template>
	<section
		ref="rootRef"
		:class="[
			ui('root'),
			variantClass,
			classes.root,
			{
				'base-flow-map-3d--compact': isCompact,
				'base-flow-map-3d--disabled': isDisabled,
				'base-flow-map-3d--scene': shownView === '3d',
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, { height }]"
		:role="shownView === '3d' ? 'region' : undefined"
		:aria-roledescription="shownView === '3d' ? UI_FLOW_MAP_3D.ROLE : undefined"
		:aria-label="shownView === '3d' ? label : undefined"
		:aria-busy="isLoading || undefined"
		:aria-disabled="isDisabled || undefined">
		<div class="base-flow-map-3d__stage">
			<div
				v-if="shownView === '2d' || isFading"
				:class="['base-flow-map-3d__pane', { 'base-flow-map-3d__pane--in': isFading && shownView === '2d' }]">
				<p v-if="statusText" :class="ui('status')" role="status">
					{{ statusText }}
				</p>
				<TwoDMap v-bind="twoDBindings" class="base-flow-map-3d__map">
					<template v-if="$slots['node']" #node="slotProps"><slot name="node" v-bind="slotProps" /></template>
					<template v-if="$slots['edge-label']" #edge-label="slotProps"><slot name="edge-label" v-bind="slotProps" /></template>
					<template v-if="$slots['group-label']" #group-label="slotProps"
						><slot name="group-label" v-bind="slotProps"
					/></template>
					<template v-if="$slots['tooltip']" #tooltip="slotProps"><slot name="tooltip" v-bind="slotProps" /></template>
					<template v-if="$slots['details']" #details="slotProps"><slot name="details" v-bind="slotProps" /></template>
					<template v-if="$slots['toolbar']" #toolbar="slotProps"><slot name="toolbar" v-bind="slotProps" /></template>
					<template v-if="$slots['level']" #level="slotProps"><slot name="level" v-bind="slotProps" /></template>
					<template v-if="$slots['legend']" #legend="slotProps"><slot name="legend" v-bind="slotProps" /></template>
					<template v-if="$slots['scenario-step']" #scenario-step="slotProps"
						><slot name="scenario-step" v-bind="slotProps"
					/></template>
					<template #inspector-end="slotProps">
						<FlowInspector3DSlot v-if="isEditLoaded" v-bind="slotProps" :model-info="modelInfo" :rect-of="rectOf" />
						<slot v-if="$slots['inspector-end']" name="inspector-end" v-bind="slotProps" />
					</template>
					<template v-if="$slots.empty" #empty><slot name="empty" /></template>
				</TwoDMap>
				<BaseButton v-if="isEditIn2D" variant="ghost" class="base-flow-map-3d__back" @click="setMode('view')">
					{{ UI_FLOW_MAP_3D.VIEW_3D }}
				</BaseButton>
			</div>
			<div
				v-if="shownView === '3d' || isFading"
				ref="viewportRef"
				:class="[ui('viewport'), classes.viewport, { 'base-flow-map-3d__viewport--in': isFading && shownView === '3d' }]"
				tabindex="0"
				role="group"
				:aria-label="label"
				:aria-roledescription="UI_FLOW_MAP_3D.ROLE"
				:aria-describedby="hintId"
				@keydown="onKeydown"
				@wheel.capture="camera.wheelZoom"
				@focusout="onFocusOut"
				@pointerdown="onPointerDown"
				@pointermove="onPointerMove"
				@pointerup="onPointerUp"
				@pointercancel="onPointerUp"
				@pointerleave="onPointerLeave"
				@click="onClick"
				@dblclick="onDblClick"
				@contextmenu="onContextMenu">
				<canvas v-if="hasCanvas" ref="canvasRef" :class="[ui('canvas'), classes.canvas]" aria-hidden="true" />
				<div ref="labelsRef" class="base-flow-map-3d__tags" dir="ltr" aria-hidden="true">
					<div
						v-for="tag in tags"
						:key="tag.id"
						:data-label-id="tag.id"
						:data-status="tag.statusId"
						:class="[
							ui('tag'),
							classes.tag,
							{
								'base-flow-map-3d__tag--selected': tag.isSelected,
								'base-flow-map-3d__tag--focused': tag.isFocused,
								'base-flow-map-3d__tag--active': tag.isActive,
								'base-flow-map-3d__tag--hover': tag.isHovered,
								'base-flow-map-3d__tag--dim': tag.isDim,
							},
						]">
						<slot
							name="tag"
							:node="tag.node"
							:kind="tag.kind"
							:status="tag.statusId"
							:is-selected="tag.isSelected"
							:is-focused="tag.isFocused"
							:is-active="tag.isActive"
							:is-hovered="tag.isHovered">
							<span v-if="tag.status" class="base-flow-map-3d__tag-dot" :style="{ backgroundColor: tag.status.color }" />
							<span class="base-flow-map-3d__tag-name">{{ tag.name }}</span>
						</slot>
					</div>
				</div>
				<div v-for="flag in flags" :key="flag.id" :data-label-id="flag.id" class="base-flow-map-3d__flag" aria-hidden="true">
					{{ flag.text }}
				</div>
				<div v-if="status" :class="[ui('status'), `base-flow-map-3d__status--${status.kind}`]" aria-hidden="true">
					<span>{{ status.text }}</span>
				</div>
				<p :id="hintId" :class="ui('hint')">{{ edit.isActive ? editPanels.hint : UI_FLOW_MAP_3D.HINT }}</p>
				<span class="base-flow-map-3d__sr"
					>{{ keyboardHint }}{{ edit.isActive ? `. ${UI_FLOW_MAP_3D.KEYBOARD_HINT_EDIT}` : '' }}</span
				>
				<template v-if="edit.isActive && !status">
					<FlowMap3DToolbar
						v-bind="editPanels.toolbar"
						@click.stop
						@pointerdown.stop
						@rotate="editPanels.on.rotate"
						@swap="editPanels.on.swap"
						@link="edit.toggleLink"
						@remove="editPanels.on.remove" />
					<FlowModelPalette
						v-if="editPanels.isPaletteOpen"
						v-bind="editPanels.palette"
						@click.stop
						@pointerdown.stop
						@update:url="edit.palette.url = $event"
						@pick="editPanels.on.pick"
						@load="editPanels.on.loadUrl"
						@close="edit.palette.close" />
					<p
						v-if="edit.notice"
						:class="['base-flow-map-3d__notice', `base-flow-map-3d__notice--${edit.notice.kind}`]"
						aria-hidden="true">
						{{ edit.notice.text }}
					</p>
				</template>
				<FlowMap3DCompactScope v-if="!status"><LegendPanel @click.stop @pointerdown.stop /></FlowMap3DCompactScope>
				<div v-if="!status" class="base-flow-map-3d__panels" @click.stop @pointerdown.stop>
					<FlowMap3DCompactScope><ScenarioPanel /></FlowMap3DCompactScope>
					<FlowInspector3D
						v-if="edit.isActive"
						v-bind="editPanels.inspector"
						@swap="editPanels.on.swap"
						@rotate="editPanels.on.rotate"
						@undo="edit.actions.undo"
						@redo="edit.actions.redo"
						@rename="editPanels.on.rename"
						@status="editPanels.on.status"
						@tint="editPanels.on.tint"
						@scale="editPanels.on.scale"
						@elevation="editPanels.on.elevation" />
					<DetailsPanel v-else />
				</div>
				<FlowMap3DZoom
					v-if="hasCameraControls"
					v-bind="zoomProps"
					@click.stop
					@pointerdown.stop
					@in="camera.zoomIn"
					@out="camera.zoomOut"
					@fit="camera.fit" />
			</div>
		</div>
		<FlowMap3DDock
			v-bind="dock"
			@view="setView"
			@camera="setCamera"
			@particles="settings.hasParticles.value = !settings.hasParticles.value"
			@layers="settings.setLayered(!settings.isLayered.value)"
			@edit="setMode(dock.isEditing ? 'view' : 'edit')" />
		<div v-if="listGroups.length" class="base-flow-map-3d__list" :aria-label="UI_FLOW_MAP.LIST_TITLE">
			<ul v-for="group in listGroups" :key="group.id" :aria-label="group.label">
				<li v-for="entry in group.entries" :key="entry.id">
					<button type="button" tabindex="-1" @click="chooseNode(entry.id)">{{ entry.label }}</button>
				</li>
			</ul>
		</div>
		<p class="base-flow-map-3d__sr" role="status" aria-live="polite">{{ announcement }}</p>
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseFlowMap3D.style.scss'
import { defineAsyncComponent } from 'vue'
import { BaseButton } from '@components/BaseButton'
import FlowMap3DDock from './parts/FlowMap3DDock.vue'
import FlowMap3DZoom from './parts/FlowMap3DZoom.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseFlowMap3D } from '../model/useBaseFlowMap3D'
import FlowMap3DCompactScope from './FlowMap3DCompactScope.vue'
import { UI_FLOW_MAP, UI_FLOW_MAP_3D } from '@/locales/messages'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { loadEditInspector, loadEditInspectorSlot, loadEditPalette, loadEditToolbar } from './lazy/flowMap3dLazyLoaders'
import type { BaseFlowMap3DEmits, BaseFlowMap3DExpose, BaseFlowMap3DProps, BaseFlowMap3DSlots } from '../types/BaseFlowMap3D.types'

const props = withDefaults(
	defineProps<BaseFlowMap3DProps>(),
	kitDefaults('BaseFlowMap3D', {
		sizeScale: SIZE_SCALE_DEFAULT,
		mode: 'view',
		view: '3d',
		isAutoplay: false,
		isSemanticZoom: true,
		particles: 400,
		compactBreakpoint: 640,
		height: '560px',
		wheelZoom: 'ctrl',
		minZoom: 0.2,
		maxZoom: 3,
		isLoading: false,
		isDisabled: false,
		has2dToggle: true,
		hasLayersToggle: true,
		hasCameraControls: true,
		isLayered: undefined,
	}),
)

const FlowMap3DToolbar = defineAsyncComponent(loadEditToolbar)
const FlowModelPalette = defineAsyncComponent(loadEditPalette)
const FlowInspector3D = defineAsyncComponent(loadEditInspector)
const FlowInspector3DSlot = defineAsyncComponent(loadEditInspectorSlot)

const emit = defineEmits<BaseFlowMap3DEmits>()

defineSlots<BaseFlowMap3DSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	ui,
	label,
	hintId,
	keyboardHint,
	isCompact,
	shownView,
	isEditIn2D,
	status,
	statusText,
	hasCanvas,
	isFading,
	flags,
	tags,
	dock,
	zoomProps,
	camera,
	settings,
	twoDBindings,
	edit,
	editPanels,
	isEditLoaded,
	modelInfo,
	rectOf,
	listGroups,
	announcement,
	TwoDMap,
	ScenarioPanel,
	DetailsPanel,
	LegendPanel,
	controller,
	setView,
	setMode,
	setCamera,
	chooseNode,
	onKeydown,
	onFocusOut,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onPointerLeave,
	onClick,
	onDblClick,
	onContextMenu,
} = useBaseFlowMap3D(props, emit)

defineExpose<BaseFlowMap3DExpose>(controller)
</script>

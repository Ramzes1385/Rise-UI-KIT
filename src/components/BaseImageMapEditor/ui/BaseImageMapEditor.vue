<template>
	<section
		ref="rootRef"
		:class="[
			ui('root'),
			variantClass,
			classes.root,
			{ 'base-image-map-editor--error': Boolean(error), 'base-image-map-editor--disabled': isDisabled },
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="label ?? UI_IMAGE_MAP_EDITOR.LABEL"
		@keydown="keyboard.handleRootKeydown">
		<div :class="[ui('toolbar'), classes.toolbar]">
			<BaseSegmented
				:model-value="tool.tool.value"
				:options="toolOptions"
				:aria-label="UI_IMAGE_MAP_EDITOR.TOOLS"
				:ui="{ track: 'base-image-map-editor__tools' }"
				:is-icon-only="isNarrow"
				:is-disabled="isDisabled || isPreview || !currentLayer"
				@update:model-value="tool.setTool($event as ImageMapEditorTool)" />
			<div :class="ui('group')" role="group" :aria-label="UI_IMAGE_MAP_EDITOR.HISTORY">
				<BaseButton
					variant="ghost"
					:aria-label="UI_IMAGE_MAP_EDITOR.UNDO"
					:is-disabled="isDisabled || !canUndo"
					:is-focusable-when-disabled="!isDisabled"
					@click="commands.undo">
					<template #left><BaseIcon name="rotate-left" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					:aria-label="UI_IMAGE_MAP_EDITOR.REDO"
					:is-disabled="isDisabled || !canRedo"
					:is-focusable-when-disabled="!isDisabled"
					@click="commands.redo">
					<template #left><BaseIcon name="rotate-right" /></template>
				</BaseButton>
			</div>
			<div :class="ui('group')" role="group" :aria-label="UI_IMAGE_MAP_EDITOR.OBJECT_ACTIONS">
				<BaseButton
					variant="ghost"
					:aria-label="UI_IMAGE_MAP_EDITOR.DUPLICATE"
					:is-disabled="isDisabled || !selected || selected.type === 'svg'"
					:is-focusable-when-disabled="!isDisabled"
					@click="commands.duplicate">
					<template #left><BaseIcon name="copy" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					:aria-label="UI_IMAGE_MAP_EDITOR.DELETE"
					:is-disabled="isDisabled || !selected"
					:is-focusable-when-disabled="!isDisabled"
					@click="deletion.deleteSelected">
					<template #left><BaseIcon name="trash" /></template>
				</BaseButton>
			</div>
			<BaseButton v-if="tool.polygon.points.value.length >= 3" variant="soft" @click="tool.polygon.finish">
				{{ UI_IMAGE_MAP_EDITOR.FINISH_POLYGON }}
			</BaseButton>
			<div :class="ui('group')" role="group" :aria-label="UI_IMAGE_MAP_EDITOR.FILES">
				<ImageMapEditorFileButton
					:label="currentLayer ? UI_IMAGE_MAP_EDITOR.REPLACE_IMAGE : UI_IMAGE_MAP_EDITOR.OPEN_IMAGE"
					icon="image"
					:is-narrow="isNarrow"
					:is-disabled="isDisabled"
					@click="files.openBackground('replace')" />
				<ImageMapEditorFileButton
					v-if="currentLayer?.svg || currentLayer?.svgUrl"
					:label="UI_IMAGE_MAP_EDITOR.IMPORT_SVG"
					icon="file-svg"
					:has-wide-icon="false"
					:is-narrow="isNarrow"
					:is-disabled="isDisabled"
					@click="files.importSvgObjects" />
				<ImageMapEditorFileButton
					:label="UI_IMAGE_MAP_EDITOR.IMPORT_JSON"
					icon="upload"
					:is-narrow="isNarrow"
					:is-disabled="isDisabled"
					@click="files.openJson" />
				<ImageMapEditorFileButton
					:label="UI_IMAGE_MAP_EDITOR.EXPORT_JSON"
					icon="download"
					:is-narrow="isNarrow"
					@click="files.exportFile" />
			</div>
			<div :class="ui('group')" role="group" :aria-label="UI_IMAGE_MAP_EDITOR.ZOOM">
				<BaseButton
					variant="ghost"
					:aria-label="UI_ARIA.ZOOM_IN"
					:is-disabled="zoom.isMaxZoom.value || isPreview"
					is-focusable-when-disabled
					@click="zoom.zoomIn">
					<template #left><BaseIcon name="plus" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					:aria-label="UI_ARIA.ZOOM_OUT"
					:is-disabled="zoom.isMinZoom.value || isPreview"
					is-focusable-when-disabled
					@click="zoom.zoomOut">
					<template #left><BaseIcon name="minus" /></template>
				</BaseButton>
			</div>
			<BaseButton
				v-if="hasPreview"
				variant="ghost"
				:aria-pressed="isPreview"
				:is-disabled="!currentLayer"
				@click="isPreview = !isPreview">
				<template #left><BaseIcon name="eye-open-icon" /></template>
				{{ UI_IMAGE_MAP_EDITOR.PREVIEW }}
			</BaseButton>
			<slot name="toolbar" />
		</div>

		<div :class="ui('layout')">
			<div :class="ui('main')">
				<BaseImageMap v-if="isPreview && currentLayer" :data="data" :layer="currentLayer.id" @update:layer="setLayer" />
				<div v-else-if="currentLayer" :class="[ui('viewport'), classes.canvas]" :style="height ? { height } : undefined">
					<div
						ref="stageRef"
						:class="[
							ui('stage'),
							`base-image-map-editor__stage--${tool.tool.value}`,
							{ 'base-image-map-editor__stage--dragging': tool.drag.value },
						]"
						:style="zoom.stageStyle.value"
						tabindex="0"
						role="application"
						:aria-label="UI_IMAGE_MAP_EDITOR.CANVAS"
						:aria-describedby="error ? `${helpId} ${errorId}` : helpId"
						@pointerdown="pointer.handlePointerDown"
						@pointermove="pointer.handlePointerMove"
						@pointerup="pointer.handlePointerUp"
						@pointercancel="pointer.handlePointerCancel"
						@pointerleave="pointer.handlePointerLeave"
						@dblclick="pointer.handleDoubleClick"
						@keydown="keyboard.handleCanvasKeydown"
						@blur="keyboard.hideCursor">
						<img
							v-if="currentLayer.image && !canvas.svgMarkup.value"
							class="base-image-map-editor__image"
							:src="currentLayer.image"
							alt=""
							draggable="false" />
						<div
							v-if="canvas.svgMarkup.value"
							ref="svgContainerRef"
							class="base-image-map-editor__svg"
							aria-hidden="true"
							v-html="canvas.svgMarkup.value" />
						<svg
							class="base-image-map-editor__shapes"
							:viewBox="`0 0 ${currentLayer.width} ${currentLayer.height}`"
							preserveAspectRatio="none"
							aria-hidden="true">
							<component
								:is="shape.geometry.tag"
								v-for="shape in canvas.shapes.value"
								:key="shape.id"
								v-bind="shape.geometry.attributes"
								:data-editor-object="shape.id"
								class="base-image-map-editor__shape"
								:class="{ 'base-image-map-editor__shape--selected': shape.isSelected }"
								:style="shape.style"
								vector-effect="non-scaling-stroke" />
							<component
								:is="canvas.draft.value.tag"
								v-if="canvas.draft.value"
								v-bind="canvas.draft.value.attributes"
								class="base-image-map-editor__draft"
								vector-effect="non-scaling-stroke" />
							<polyline
								v-if="canvas.polygonPreview.value"
								:points="canvas.polygonPreview.value"
								class="base-image-map-editor__draft base-image-map-editor__draft--open"
								vector-effect="non-scaling-stroke" />
						</svg>
						<span
							v-for="point in canvas.points.value"
							:key="point.id"
							:data-editor-object="point.id"
							class="base-image-map-editor__point"
							:class="{ 'base-image-map-editor__point--selected': point.isSelected }"
							:style="point.style"
							aria-hidden="true">
							<BaseIcon v-if="point.icon" :name="point.icon" />
						</span>
						<span
							v-for="handle in canvas.handles.value"
							:key="handle.index"
							:data-editor-handle="handle.index"
							class="base-image-map-editor__handle"
							:style="handle.style"
							aria-hidden="true" />
						<span
							v-if="keyboard.isCursorVisible.value && tool.tool.value !== 'select'"
							class="base-image-map-editor__cursor"
							:style="canvas.cursorStyle.value"
							aria-hidden="true" />
					</div>
					<div v-if="canvas.isSvgLoading.value" class="base-image-map-editor__svg-state">{{ UI_IMAGE_MAP.LOADING }}</div>
					<div
						v-if="canvas.hasSvgError.value"
						class="base-image-map-editor__svg-state base-image-map-editor__svg-state--error"
						role="alert">
						{{ UI_IMAGE_MAP.ERROR }}
					</div>
				</div>
				<div v-else :class="ui('empty')">
					<BaseText tag="p">{{ UI_IMAGE_MAP_EDITOR.EMPTY }}</BaseText>
					<BaseButton :is-disabled="isDisabled" @click="files.openBackground('add')">
						<template #left><BaseIcon name="image" /></template>
						{{ UI_IMAGE_MAP_EDITOR.OPEN_IMAGE }}
					</BaseButton>
				</div>
				<BaseText v-if="currentLayer && !isPreview" :id="helpId" tag="p" :class="ui('help')">{{ help }}</BaseText>
				<p v-if="importError" :class="[ui('error'), classes.error]" role="alert">{{ importError }}</p>
				<p v-if="error" :id="errorId" :class="[ui('error'), classes.error]">{{ error }}</p>
				<div class="base-image-map-editor__status" role="status">{{ status }}</div>
			</div>

			<ImageMapEditorPanel
				:data="data"
				:current-layer="currentLayer"
				:selected="selected"
				:objects="canvas.objects.value"
				:panel="panel"
				:sections="sections"
				:is-disabled="isDisabled"
				:panel-class="classes.panel"
				:ui="ui"
				@select="select"
				@set-layer="setLayer"
				@add-layer="files.openBackground('add')" />
		</div>

		<input
			ref="backgroundInputRef"
			class="base-image-map-editor__file"
			type="file"
			accept="image/*,.svg"
			tabindex="-1"
			aria-hidden="true"
			@change="files.handleBackgroundFile" />
		<input
			ref="jsonInputRef"
			class="base-image-map-editor__file"
			type="file"
			accept=".json,application/json"
			tabindex="-1"
			aria-hidden="true"
			@change="files.handleJsonFile" />
		<BaseConfirm
			:is-open="deletion.isOpen.value"
			:title="deletion.request.value?.title ?? ''"
			:description="deletion.request.value?.description"
			:confirm-label="UI_IMAGE_MAP_EDITOR.CONFIRM_DELETE"
			is-danger
			:size-scale="sizeScale"
			@close="deletion.close" />
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseImageMapEditor.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import { BaseConfirm } from '@components/BaseConfirm'
import { BaseImageMap } from '@components/BaseImageMap'
import { BaseSegmented } from '@components/BaseSegmented'
import ImageMapEditorPanel from './ImageMapEditorPanel.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import ImageMapEditorFileButton from './ImageMapEditorFileButton.vue'
import { useBaseImageMapEditor } from '../model/useBaseImageMapEditor'
import { UI_ARIA, UI_IMAGE_MAP, UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type {
	BaseImageMapEditorEmits,
	BaseImageMapEditorProps,
	BaseImageMapEditorSlots,
	ImageMapEditorTool,
} from '../types/BaseImageMapEditor.types'

const props = withDefaults(
	defineProps<BaseImageMapEditorProps>(),
	kitDefaults('BaseImageMapEditor', {
		selected: null,
		tool: 'select',
		isDisabled: false,
		historyLimit: 100,
		nudgeStep: 0.005,
		hasPreview: true,
		fileName: 'image-map.json',
		has3dFields: false,
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseImageMapEditorEmits>()

defineSlots<BaseImageMapEditorSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	isNarrow,
	sections,
	stageRef,
	svgContainerRef,
	backgroundInputRef,
	jsonInputRef,
	data,
	canUndo,
	canRedo,
	currentLayer,
	selected,
	select,
	setLayer,
	tool,
	zoom,
	status,
	importError,
	isPreview,
	helpId,
	errorId,
	toolOptions,
	help,
	pointer,
	panel,
	commands,
	keyboard,
	canvas,
	files,
	deletion,
	exposed,
} = useBaseImageMapEditor(props, emit)

defineExpose(exposed)
</script>

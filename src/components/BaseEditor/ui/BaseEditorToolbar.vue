<template>
	<div
		v-if="hasToolbar && !isReadonly"
		ref="toolbarRef"
		:class="[ui('toolbar'), classes.toolbar]"
		role="toolbar"
		:aria-label="UI_EDITOR.TOOLBAR_LABEL"
		@mousedown="handleMouseDown"
		@focusin="handleFocusIn"
		@keydown="handleKeyDown">
		<slot name="toolbar">
			<div v-if="hasHistoryButtons" :class="[ui('group'), classes.group]">
				<BaseTooltip v-for="btn in historyButtons" :key="btn.action" :text="btn.tip" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						:class="[ui('btn'), classes.btn]"
						:size-scale="sizeScale"
						is-focusable-when-disabled
						:is-disabled="!btn.isEnabled"
						:aria-label="btn.label"
						:aria-keyshortcuts="btn.shortcut"
						@click="btn.action === 'undo' ? emit('undo') : emit('redo')">
						<BaseIcon :name="btn.icon" :size-scale="iconScale" />
					</BaseButton>
				</BaseTooltip>
			</div>

			<div v-for="group in buttonGroups" :key="group.key" :class="[ui('group'), classes.group]">
				<BaseTooltip v-for="btn in group.items" :key="btn.icon" :text="btn.label" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						:class="[ui('btn'), { 'base-editor__btn--active': activeStates[btn.activeKey] }, classes.btn]"
						:size-scale="sizeScale"
						:aria-label="btn.label"
						:aria-pressed="activeStates[btn.activeKey] ? 'true' : 'false'"
						@click="btn.type === 'format' ? emit('applyFormat', btn.action) : emit('applyBlock', btn.action)">
						<BaseIcon :name="btn.icon" :size-scale="iconScale" />
					</BaseButton>
				</BaseTooltip>
			</div>

			<div :class="[ui('group'), classes.group]">
				<BaseTooltip :text="UI_EDITOR.TEXT_COLOR" position="top" :size-scale="sizeScale">
					<BaseColorPicker
						v-model="textColorModel"
						:aria-label="UI_EDITOR.TEXT_COLOR"
						:custom-class="colorPickerClasses"
						:size-scale="sizeScale"
						trigger-variant="icon"
						:has-indicator="isTextColorActive"
						is-resettable
						:reset-label="UI_EDITOR.TEXT_COLOR_RESET"
						@mousedown.prevent="emit('saveSelection')"
						@change="(color: string) => emit('handleTextColor', color)"
						@reset="emit('resetTextColor')">
						<template #trigger>
							<BaseIcon name="color-picker" :size-scale="iconScale" />
						</template>
					</BaseColorPicker>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR.BG_COLOR" position="top" :size-scale="sizeScale">
					<BaseColorPicker
						v-model="backgroundColorModel"
						:aria-label="UI_EDITOR.BG_COLOR"
						:custom-class="colorPickerClasses"
						:size-scale="sizeScale"
						trigger-variant="icon"
						:has-indicator="isBackgroundColorActive"
						is-resettable
						:reset-label="UI_EDITOR.BG_COLOR_RESET"
						@mousedown.prevent="emit('saveSelection')"
						@change="(color: string) => emit('handleBackgroundColor', color)"
						@reset="emit('resetBackgroundColor')">
						<template #trigger>
							<BaseIcon name="highlight" :size-scale="iconScale" />
						</template>
					</BaseColorPicker>
				</BaseTooltip>
			</div>

			<div :class="[ui('group'), classes.group]">
				<div class="base-editor__heading-select" :class="classes.headingSelect">
					<BaseSelect
						v-model="headingValue"
						:options="headingOptions"
						variant="ghost"
						:placeholder="UI_EDITOR.FORMAT"
						:size-scale="controlScale"
						@change="(val: string | number | (string | number)[]) => emit('handleHeadingChange', val as string | number)" />
				</div>
			</div>

			<div :class="[ui('group'), classes.group]">
				<BaseTooltip :text="UI_EDITOR.LINK" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						:class="[ui('btn'), classes.btn]"
						:size-scale="sizeScale"
						:aria-label="UI_EDITOR.LINK"
						@click="emit('insertLink')">
						<BaseIcon name="link" :size-scale="iconScale" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR.IMAGE" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						:class="[ui('btn'), classes.btn]"
						:size-scale="sizeScale"
						:aria-label="UI_EDITOR.IMAGE"
						@click="imageInputRef?.click()">
						<BaseIcon name="image" :size-scale="iconScale" />
					</BaseButton>
				</BaseTooltip>
				<input
					ref="imageInputRef"
					type="file"
					accept="image/*"
					:multiple="isMultipleUpload"
					tabindex="-1"
					aria-hidden="true"
					class="base-editor__file-input"
					:class="classes.fileInput"
					@change="(e: Event) => emit('handleImageUpload', e)" />
				<BaseTooltip :text="UI_EDITOR.VIDEO" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						:class="[ui('btn'), classes.btn]"
						:size-scale="sizeScale"
						:aria-label="UI_EDITOR.VIDEO"
						@click="videoInputRef?.click()">
						<BaseIcon name="video" :size-scale="iconScale" />
					</BaseButton>
				</BaseTooltip>
				<input
					ref="videoInputRef"
					type="file"
					accept="video/*"
					:multiple="isMultipleUpload"
					tabindex="-1"
					aria-hidden="true"
					class="base-editor__file-input"
					:class="classes.fileInput"
					@change="(e: Event) => emit('handleVideoUpload', e)" />
				<BaseTooltip :text="UI_EDITOR.MEDIA_SETTINGS" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						:class="[ui('btn'), classes.btn]"
						:size-scale="sizeScale"
						is-focusable-when-disabled
						:is-disabled="!isMediaSelected"
						:aria-label="UI_EDITOR.MEDIA_SETTINGS"
						@click="emit('openMediaMenu')">
						<BaseIcon name="settings" :size-scale="iconScale" />
					</BaseButton>
				</BaseTooltip>
			</div>

			<div :class="[ui('group'), classes.group]">
				<BaseTooltip :text="UI_EDITOR.CLEAR_FORMAT" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						:class="[ui('btn'), classes.btn]"
						:size-scale="sizeScale"
						:aria-label="UI_EDITOR.CLEAR_FORMAT"
						@click="emit('clearAllFormatting')">
						<BaseIcon name="format-clear" :size-scale="iconScale" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR.DIVIDER" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						:class="[ui('btn'), classes.btn]"
						:size-scale="sizeScale"
						:aria-label="UI_EDITOR.DIVIDER"
						@click="emit('insertSeparator')">
						<BaseIcon name="separator" :size-scale="iconScale" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="isCodeMode ? UI_EDITOR.VISUAL_MODE : UI_EDITOR.CODE_MODE" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						:class="[ui('btn'), { 'base-editor__btn--active': isCodeMode }, classes.btn]"
						:size-scale="sizeScale"
						:aria-label="UI_EDITOR.CODE_MODE"
						:aria-pressed="isCodeMode ? 'true' : 'false'"
						@click="emit('toggleCodeMode')">
						<BaseIcon name="code" :size-scale="iconScale" />
					</BaseButton>
				</BaseTooltip>
			</div>
		</slot>
	</div>
</template>

<script setup lang="ts">
import { UI_EDITOR } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseTooltip } from '@components/BaseTooltip'
import { BaseColorPicker } from '@components/BaseColorPicker'
import { useBaseEditorToolbar } from '../model/useBaseEditorToolbar'
import type { BaseEditorToolbarEmits, BaseEditorToolbarProps, BaseEditorToolbarSlots } from '../types/BaseEditorToolbar.types'

const props = defineProps<BaseEditorToolbarProps>()

const emit = defineEmits<BaseEditorToolbarEmits>()

defineSlots<BaseEditorToolbarSlots>()

const {
	ui,
	toolbarRef,
	handleFocusIn,
	handleKeyDown,
	handleMouseDown,
	headingValue,
	textColorModel,
	backgroundColorModel,
	imageInputRef,
	videoInputRef,
	iconScale,
	controlScale,
	colorPickerClasses,
	buttonGroups,
	historyButtons,
} = useBaseEditorToolbar(props)
</script>

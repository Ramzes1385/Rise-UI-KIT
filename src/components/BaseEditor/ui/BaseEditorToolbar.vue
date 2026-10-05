<template>
	<div
		v-if="hasToolbar && !isReadonly"
		:class="[ui('toolbar'), classes.toolbar]"
		role="toolbar"
		:aria-label="UI_EDITOR.TOOLBAR_LABEL"
		@mousedown.prevent>
		<slot name="toolbar">
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
						class="base-editor__color-picker"
						:class="{ 'base-editor__color-picker--active': isTextColorActive }"
						:style="isTextColorActive ? { '--editor-swatch-color': textColorModel } : undefined"
						:aria-label="UI_EDITOR.TEXT_COLOR"
						:custom-class="colorPickerClasses"
						:size-scale="sizeScale"
						has-transparent-swatch
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
						class="base-editor__color-picker"
						:class="{ 'base-editor__color-picker--active': isBackgroundColorActive }"
						:style="isBackgroundColorActive ? { '--editor-swatch-color': backgroundColorModel } : undefined"
						:aria-label="UI_EDITOR.BG_COLOR"
						:custom-class="colorPickerClasses"
						:size-scale="sizeScale"
						has-transparent-swatch
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
					<label :class="[ui('btn'), 'base-editor__btn--file', classes.btn]" @mousedown.stop>
						<BaseIcon name="image" :size-scale="iconScale" />
						<input
							type="file"
							accept="image/*"
							class="base-editor__file-input"
							:class="classes.fileInput"
							:aria-label="UI_EDITOR.IMAGE"
							@change="(e: Event) => emit('handleImageUpload', e)" />
					</label>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR.VIDEO" position="top" :size-scale="sizeScale">
					<label :class="[ui('btn'), 'base-editor__btn--file', classes.btn]" @mousedown.stop>
						<BaseIcon name="video" :size-scale="iconScale" />
						<input
							type="file"
							accept="video/*"
							class="base-editor__file-input"
							:class="classes.fileInput"
							:aria-label="UI_EDITOR.VIDEO"
							@change="(e: Event) => emit('handleVideoUpload', e)" />
					</label>
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

const { ui, headingValue, textColorModel, backgroundColorModel, iconScale, controlScale, colorPickerClasses, buttonGroups } =
	useBaseEditorToolbar(props)
</script>

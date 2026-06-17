<template>
	<div v-if="hasToolbar && !isReadonly" class="base-editor__toolbar" :class="classes.toolbar" @mousedown.prevent>
		<slot name="toolbar">
			<span v-for="group in buttonGroups" :key="group.key" class="base-editor__group" :class="classes.group">
				<BaseTooltip v-for="btn in group.items" :key="btn.icon" :text="btn.label" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates[btn.activeKey] }, classes.btn]"
						:size-scale="sizeScale"
						@click="btn.type === 'format' ? emit('applyFormat', btn.action) : emit('applyBlock', btn.action)">
						<BaseIcon :name="btn.icon" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
			</span>

			<span class="base-editor__group" :class="classes.group">
				<BaseTooltip :text="UI_EDITOR_TEXT_COLOR" position="top" :size-scale="sizeScale">
					<BaseColorPicker
						v-model="textColorModel"
						class="base-editor__color-picker"
						:class="{ 'base-editor__color-picker--active': isTextColorActive }"
						:style="isTextColorActive ? { '--editor-swatch-color': textColorModel } : undefined"
						:custom-class="{ swatch: classes.colorPicker }"
						:size-scale="sizeScale"
						has-transparent-swatch
						is-resettable
						:reset-label="UI_EDITOR_TEXT_COLOR_RESET"
						@mousedown.prevent="emit('saveSelection')"
						@change="(color: string) => emit('handleTextColor', color)"
						@reset="emit('resetTextColor')">
						<template #trigger>
							<BaseIcon name="color-picker" :size-scale="calcIconScale('md', sizeScale)" />
						</template>
					</BaseColorPicker>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_BG_COLOR" position="top" :size-scale="sizeScale">
					<BaseColorPicker
						v-model="backgroundColorModel"
						class="base-editor__color-picker"
						:class="{ 'base-editor__color-picker--active': isBackgroundColorActive }"
						:style="isBackgroundColorActive ? { '--editor-swatch-color': backgroundColorModel } : undefined"
						:custom-class="{ swatch: classes.colorPicker }"
						:size-scale="sizeScale"
						has-transparent-swatch
						is-resettable
						:reset-label="UI_EDITOR_BG_COLOR_RESET"
						@mousedown.prevent="emit('saveSelection')"
						@change="(color: string) => emit('handleBackgroundColor', color)"
						@reset="emit('resetBackgroundColor')">
						<template #trigger>
							<BaseIcon name="highlight" :size-scale="calcIconScale('md', sizeScale)" />
						</template>
					</BaseColorPicker>
				</BaseTooltip>
			</span>

			<span class="base-editor__group" :class="classes.group">
				<div class="base-editor__heading-select" :class="classes.headingSelect">
					<BaseSelect
						v-model="headingValue"
						:options="headingOptions"
						variant="ghost"
						:placeholder="UI_EDITOR_FORMAT"
						:size-scale="sizeScale"
						@change="(val: string | number | (string | number)[]) => emit('handleHeadingChange', val as string | number)" />
				</div>
			</span>

			<span class="base-editor__group" :class="classes.group">
				<BaseTooltip :text="UI_EDITOR_LINK" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[classes.btn]"
						:size-scale="sizeScale"
						@click="emit('insertLink')">
						<BaseIcon name="link" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_IMAGE" position="top" :size-scale="sizeScale">
					<label class="base-editor__btn base-editor__btn--color" :class="classes.btn" @mousedown.stop>
						<BaseIcon name="image" :size-scale="calcIconScale('md', sizeScale)" />
						<input
							type="file"
							accept="image/*"
							class="base-editor__file-input"
							:class="classes.fileInput"
							@change="(e: Event) => emit('handleImageUpload', e)" />
					</label>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_VIDEO" position="top" :size-scale="sizeScale">
					<label class="base-editor__btn base-editor__btn--color" :class="classes.btn" @mousedown.stop>
						<BaseIcon name="video" :size-scale="calcIconScale('md', sizeScale)" />
						<input
							type="file"
							accept="video/*"
							class="base-editor__file-input"
							:class="classes.fileInput"
							@change="(e: Event) => emit('handleVideoUpload', e)" />
					</label>
				</BaseTooltip>
			</span>

			<span class="base-editor__group" :class="classes.group">
				<BaseTooltip :text="UI_EDITOR_CLEAR_FORMAT" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[classes.btn]"
						:size-scale="sizeScale"
						@click="emit('clearAllFormatting')">
						<BaseIcon name="format-clear" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_DIVIDER" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[classes.btn]"
						:size-scale="sizeScale"
						@click="emit('insertSeparator')">
						<BaseIcon name="separator" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="isCodeMode ? UI_EDITOR_VISUAL_MODE : UI_EDITOR_CODE_MODE" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': isCodeMode }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('toggleCodeMode')">
						<BaseIcon name="code" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
			</span>
		</slot>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseColorPicker } from '@components/BaseColorPicker'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseSelect } from '@components/BaseSelect'
import { BaseTooltip } from '@components/BaseTooltip'
import {
	UI_EDITOR_ALIGN_CENTER,
	UI_EDITOR_ALIGN_JUSTIFY,
	UI_EDITOR_ALIGN_LEFT,
	UI_EDITOR_ALIGN_RIGHT,
	UI_EDITOR_BG_COLOR,
	UI_EDITOR_BG_COLOR_RESET,
	UI_EDITOR_CODE_BLOCK,
	UI_EDITOR_BOLD,
	UI_EDITOR_CLEAR_FORMAT,
	UI_EDITOR_CODE_MODE,
	UI_EDITOR_DIVIDER,
	UI_EDITOR_FORMAT,
	UI_EDITOR_IMAGE,
	UI_EDITOR_ITALIC,
	UI_EDITOR_LINK,
	UI_EDITOR_LIST_BULLET,
	UI_EDITOR_LIST_NUMBERED,
	UI_EDITOR_QUOTE,
	UI_EDITOR_STRIKETHROUGH,
	UI_EDITOR_TEXT_COLOR,
	UI_EDITOR_TEXT_COLOR_RESET,
	UI_EDITOR_UNDERLINE,
	UI_EDITOR_VIDEO,
	UI_EDITOR_VISUAL_MODE,
} from '@constants'
import type { BaseEditorToolbarEmits, BaseEditorToolbarProps, BaseEditorToolbarSlots, EditorActiveStates } from '../model/BaseEditorToolbar.types'

const props = defineProps<BaseEditorToolbarProps>()

const emit = defineEmits<BaseEditorToolbarEmits>()

const headingValue = ref<string | number>('p')
const textColorModel = ref(props.textColor)
const backgroundColorModel = ref(props.backgroundColor)

interface ToolbarButton {
	icon: string
	label: string
	activeKey: keyof EditorActiveStates
	action: string
	type: 'format' | 'block'
}

const buttonGroups = computed(() => [
	{
		key: 'format',
		items: [
			{ icon: 'bold', label: UI_EDITOR_BOLD, activeKey: 'isBold', action: 'bold', type: 'format' },
			{ icon: 'italic', label: UI_EDITOR_ITALIC, activeKey: 'isItalic', action: 'italic', type: 'format' },
			{ icon: 'underline', label: UI_EDITOR_UNDERLINE, activeKey: 'isUnderline', action: 'underline', type: 'format' },
			{ icon: 'strike', label: UI_EDITOR_STRIKETHROUGH, activeKey: 'isStrike', action: 'strikeThrough', type: 'format' },
		] as ToolbarButton[],
	},
	{
		key: 'align',
		items: [
			{ icon: 'align-left', label: UI_EDITOR_ALIGN_LEFT, activeKey: 'isJustifyLeft', action: 'justifyLeft', type: 'format' },
			{ icon: 'align-center', label: UI_EDITOR_ALIGN_CENTER, activeKey: 'isJustifyCenter', action: 'justifyCenter', type: 'format' },
			{ icon: 'align-right', label: UI_EDITOR_ALIGN_RIGHT, activeKey: 'isJustifyRight', action: 'justifyRight', type: 'format' },
			{ icon: 'align-justify', label: UI_EDITOR_ALIGN_JUSTIFY, activeKey: 'isJustifyFull', action: 'justifyFull', type: 'format' },
		] as ToolbarButton[],
	},
	{
		key: 'list',
		items: [
			{ icon: 'list-bullet', label: UI_EDITOR_LIST_BULLET, activeKey: 'isUnorderedList', action: 'insertUnorderedList', type: 'format' },
			{ icon: 'list-number', label: UI_EDITOR_LIST_NUMBERED, activeKey: 'isOrderedList', action: 'insertOrderedList', type: 'format' },
		] as ToolbarButton[],
	},
	{
		key: 'block',
		items: [
			{ icon: 'quote', label: UI_EDITOR_QUOTE, activeKey: 'isBlockquote', action: 'blockquote', type: 'block' },
			{ icon: 'code', label: UI_EDITOR_CODE_BLOCK, activeKey: 'isPre', action: 'pre', type: 'block' },
		] as ToolbarButton[],
	},
])

defineSlots<BaseEditorToolbarSlots>()
</script>

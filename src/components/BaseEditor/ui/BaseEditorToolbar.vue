<template>
	<div v-if="hasToolbar && !isReadonly" class="base-editor__toolbar" :class="classes.toolbar" @mousedown.prevent>
		<slot name="toolbar">
			<span class="base-editor__group" :class="classes.group">
				<BaseTooltip :text="UI_EDITOR_BOLD" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isBold }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'bold')">
						<BaseIcon name="bold" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_ITALIC" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isItalic }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'italic')">
						<BaseIcon name="italic" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_UNDERLINE" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isUnderline }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'underline')">
						<BaseIcon name="underline" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_STRIKETHROUGH" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isStrike }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'strikeThrough')">
						<BaseIcon name="strike" :size-scale="calcIconScale('md', sizeScale)" />
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
				<BaseTooltip :text="UI_EDITOR_ALIGN_LEFT" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isJustifyLeft }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'justifyLeft')">
						<BaseIcon name="align-left" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_ALIGN_CENTER" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isJustifyCenter }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'justifyCenter')">
						<BaseIcon name="align-center" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_ALIGN_RIGHT" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isJustifyRight }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'justifyRight')">
						<BaseIcon name="align-right" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_ALIGN_JUSTIFY" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isJustifyFull }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'justifyFull')">
						<BaseIcon name="align-justify" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
			</span>

			<span class="base-editor__group" :class="classes.group">
				<BaseTooltip :text="UI_EDITOR_LIST_BULLET" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isUnorderedList }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'insertUnorderedList')">
						<BaseIcon name="list-bullet" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_LIST_NUMBERED" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isOrderedList }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'insertOrderedList')">
						<BaseIcon name="list-number" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
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
						@change="(val: string | number) => emit('handleHeadingChange', val)" />
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
				<BaseTooltip :text="UI_EDITOR_QUOTE" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isBlockquote }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyBlock', 'blockquote')">
						<BaseIcon name="quote" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="UI_EDITOR_CODE_BLOCK" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isPre }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyBlock', 'pre')">
						<BaseIcon name="code" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
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
import { BaseButton } from '@components/BaseButton'
import { BaseColorPicker } from '@components/BaseColorPicker'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import type { BaseSelectOption } from '@components/BaseSelect'
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
import { ref } from 'vue'

interface ActiveStates {
	isBold: boolean
	isItalic: boolean
	isUnderline: boolean
	isStrike: boolean
	isJustifyLeft: boolean
	isJustifyCenter: boolean
	isJustifyRight: boolean
	isJustifyFull: boolean
	isUnorderedList: boolean
	isOrderedList: boolean
	isBlockquote: boolean
	isPre: boolean
}

const props = defineProps<{
	activeStates: ActiveStates
	sizeScale: number
	classes: Record<string, string>
	isCodeMode: boolean
	isReadonly: boolean
	hasToolbar: boolean
	headingOptions: BaseSelectOption[]
	textColor: string
	backgroundColor: string
	isTextColorActive: boolean
	isBackgroundColorActive: boolean
}>()

const emit = defineEmits<{
	applyFormat: [command: string]
	applyBlock: [tag: string]
	handleHeadingChange: [value: string | number]
	insertLink: []
	handleImageUpload: [event: Event]
	handleVideoUpload: [event: Event]
	clearAllFormatting: []
	insertSeparator: []
	toggleCodeMode: []
	saveSelection: []
	handleTextColor: [color: string]
	handleBackgroundColor: [color: string]
	resetTextColor: []
	resetBackgroundColor: []
}>()

const headingValue = ref<string | number>('p')
const textColorModel = ref(props.textColor)
const backgroundColorModel = ref(props.backgroundColor)

defineSlots<{
	toolbar(): unknown
}>()
</script>

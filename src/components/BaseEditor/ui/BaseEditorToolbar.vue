<template>
	<div v-if="hasToolbar && !isReadonly" class="base-editor__toolbar" :class="classes.toolbar" @mousedown.prevent>
		<slot name="toolbar">
			<span class="base-editor__group" :class="classes.group">
				<BaseTooltip text="Жирный" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isBold }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'bold')">
						<BaseIcon name="bold" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="Курсив" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isItalic }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'italic')">
						<BaseIcon name="italic" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="Подчёркнутый" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isUnderline }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'underline')">
						<BaseIcon name="underline" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="Зачёркнутый" position="top" :size-scale="sizeScale">
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
				<BaseTooltip text="Цвет текста" position="top" :size-scale="sizeScale">
					<BaseColorPicker
						v-model="textColorModel"
						class="base-editor__color-picker"
						:class="{ 'base-editor__color-picker--active': isTextColorActive }"
						:style="isTextColorActive ? { '--editor-swatch-color': textColorModel } : undefined"
						:custom-class="{ swatch: classes.colorPicker }"
						:size-scale="sizeScale"
						has-transparent-swatch
						is-resettable
						reset-label="Сбросить цвет текста"
						@mousedown.prevent="emit('saveSelection')"
						@change="(color: string) => emit('handleTextColor', color)"
						@reset="emit('resetTextColor')">
						<template #trigger>
							<BaseIcon name="color-picker" :size-scale="calcIconScale('md', sizeScale)" />
						</template>
					</BaseColorPicker>
				</BaseTooltip>
				<BaseTooltip text="Цвет фона" position="top" :size-scale="sizeScale">
					<BaseColorPicker
						v-model="backgroundColorModel"
						class="base-editor__color-picker"
						:class="{ 'base-editor__color-picker--active': isBackgroundColorActive }"
						:style="isBackgroundColorActive ? { '--editor-swatch-color': backgroundColorModel } : undefined"
						:custom-class="{ swatch: classes.colorPicker }"
						:size-scale="sizeScale"
						has-transparent-swatch
						is-resettable
						reset-label="Сбросить цвет фона"
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
				<BaseTooltip text="По левому краю" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isJustifyLeft }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'justifyLeft')">
						<BaseIcon name="align-left" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="По центру" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isJustifyCenter }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'justifyCenter')">
						<BaseIcon name="align-center" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="По правому краю" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isJustifyRight }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'justifyRight')">
						<BaseIcon name="align-right" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="По ширине" position="top" :size-scale="sizeScale">
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
				<BaseTooltip text="Маркированный список" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isUnorderedList }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyFormat', 'insertUnorderedList')">
						<BaseIcon name="list-bullet" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="Нумерованный список" position="top" :size-scale="sizeScale">
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
						placeholder="Формат"
						:size-scale="sizeScale"
						@change="(val: string | number) => emit('handleHeadingChange', val)" />
				</div>
			</span>

			<span class="base-editor__group" :class="classes.group">
				<BaseTooltip text="Ссылка" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[classes.btn]"
						:size-scale="sizeScale"
						@click="emit('insertLink')">
						<BaseIcon name="link" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="Изображение" position="top" :size-scale="sizeScale">
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
				<BaseTooltip text="Видео" position="top" :size-scale="sizeScale">
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
				<BaseTooltip text="Цитата" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[{ 'base-editor__btn--active': activeStates.isBlockquote }, classes.btn]"
						:size-scale="sizeScale"
						@click="emit('applyBlock', 'blockquote')">
						<BaseIcon name="quote" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="Блок кода" position="top" :size-scale="sizeScale">
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
				<BaseTooltip text="Очистить форматирование" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[classes.btn]"
						:size-scale="sizeScale"
						@click="emit('clearAllFormatting')">
						<BaseIcon name="format-clear" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip text="Разделитель" position="top" :size-scale="sizeScale">
					<BaseButton
						variant="ghost"
						class="base-editor__btn"
						:class="[classes.btn]"
						:size-scale="sizeScale"
						@click="emit('insertSeparator')">
						<BaseIcon name="separator" :size-scale="calcIconScale('md', sizeScale)" />
					</BaseButton>
				</BaseTooltip>
				<BaseTooltip :text="isCodeMode ? 'Визуальный режим' : 'Режим кода'" position="top" :size-scale="sizeScale">
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

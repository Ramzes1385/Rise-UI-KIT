<template>
	<div
		class="base-emoji-picker"
		:class="[variantClass, classes.root, { 'base-emoji-picker--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, columnsStyle]"
		role="group"
		:aria-label="UI_EMOJI.LABEL"
		:aria-busy="isLoading ? 'true' : undefined">
		<label v-if="hasSearch" class="base-emoji-picker__search" :class="classes.search">
			<BaseIcon name="search" />
			<input
				v-model="query"
				type="search"
				class="base-emoji-picker__input"
				:placeholder="UI_EMOJI.SEARCH"
				:aria-label="UI_EMOJI.SEARCH"
				:aria-controls="gridId"
				:disabled="isDisabled"
				autocomplete="off"
				@keydown="handleSearchKeydown" />
		</label>
		<div v-if="!query" class="base-emoji-picker__nav" :class="classes.nav" role="group" :aria-label="UI_EMOJI.CATEGORIES">
			<button
				v-for="section in sections"
				:key="section.id"
				type="button"
				class="base-emoji-picker__tab"
				:aria-label="section.label"
				:aria-current="section.id === currentSection ? 'true' : undefined"
				:disabled="isDisabled"
				@click="scrollToSection(section)">
				{{ section.icon }}
			</button>
		</div>
		<div
			:id="gridId"
			ref="scrollRef"
			:tabindex="isDisabled ? 0 : undefined"
			class="base-emoji-picker__grid"
			:class="classes.grid"
			@scroll="handleScroll"
			@keydown="handleGridKeydown">
			<div
				v-for="section in sections"
				:key="section.id"
				class="base-emoji-picker__section"
				role="group"
				:aria-labelledby="`${gridId}-${section.id}`"
				:data-section="section.id">
				<p :id="`${gridId}-${section.id}`" class="base-emoji-picker__heading">{{ section.label }}</p>
				<div class="base-emoji-picker__items">
					<button
						v-for="(item, position) in section.items"
						:key="item.emoji"
						type="button"
						class="base-emoji-picker__emoji"
						:aria-label="item.label"
						:data-index="section.offset + position"
						:tabindex="section.offset + position === activeIndex ? 0 : -1"
						:disabled="isDisabled"
						@click="select(item, section.offset + position)"
						@focus="showPreview(item)"
						@mouseenter="showPreview(item)">
						{{ item.emoji }}
					</button>
				</div>
			</div>
			<p class="base-emoji-picker__empty" role="status">{{ isEmpty ? UI_EMOJI.EMPTY : '' }}</p>
		</div>
		<div v-if="hasPreview" class="base-emoji-picker__preview" :class="classes.preview" aria-hidden="true">
			<span class="base-emoji-picker__preview-emoji">{{ preview?.emoji }}</span>
			<span class="base-emoji-picker__preview-label">{{ preview?.label ?? UI_EMOJI.LABEL }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseEmojiPicker.style.scss'
import { UI_EMOJI } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseEmojiPicker } from '../model/useBaseEmojiPicker'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseEmojiPickerEmits, BaseEmojiPickerProps } from '../types/BaseEmojiPicker.types'

const props = withDefaults(defineProps<BaseEmojiPickerProps>(), {
	recent: undefined,
	maxRecent: 24,
	columns: 8,
	emojis: undefined,
	hasSearch: true,
	hasPreview: true,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseEmojiPickerEmits>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	columnsStyle,
	gridId,
	scrollRef,
	query,
	sections,
	currentSection,
	isLoading,
	isEmpty,
	activeIndex,
	preview,
	showPreview,
	select,
	scrollToSection,
	handleScroll,
	handleGridKeydown,
	handleSearchKeydown,
} = useBaseEmojiPicker(props, emit)
</script>

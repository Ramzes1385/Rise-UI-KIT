<template>
	<div
		:class="[ui('root'), variantClass, classes.root, { 'base-emoji-picker--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, columnsStyle]"
		role="group"
		:aria-label="UI_EMOJI.LABEL"
		:aria-busy="isLoading ? 'true' : undefined">
		<BaseInput
			v-if="hasSearch"
			v-model="query"
			type="search"
			:class="[ui('search'), classes.search]"
			:custom-class="{ field: ui('input') }"
			:size-scale="sizeScale"
			:placeholder="UI_EMOJI.SEARCH"
			:aria-label="UI_EMOJI.SEARCH"
			:input-attrs="{ 'aria-controls': gridId, autocomplete: 'off' }"
			:is-disabled="isDisabled"
			@keydown="handleSearchKeydown" />
		<div v-if="!query" :class="[ui('nav'), classes.nav]" role="group" :aria-label="UI_EMOJI.CATEGORIES">
			<button
				v-for="section in sections"
				:key="section.id"
				type="button"
				:class="ui('tab')"
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
			:class="[ui('grid'), classes.grid]"
			@scroll="handleScroll"
			@keydown="handleGridKeydown">
			<div
				v-for="section in sections"
				:key="section.id"
				class="base-emoji-picker__section"
				role="group"
				:aria-labelledby="`${gridId}-${section.id}`"
				:data-section="section.id">
				<p :id="`${gridId}-${section.id}`" :class="ui('heading')">{{ section.label }}</p>
				<div class="base-emoji-picker__items">
					<button
						v-for="(item, position) in section.items"
						:key="item.emoji"
						type="button"
						:class="ui('emoji')"
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
		<div v-if="hasPreview" :class="[ui('preview'), classes.preview]" aria-hidden="true">
			<span class="base-emoji-picker__preview-emoji">{{ preview?.emoji }}</span>
			<span class="base-emoji-picker__preview-label">{{ preview?.label ?? UI_EMOJI.LABEL }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseEmojiPicker.style.scss'
import { UI_EMOJI } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
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
	ui,
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

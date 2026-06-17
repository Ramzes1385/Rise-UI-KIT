<template>
	<div class="base-select__dropdown-content" :class="classes.dropdownContent" :style="sizeScaleStyle">
		<div v-if="isSearchable" class="base-select__search" :class="classes.search">
			<input
				v-model="searchQuery"
				type="text"
				:placeholder="UI_TEXT.SEARCH_PLACEHOLDER"
				class="base-select__search-input"
				:class="classes.searchInput"
				@click.stop />
		</div>

		<slot name="header" />

		<ul class="base-select__options" :class="classes.options">
			<li
				v-for="option in filteredOptions"
				:key="option.value"
				class="base-select__option"
				:class="[
					{
						'base-select__option--selected': isSelected(option.value),
						'base-select__option--disabled': option.isDisabled,
						'base-select__option--with-desc': option.description,
					},
					classes.option,
				]"
				@click="$emit('select', option)">
				<slot name="option" :option="option" :is-selected="isSelected(option.value)">
					<span v-if="isMultiple" class="base-select__checkbox" :class="classes.checkbox">
						<BaseIcon v-if="isSelected(option.value)" name="check" :size-scale="calcIconScale('xs', sizeScale)" />
					</span>
					<BaseText
						v-if="option.icon"
						tag="span"
						class="base-select__option-icon"
						:custom-class="classes.optionIcon"
						:size-scale="sizeScale"
						>{{ option.icon }}</BaseText
					>
					<div class="base-select__option-content" :class="classes.optionContent">
						<BaseText
							tag="span"
							class="base-select__option-label"
							:custom-class="classes.optionLabel"
							:size-scale="sizeScale"
							>{{ option.label }}</BaseText
						>
						<BaseText
							v-if="option.description"
							tag="span"
							class="base-select__option-desc"
							:custom-class="classes.optionDesc"
							:size-scale="sizeScale"
							>{{ option.description }}</BaseText
						>
					</div>
				</slot>
			</li>
			<li v-if="filteredOptions.length === 0" class="base-select__no-results" :class="classes.noResults">
				<slot name="empty">
					<BaseText tag="span" :size-scale="sizeScale">{{ UI_TEXT.NO_RESULTS }}</BaseText>
				</slot>
			</li>
		</ul>

		<slot name="footer" />
	</div>
</template>

<script setup lang="ts">
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { UI_TEXT } from '@constants'
import type { BaseSelectOption } from '../model/BaseSelect.types'

defineProps<{
	filteredOptions: BaseSelectOption[]
	isSearchable: boolean
	isMultiple: boolean
	sizeScale: number
	isSelected: (value: string | number) => boolean
	classes: Record<string, string | undefined>
	sizeScaleStyle: Record<string, string> | undefined
}>()

defineEmits<{
	select: [option: BaseSelectOption]
}>()

defineSlots<{
	header: () => unknown
	option: (props: { option: BaseSelectOption; isSelected: boolean }) => unknown
	empty: () => unknown
	footer: () => unknown
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
</script>

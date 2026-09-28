<template>
	<div class="base-select__dropdown-content" :class="classes.dropdownContent" :style="sizeScaleStyle">
		<div v-if="isSearchable" class="base-select__search" :class="classes.search">
			<BaseIcon name="search" class="base-select__search-icon" :size-scale="calcIconScale('sm', sizeScale)" />
			<input
				ref="searchRef"
				v-model="searchQuery"
				type="text"
				:placeholder="UI_TEXT.SEARCH_PLACEHOLDER"
				:aria-label="UI_ARIA.SEARCH"
				:aria-controls="listboxId"
				:aria-activedescendant="activeIndex >= 0 ? getOptionId(activeIndex) : undefined"
				autocomplete="off"
				class="base-select__search-input"
				:class="classes.searchInput"
				@click.stop
				@keydown="$emit('search-keydown', $event)" />
		</div>

		<div v-if="$slots.header" class="base-select__header">
			<slot name="header" />
		</div>

		<ul
			:id="listboxId"
			ref="listRef"
			class="base-select__options"
			:class="[{ 'base-select__options--empty': filteredOptions.length === 0 }, classes.options]"
			role="listbox"
			:aria-labelledby="labelledby"
			:aria-label="labelledby ? undefined : listboxLabel"
			:aria-multiselectable="isMultiple ? 'true' : undefined">
			<li
				v-for="(option, index) in filteredOptions"
				:id="getOptionId(index)"
				:key="option.value"
				class="base-select__option"
				:class="[
					{
						'base-select__option--selected': isSelected(option.value),
						'base-select__option--disabled': option.isDisabled,
						'base-select__option--with-desc': option.description,
						'base-select__option--active': index === activeIndex,
					},
					classes.option,
				]"
				role="option"
				:aria-selected="isSelected(option.value) ? 'true' : 'false'"
				:aria-disabled="option.isDisabled ? 'true' : undefined"
				@click="$emit('select', option)"
				@mousemove="index !== activeIndex && $emit('activate', index)">
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
					<span class="base-select__option-content" :class="classes.optionContent">
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
					</span>
					<BaseIcon
						v-if="!isMultiple && isSelected(option.value)"
						name="check"
						class="base-select__check"
						:size-scale="calcIconScale('sm', sizeScale)" />
				</slot>
			</li>
		</ul>

		<div v-if="filteredOptions.length === 0" class="base-select__no-results" :class="classes.noResults">
			<slot name="empty">
				<BaseText tag="span" :size-scale="sizeScale">{{ UI_TEXT.NO_RESULTS }}</BaseText>
			</slot>
		</div>

		<div v-if="$slots.footer" class="base-select__footer">
			<slot name="footer" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { calcIconScale } from '@utils/iconUtils'
import { UI_ARIA, UI_TEXT } from '@/locales/messages'
import { useBaseSelectDropdown } from '../model/useBaseSelectDropdown'
import type { BaseSelectDropdownEmits, BaseSelectDropdownProps, BaseSelectDropdownSlots } from '../types/BaseSelectDropdown.types'

const props = defineProps<BaseSelectDropdownProps>()

defineEmits<BaseSelectDropdownEmits>()

defineSlots<BaseSelectDropdownSlots>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

const { listRef, searchRef } = useBaseSelectDropdown(props)
</script>

<template>
	<div :class="[partClass('dropdown-content'), classes.dropdownContent]" :style="sizeScaleStyle">
		<div v-if="isSearchable" :class="[partClass('search'), classes.search]">
			<BaseInput
				ref="searchRef"
				v-model="searchQuery"
				:class="[partClass('search-input'), classes.searchInput]"
				:placeholder="UI_TEXT.SEARCH_PLACEHOLDER"
				:aria-label="UI_ARIA.SEARCH"
				:input-attrs="{
					autocomplete: 'off',
					'aria-controls': listboxId,
					'aria-activedescendant': activeIndex >= 0 ? getOptionId(activeIndex) : undefined,
				}"
				:size-scale="sizeScale"
				@click.stop
				@keydown="$emit('search-keydown', $event)">
				<template #prefix>
					<BaseIcon name="search" :class="partClass('search-icon')" :size-scale="calcIconScale('sm', sizeScale)" />
				</template>
			</BaseInput>
		</div>

		<div v-if="$slots.header" :class="partClass('header')">
			<slot name="header" />
		</div>

		<ul
			:id="listboxId"
			ref="listRef"
			:class="[partClass('options'), { 'base-select__options--empty': filteredOptions.length === 0 }, classes.options]"
			role="listbox"
			:aria-labelledby="labelledby"
			:aria-label="labelledby ? undefined : listboxLabel"
			:aria-multiselectable="isMultiple ? 'true' : undefined">
			<li
				v-for="(option, index) in filteredOptions"
				:id="getOptionId(index)"
				:key="option.value"
				:class="[
					partClass('option'),
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
					<span v-if="isMultiple" :class="[partClass('checkbox'), classes.checkbox]">
						<Transition name="base-select-check" :css="!isMotionReduced">
							<BaseIcon v-if="isSelected(option.value)" name="check" :size-scale="calcIconScale('xs', sizeScale)" />
						</Transition>
					</span>
					<BaseText
						v-if="option.icon"
						tag="span"
						:class="partClass('option-icon')"
						:custom-class="classes.optionIcon"
						:size-scale="sizeScale"
						>{{ option.icon }}</BaseText
					>
					<span :class="[partClass('option-content'), classes.optionContent]">
						<BaseText
							tag="span"
							:class="partClass('option-label')"
							:custom-class="classes.optionLabel"
							:size-scale="sizeScale"
							>{{ option.label }}</BaseText
						>
						<BaseText
							v-if="option.description"
							tag="span"
							:class="partClass('option-desc')"
							:custom-class="classes.optionDesc"
							:size-scale="sizeScale"
							>{{ option.description }}</BaseText
						>
					</span>
					<Transition name="base-select-check" :css="!isMotionReduced">
						<BaseIcon
							v-if="!isMultiple && isSelected(option.value)"
							name="check"
							:class="partClass('check')"
							:size-scale="calcIconScale('sm', sizeScale)" />
					</Transition>
				</slot>
			</li>
		</ul>

		<div v-if="filteredOptions.length === 0" :class="[partClass('no-results'), classes.noResults]">
			<slot name="empty">
				<BaseText tag="span" :size-scale="sizeScale">{{ UI_TEXT.NO_RESULTS }}</BaseText>
			</slot>
		</div>

		<div v-if="$slots.footer" :class="partClass('footer')">
			<slot name="footer" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseInput } from '@components/BaseInput'
import { UI_ARIA, UI_TEXT } from '@/locales/messages'
import { calcIconScale } from '@utils/media/iconUtils'
import { useBaseSelectDropdown } from '../model/useBaseSelectDropdown'
import type { BaseSelectDropdownEmits, BaseSelectDropdownProps, BaseSelectDropdownSlots } from '../types/BaseSelectDropdown.types'

const props = defineProps<BaseSelectDropdownProps>()

defineEmits<BaseSelectDropdownEmits>()

defineSlots<BaseSelectDropdownSlots>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

const { listRef, searchRef } = useBaseSelectDropdown(props)
</script>

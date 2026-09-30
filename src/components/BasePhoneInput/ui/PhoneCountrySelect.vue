<template>
	<BaseDropdown
		v-model:is-open="isOpen"
		class="base-phone-input__country"
		:class="countryClass"
		position="bottom-start"
		:gap="6"
		max-height="none"
		:size-scale="sizeScale"
		@close="handleClose">
		<div
			class="base-phone-input__trigger"
			:class="{ 'base-phone-input__trigger--open': isOpen }"
			role="combobox"
			:tabindex="isDisabled ? undefined : 0"
			aria-haspopup="listbox"
			:aria-expanded="isOpen ? 'true' : 'false'"
			:aria-controls="isOpen ? listboxId : undefined"
			:aria-activedescendant="isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined"
			:aria-label="UI_PHONE_INPUT.COUNTRY"
			:aria-disabled="isDisabled ? 'true' : undefined"
			@click="toggleDropdown"
			@keydown="handleTriggerKeydown">
			<CountryFlag :code="current.code" />
			<span class="base-phone-input__hidden">{{ currentName }}</span>
			{{ ' ' }}
			<span class="base-phone-input__dial">+{{ current.dialCode }}</span>
			<BaseIcon class="base-phone-input__chevron" name="chevron-down" />
		</div>
		<template #dropdown>
			<ul
				:id="listboxId"
				ref="listRef"
				class="base-phone-input__list"
				role="listbox"
				:aria-label="UI_PHONE_INPUT.COUNTRY"
				:tabindex="isScrollable ? 0 : undefined">
				<li
					v-for="(option, index) in options"
					:id="optionId(index)"
					:key="option.value"
					class="base-phone-input__option"
					:class="{
						'base-phone-input__option--active': index === activeIndex,
						'base-phone-input__option--selected': isSelected(option.value),
					}"
					role="option"
					:aria-selected="isSelected(option.value) ? 'true' : 'false'"
					@click="handleSelect(option)"
					@mousemove="index !== activeIndex && setActive(index)">
					<CountryFlag :code="option.value" />
					<span class="base-phone-input__option-name">{{ option.label }}</span>
					{{ ' ' }}
					<span class="base-phone-input__option-dial">{{ option.description }}</span>
					<BaseIcon v-if="isSelected(option.value)" class="base-phone-input__check" name="check" />
				</li>
			</ul>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import CountryFlag from './CountryFlag.vue'
import { BaseIcon } from '@components/BaseIcon'
import { UI_PHONE_INPUT } from '@/locales/messages'
import { BaseDropdown } from '@components/BaseDropdown'
import { usePhoneCountrySelect } from '../model/usePhoneCountrySelect'
import type { PhoneCountrySelectEmits, PhoneCountrySelectProps } from '../types/PhoneCountrySelect.types'

const props = defineProps<PhoneCountrySelectProps>()

const emit = defineEmits<PhoneCountrySelectEmits>()

const {
	isOpen,
	activeIndex,
	isSelected,
	toggleDropdown,
	handleSelect,
	setActive,
	handleClose,
	handleTriggerKeydown,
	isScrollable,
	listRef,
	listboxId,
	optionId,
	options,
	current,
	currentName,
} = usePhoneCountrySelect(props, emit)
</script>

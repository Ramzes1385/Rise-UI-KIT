<template>
	<BaseDropdown
		:is-open="isOpen"
		position="bottom-start"
		:match-width="true"
		:size-scale="sizeScale"
		@close="handleClose">
		<div
			ref="selectRef"
			class="base-select"
			:class="[
				{
					'base-select--open': isOpen,
					'base-select--disabled': isDisabled,
					'base-select--error': hasError,
					'base-select--multiple': isMultiple,
				},
				variant ? `base-select--${variant}` : '',
			]"
			:style="sizeScaleStyle"
			@click="toggleDropdown">
			<div class="base-select__trigger">
				<slot name="trigger" :is-open="isOpen" :selected-label="selectedLabel" :selected-labels="selectedLabels">
					<div class="base-select__values">
						<template v-if="isMultiple && Array.isArray(modelValue) && modelValue.length > 0">
							<template v-if="$slots.tag">
								<slot name="tag" :labels="selectedLabels" :remove="removeValue" />
							</template>
							<template v-else>
								<span v-for="val in selectedLabels" :key="val" class="base-select__tag">
									<span class="base-select__tag-text">{{ val }}</span>
									<span class="base-select__tag-close" @click.stop="removeValue(val)">&times;</span>
								</span>
							</template>
						</template>
						<template v-else-if="isMultiple && (!Array.isArray(modelValue) || modelValue.length === 0)">
							<span class="base-select__placeholder">{{ placeholder }}</span>
						</template>
						<template v-else-if="!isMultiple && selectedOption">
							<slot name="selected" :option="selectedOption">
								<span class="base-select__icon" v-if="selectedOption.icon">{{ selectedOption.icon }}</span>
								<span class="base-select__value-text">{{ selectedLabel }}</span>
							</slot>
						</template>
						<template v-else>
							<span class="base-select__placeholder">{{ placeholder }}</span>
						</template>
					</div>
				</slot>
				<BaseIcon class="base-select__arrow" name="chevron-down" size="sm" :size-scale="sizeScale" />
			</div>
		</div>

		<template #dropdown>
			<div class="base-select__dropdown-content" :style="sizeScaleStyle">
				<div v-if="isSearchable" class="base-select__search">
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Поиск..."
						class="base-select__search-input"
						@click.stop />
				</div>

				<slot name="header" />

				<ul class="base-select__options">
					<li
						v-for="option in filteredOptions"
						:key="option.value"
						class="base-select__option"
						:class="{
							'base-select__option--selected': isSelected(option.value),
							'base-select__option--disabled': option.isDisabled,
							'base-select__option--with-desc': option.description,
						}"
						@click="handleSelect(option)">
						<slot name="option" :option="option" :is-selected="isSelected(option.value)">
							<span v-if="isMultiple" class="base-select__checkbox">
								<BaseIcon v-if="isSelected(option.value)" name="check" size="xs" :size-scale="sizeScale" />
							</span>
							<span v-if="option.icon" class="base-select__option-icon">{{ option.icon }}</span>
							<div class="base-select__option-content">
								<span class="base-select__option-label">{{ option.label }}</span>
								<span v-if="option.description" class="base-select__option-desc">{{ option.description }}</span>
							</div>
						</slot>
					</li>
					<li v-if="filteredOptions.length === 0" class="base-select__no-results">
						<slot name="empty">Ничего не найдено</slot>
					</li>
				</ul>

				<slot name="footer" />
			</div>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseDropdown } from '@/shared/ui/BaseDropdown'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { computed, ref } from 'vue'
import './BaseSelect.style.scss'
import type { BaseSelectEmits, BaseSelectOption, BaseSelectProps } from './BaseSelect.types'

const props = withDefaults(defineProps<BaseSelectProps>(), {
	placeholder: 'Выберите...',
	isMultiple: false,
	isSearchable: false,
	isDisabled: false,
	hasError: false,
	variant: 'default',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-select', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseSelectEmits>()

const isOpen = ref(false)
const searchQuery = ref('')

const selectedOption = computed(() => {
	if (props.isMultiple) return null
	return props.options.find(opt => opt.value === props.modelValue) ?? null
})

const selectedLabel = computed(() => {
	const option = props.options.find(opt => opt.value === props.modelValue)
	return option ? option.label : ''
})

const selectedLabels = computed(() => {
	if (!Array.isArray(props.modelValue)) return []
	const values = props.modelValue as (string | number)[]
	return props.options.filter(opt => values.includes(opt.value)).map(opt => opt.label)
})

const filteredOptions = computed(() => {
	if (!searchQuery.value) return props.options
	const query = searchQuery.value.toLowerCase()
	return props.options.filter(opt => {
		const matchLabel = opt.label.toLowerCase().includes(query)
		const matchDesc = opt.description ? opt.description.toLowerCase().includes(query) : false
		return matchLabel || matchDesc
	})
})

function toggleDropdown(): void {
	if (!props.isDisabled) {
		isOpen.value = !isOpen.value
		if (!isOpen.value) {
			searchQuery.value = ''
		}
	}
}

function handleClose(): void {
	isOpen.value = false
	searchQuery.value = ''
}

function isSelected(value: string | number): boolean {
	if (props.isMultiple) {
		return Array.isArray(props.modelValue) && props.modelValue.includes(value)
	}
	return props.modelValue === value
}

function handleSelect(option: BaseSelectOption): void {
	if (option.isDisabled) return

	if (props.isMultiple) {
		const newValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
		const index = newValue.indexOf(option.value)
		if (index > -1) {
			newValue.splice(index, 1)
		} else {
			newValue.push(option.value)
		}
		emit('update:modelValue', newValue)
		emit('change', newValue)
	} else {
		emit('update:modelValue', option.value)
		emit('change', option.value)
		isOpen.value = false
		searchQuery.value = ''
	}
}

function removeValue(label: string): void {
	const option = props.options.find(opt => opt.label === label)
	if (option && Array.isArray(props.modelValue)) {
		const newValue = props.modelValue.filter(v => v !== option.value)
		emit('update:modelValue', newValue)
		emit('change', newValue)
	}
}
</script>

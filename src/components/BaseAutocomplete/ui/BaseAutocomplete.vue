<template>
	<div class="base-autocomplete" :class="classes.root">
		<BaseDropdown
			v-model:is-open="isOpen"
			class="base-autocomplete__dropdown"
			position="bottom-start"
			:match-width="true"
			:padding="0"
			:prevent-mousedown="true"
			:size-scale="sizeScale"
			:custom-class="{ panel: classes.panel }">
			<BaseInput
				ref="inputRef"
				:model-value="query"
				:variant="variant"
				:label="label"
				:placeholder="placeholder"
				:error="error"
				:is-disabled="isControlDisabled"
				:is-readonly="isReadonly"
				:is-required="isRequired"
				:aria-label="ariaLabel"
				:input-attrs="comboboxAttrs"
				:size-scale="sizeScale"
				:color="color"
				:custom-class="{ field: classes.field }"
				@update:model-value="handleInput"
				@keydown="handleKeydown"
				@blur="handleBlur"
				@focus="emit('focus', $event)"
				@click="handleClick" />

			<template #dropdown>
				<div class="base-autocomplete__panel-content">
					<ul
						:id="listboxId"
						class="base-autocomplete__options"
						:class="{ 'base-autocomplete__options--empty': visibleOptions.length === 0 }"
						role="listbox"
						:aria-label="label || ariaLabel || placeholder">
						<li
							v-for="(option, index) in visibleOptions"
							:id="optionId(index)"
							:key="option.value"
							class="base-autocomplete__option"
							:class="[
								{
									'base-autocomplete__option--active': index === activeIndex,
									'base-autocomplete__option--selected': option.value === modelValue,
									'base-autocomplete__option--disabled': option.isDisabled,
								},
								classes.option,
							]"
							role="option"
							:aria-selected="option.value === modelValue ? 'true' : 'false'"
							:aria-disabled="option.isDisabled ? 'true' : undefined"
							@mousemove="activeIndex = index"
							@click="selectOption(option)">
							<slot
								name="option"
								:option="option"
								:is-active="index === activeIndex"
								:is-selected="option.value === modelValue">
								<span class="base-autocomplete__option-label">
									<template v-for="(part, partIndex) in highlight(option.label)" :key="partIndex">
										<mark v-if="part.isMatch" class="base-autocomplete__match">{{ part.text }}</mark>
										<template v-else>{{ part.text }}</template>
									</template>
								</span>
								<span v-if="option.description" class="base-autocomplete__option-description">{{
									option.description
								}}</span>
							</slot>
						</li>
					</ul>
					<div v-if="isLoading" class="base-autocomplete__empty" :class="classes.empty">{{ UI_TEXT.LOADING }}</div>
					<div v-else-if="visibleOptions.length === 0" class="base-autocomplete__empty" :class="classes.empty">
						<slot name="empty">{{ UI_TEXT.NO_RESULTS }}</slot>
					</div>
				</div>
			</template>
		</BaseDropdown>
		<span class="base-autocomplete__status" role="status">{{ statusText }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAutocomplete.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { kitDefaults } from '@composables/useDefaults'
import { BaseDropdown } from '@components/BaseDropdown'
import { useBaseAutocomplete } from '../model/useBaseAutocomplete'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseAutocompleteEmits, BaseAutocompleteProps, BaseAutocompleteSlots } from '../types/BaseAutocomplete.types'

const props = withDefaults(
	defineProps<BaseAutocompleteProps>(),
	kitDefaults('BaseAutocomplete', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		isCustomAllowed: false,
		isRemote: false,
		isLoading: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseAutocompleteEmits>()
defineSlots<BaseAutocompleteSlots>()

const {
	classes,
	inputRef,
	listboxId,
	isControlDisabled,
	query,
	isOpen,
	activeIndex,
	visibleOptions,
	selectOption,
	optionId,
	highlight,
	statusText,
	comboboxAttrs,
	handleInput,
	handleClick,
	handleKeydown,
	handleBlur,
	exposed,
} = useBaseAutocomplete(props, emit)

defineExpose(exposed)
</script>

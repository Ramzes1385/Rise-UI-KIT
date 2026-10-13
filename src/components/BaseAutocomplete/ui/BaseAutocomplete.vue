<template>
	<div ref="rootRef" :class="[ui('root'), classes.root]">
		<BaseDropdown
			v-model:is-open="isOpen"
			:class="ui('dropdown')"
			position="bottom-start"
			:match-width="true"
			:padding="0"
			:prevent-mousedown="true"
			:size-scale="sizeScale"
			:custom-class="{ panel: panelClass }">
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
				:ui="inputUi"
				@update:model-value="handleInput"
				@keydown="handleKeydown"
				@blur="handleBlur"
				@focus="emit('focus', $event)"
				@click="handleClick" />

			<template #dropdown>
				<div :class="ui('panel-content')">
					<TransitionGroup
						:id="listboxId"
						tag="ul"
						name="base-autocomplete-option"
						:css="!isMotionReduced"
						:class="[ui('options'), { 'base-autocomplete__options--empty': visibleOptions.length === 0 }]"
						role="listbox"
						:aria-label="label || ariaLabel || placeholder"
						@leave="leaveAtOnce">
						<li
							v-for="(option, index) in visibleOptions"
							:id="optionId(index)"
							:key="option.value"
							:class="[
								ui('option'),
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
								<span :class="ui('option-label')">
									<template v-for="(part, partIndex) in highlight(option.label)" :key="partIndex">
										<mark v-if="part.isMatch" :class="ui('match')">{{ part.text }}</mark>
										<template v-else>{{ part.text }}</template>
									</template>
								</span>
								<span v-if="option.description" :class="ui('option-description')">{{ option.description }}</span>
							</slot>
						</li>
					</TransitionGroup>
					<Transition name="base-autocomplete-state" :css="!isMotionReduced" @leave="leaveAtOnce">
						<BaseEmpty
							v-if="isLoading"
							key="loading"
							is-compact
							variant="ghost"
							:class="[ui('empty'), classes.empty]"
							:description="UI_TEXT.LOADING"
							:size-scale="sizeScale" />
						<BaseEmpty
							v-else-if="visibleOptions.length === 0"
							key="empty"
							is-compact
							variant="ghost"
							:class="[ui('empty'), classes.empty]"
							:size-scale="sizeScale">
							<slot name="empty">{{ UI_TEXT.NO_RESULTS }}</slot>
						</BaseEmpty>
					</Transition>
				</div>
			</template>
		</BaseDropdown>
		<span :class="ui('status')" role="status">{{ statusText }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAutocomplete.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseInput } from '@components/BaseInput'
import { BaseDropdown } from '@components/BaseDropdown'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseAutocomplete } from '../model/useBaseAutocomplete'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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
	ui,
	inputUi,
	panelClass,
	rootRef,
	isMotionReduced,
	leaveAtOnce,
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

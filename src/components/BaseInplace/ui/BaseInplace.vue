<template>
	<span
		:class="[ui('root'), variantClass, { 'base-inplace--editing': isEditing }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<Transition name="base-inplace-mode">
			<button
				v-if="!isEditing"
				ref="displayRef"
				type="button"
				:class="[ui('display'), { 'base-inplace__display--empty': !modelValue }, classes.display]"
				:disabled="isControlDisabled"
				:aria-label="`${label}: ${modelValue || placeholder}`"
				:aria-describedby="hintId"
				@click="edit">
				<slot name="display" :value="modelValue">{{ modelValue || placeholder }}</slot>
			</button>
			<BaseInput
				v-else
				ref="inputRef"
				v-model="draft"
				:class="ui('field')"
				:aria-label="label"
				:size-scale="sizeScale"
				:custom-class="{ root: classes.field }"
				@keydown="handleKeydown"
				@blur="handleBlur" />
		</Transition>
		<span :id="hintId" class="base-inplace__hint">{{ UI_ARIA.INPLACE_HINT }}</span>
	</span>
</template>

<script setup lang="ts">
import '../styles/BaseInplace.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { useBaseInplace } from '../model/useBaseInplace'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseInplaceEmits, BaseInplaceProps, BaseInplaceSlots } from '../types/BaseInplace.types'

const props = withDefaults(
	defineProps<BaseInplaceProps>(),
	kitDefaults('BaseInplace', {
		variant: DEFAULT_VARIANT,
		modelValue: '',
		placeholder: '—',
		isDisabled: false,
		isSaveOnBlur: true,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseInplaceEmits>()
defineSlots<BaseInplaceSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	hintId,
	displayRef,
	inputRef,
	isEditing,
	draft,
	isControlDisabled,
	actions,
	edit,
	handleKeydown,
	handleBlur,
} = useBaseInplace(props, emit)

defineExpose(actions)
</script>

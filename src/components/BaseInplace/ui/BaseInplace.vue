<template>
	<!--
		Текст, который редактируется на месте: в просмотре — кнопка (имя — «что: значение», подсказка «Нажмите, чтобы
		изменить»), по клику, Enter или пробелу — поле. Enter сохраняет, Escape отменяет; фокус возвращается на кнопку
	-->
	<span
		class="base-inplace"
		:class="[variantClass, { 'base-inplace--editing': isEditing }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<button
			v-if="!isEditing"
			ref="displayRef"
			type="button"
			class="base-inplace__display"
			:class="[{ 'base-inplace__display--empty': !modelValue }, classes.display]"
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
			class="base-inplace__field"
			:aria-label="label"
			:size-scale="sizeScale"
			:custom-class="{ root: classes.field }"
			@keydown="handleKeydown"
			@blur="handleBlur" />
		<span :id="hintId" class="base-inplace__hint">{{ UI_ARIA.INPLACE_HINT }}</span>
	</span>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseInplace } from '../model/useBaseInplace'
import '../styles/BaseInplace.style.scss'
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

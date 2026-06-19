<template>
	<button
		ref="buttonRef"
		class="base-button"
		:class="[
			variantClass,
			classes.root,
			{
				'base-button--loading': isLoading,
				'base-button--disabled': isDisabled || isLoading,
			},
		]"
		:style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]"
		:type="type"
		:disabled="isDisabled || isLoading"
		@click="handleClick">
		<span v-if="isLoading" class="base-button__loader"></span>
		<span class="base-button__content">
			<span v-if="$slots.left" class="base-button__slot-left">
				<slot name="left" />
			</span>
			<slot />
			<span v-if="$slots.right" class="base-button__slot-right">
				<slot name="right" />
			</span>
		</span>
	</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { usePadding } from '@composables/usePadding'
import { SIZE_SCALE_DEFAULT, UI_SIZE } from '@constants'
import '../styles/BaseButton.style.scss'
import type { BaseButtonEmits, BaseButtonExpose, BaseButtonProps, BaseButtonSlots } from '../model/BaseButton.types'


const props = withDefaults(defineProps<BaseButtonProps>(), {
	type: 'button',
	padding: 10,
	isLoading: false,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseButtonEmits>()

defineSlots<BaseButtonSlots>()

const buttonRef = ref<HTMLButtonElement | null>(null)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-button', props, ['root'])
const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--btn-pad', defaultPadding: UI_SIZE.PADDING.MD })

function handleClick(e: MouseEvent): void {
	if (props.isDisabled || props.isLoading) return
	emit('click', e)
}

defineExpose<BaseButtonExpose>({
	buttonRef,
	focus: () => buttonRef.value?.focus(),
	blur: () => buttonRef.value?.blur(),
})
</script>

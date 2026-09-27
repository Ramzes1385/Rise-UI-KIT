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
		:disabled="isDisabled"
		:aria-disabled="isLoading ? 'true' : undefined"
		:aria-busy="isLoading ? 'true' : undefined"
		@click="handleClick">
		<span v-if="isLoading" class="base-button__loader" aria-hidden="true"></span>
		<span class="base-button__content">
			<span v-if="$slots.left" class="base-button__slot-left">
				<slot name="left" />
			</span>
			<span v-if="$slots.default" class="base-button__label">
				<slot />
			</span>
			<span v-if="$slots.right" class="base-button__slot-right">
				<slot name="right" />
			</span>
		</span>
	</button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { usePadding } from '@composables/usePadding'
import { SIZE_SCALE_DEFAULT } from '@constants'
import '../styles/BaseButton.style.scss'
import type { BaseButtonEmits, BaseButtonProps, BaseButtonSlots } from '../model/BaseButton.types'


const props = withDefaults(defineProps<BaseButtonProps>(), {
	type: 'button',
	padding: undefined,
	isLoading: false,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseButtonEmits>()

defineSlots<BaseButtonSlots>()

const buttonRef = ref<HTMLButtonElement | null>(null)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-button', props, ['root'])
const { paddingStyle: explicitPaddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--btn-pad' })
/** Без пропа padding отступы берутся из токенов темы (--rise-control-padding-*), inline-переменные не пишутся. */
const paddingStyle = computed(() => (props.padding === undefined ? undefined : explicitPaddingStyle.value))

/**
 * Во время загрузки кнопка не получает нативный `disabled`: иначе сфокусированная кнопка
 * выпадает из фокус-порядка и браузер сбрасывает фокус на body. Вместо этого она помечена
 * aria-disabled/aria-busy, а активация (мышь, Enter, Space) гасится здесь — preventDefault
 * отменяет и отправку/сброс формы для type="submit"/"reset", stopPropagation не даёт клику
 * дойти до обработчиков предков (как и с нативным disabled: `<tr @click>` вокруг кнопки не срабатывает).
 */
function handleClick(e: MouseEvent): void {
	if (props.isLoading) {
		e.preventDefault()
		e.stopPropagation()
		return
	}
	if (props.isDisabled) return
	emit('click', e)
}

defineExpose({
	buttonRef,
	focus: () => buttonRef.value?.focus(),
	blur: () => buttonRef.value?.blur(),
})
</script>

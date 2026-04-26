<template>
	<BaseDropdown
		:is-open="isOpenInternal"
		:position="position"
		:variant="variant"
		:color="color"
		:gap="10"
		:match-width="false"
		:prevent-mousedown="false"
		:panel-class="panelClasses"
		:size-scale="sizeScale"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@close="handleClose">
		<div class="base-popover__trigger" @click="toggle">
			<slot name="trigger" />
		</div>

		<template #dropdown>
			<div class="base-popover__arrow" :class="[`base-popover__arrow--${position}`]" :style="sizeScaleStyle"></div>
			<div class="base-popover__inner" :style="sizeScaleStyle">
				<slot />
			</div>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseDropdown } from '@/shared/ui/BaseDropdown'
import { computed, ref, watch } from 'vue'
import './BasePopover.style.scss'
import type { BasePopoverEmits, BasePopoverProps } from './BasePopover.types'

const props = withDefaults(defineProps<BasePopoverProps>(), {
	isOpen: false,
	position: 'bottom',
	variant: 'default',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantStyle } = useVariant({ block: 'base-popover', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BasePopoverEmits>()

const isOpenInternal = ref(props.isOpen)

/** Синхронизация с prop */
watch(
	() => props.isOpen,
	(val: boolean) => {
		isOpenInternal.value = val
	},
)

/** CSS-классы панели */
const panelClasses = computed((): string => {
	return `base-popover__panel base-popover__panel--${props.variant}`
})

/** Переключить видимость */
function toggle(): void {
	isOpenInternal.value = !isOpenInternal.value
	emit('update:isOpen', isOpenInternal.value)
}

/** Закрыть popover */
function handleClose(): void {
	isOpenInternal.value = false
	emit('update:isOpen', false)
	emit('close')
}
</script>

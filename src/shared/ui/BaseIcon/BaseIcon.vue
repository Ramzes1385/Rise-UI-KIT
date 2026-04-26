<template>
	<svg
		class="base-icon"
		:class="[`base-icon--${size}`]"
		:style="[iconStyle, sizeScaleStyle]"
		:aria-hidden="isDecorative"
		:aria-label="ariaLabel || undefined"
		:role="isDecorative ? 'presentation' : 'img'"
		focusable="false">
		<use :href="iconUrl" />
	</svg>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useIcon } from '@/shared/composables/useIcon'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { computed } from 'vue'
import './BaseIcon.style.scss'
import type { BaseIconProps } from './BaseIcon.types'

const props = withDefaults(defineProps<BaseIconProps>(), {
	size: 'md',
	variant: 'default',
	rotate: 0,
	isFlipX: false,
	isFlipY: false,
	ariaLabel: '',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-icon', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const { getIconUrl } = useIcon()

/** URL иконки в спрайте */
const iconUrl = computed(() => getIconUrl(props.name))

/** Декоративная иконка — без доступной метки */
const isDecorative = computed(() => !props.ariaLabel)

/** Инлайн-стили для цвета и трансформаций */
const iconStyle = computed(() => {
	const styles: Record<string, string> = {}

	const transforms: string[] = []
	if (props.rotate) transforms.push(`rotate(${props.rotate}deg)`)
	if (props.isFlipX) transforms.push('scaleX(-1)')
	if (props.isFlipY) transforms.push('scaleY(-1)')
	if (transforms.length) styles.transform = transforms.join(' ')

	return styles
})
</script>

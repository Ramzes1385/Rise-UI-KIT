<template>
	<div class="base-icon" :class="classes.root" :style="sizeScaleStyle">
		<svg
			class="base-icon__svg"
			:class="classes.svg"
			:style="iconStyle"
			:aria-hidden="isDecorative ? true : undefined"
			:aria-label="ariaLabel || undefined"
			:role="isDecorative ? 'presentation' : 'img'"
			focusable="false">
			<use :href="iconUrl" />
		</svg>
	</div>
</template>

<script setup lang="ts">
import { useCustomClass } from '@composables/useCustomClass'
import { useIcon } from '@composables/useIcon'
import { useSizeScale } from '@composables/useSizeScale'
import { computed } from 'vue'
import '../styles/BaseIcon.style.scss'
import type { BaseIconProps } from '../model/BaseIcon.types'

const props = defineProps<BaseIconProps>()

const color = computed(() => props.color ?? '')
const rotate = computed(() => props.rotate ?? 0)
const isFlipX = computed(() => props.isFlipX ?? false)
const isFlipY = computed(() => props.isFlipY ?? false)
const ariaLabel = computed(() => props.ariaLabel ?? '')
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'svg'],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale ?? 100 })

const { getIconUrl } = useIcon()

const iconUrl = computed(() => getIconUrl(props.name))

const isDecorative = computed(() => !ariaLabel.value)

const iconStyle = computed(() => {
	const styles: Record<string, string> = {}

	if (color.value) styles.color = color.value

	const transforms: string[] = []
	if (rotate.value) transforms.push(`rotate(${rotate.value}deg)`)
	if (isFlipX.value) transforms.push('scaleX(-1)')
	if (isFlipY.value) transforms.push('scaleY(-1)')
	if (transforms.length) styles.transform = transforms.join(' ')

	return styles
})
</script>

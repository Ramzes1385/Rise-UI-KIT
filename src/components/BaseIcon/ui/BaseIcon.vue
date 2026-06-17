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
import { computed } from 'vue'
import { useCustomClass } from '@composables/useCustomClass'
import { useIcon } from '@composables/useIcon'
import { useSizeScale } from '@composables/useSizeScale'
import '../styles/BaseIcon.style.scss'
import { SIZE_SCALE_DEFAULT } from '@constants'
import type { BaseIconProps } from '../model/BaseIcon.types'

const props = withDefaults(defineProps<BaseIconProps>(), {
	color: '',
	rotate: 0,
	isFlipX: false,
	isFlipY: false,
	ariaLabel: '',
	sizeScale: SIZE_SCALE_DEFAULT,
})
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'svg'],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })

const { getIconUrl } = useIcon()

const iconUrl = computed(() => getIconUrl(props.name))

const isDecorative = computed(() => !props.ariaLabel)

const iconStyle = computed(() => {
	const styles: Record<string, string> = {}

	if (props.color) styles.color = props.color

	const transforms: string[] = []
	if (props.rotate) transforms.push(`rotate(${props.rotate}deg)`)
	if (props.isFlipX) transforms.push('scaleX(-1)')
	if (props.isFlipY) transforms.push('scaleY(-1)')
	if (transforms.length) styles.transform = transforms.join(' ')

	return styles
})
</script>

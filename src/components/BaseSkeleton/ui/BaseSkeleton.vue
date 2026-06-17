<template>
	<div
		class="base-skeleton"
		:class="[
			`base-skeleton--${props.shape}`,
			{
				'base-skeleton--animated': props.isAnimated,
				'base-skeleton--pulse': props.isPulse,
			},
			classes.root,
		]"
		:style="skeletonStyle"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useCustomClass } from '@composables/useCustomClass'

import '../styles/BaseSkeleton.style.scss'
import type { BaseSkeletonProps } from '../model/BaseSkeleton.types'
import { SIZE_SCALE_DEFAULT } from '@constants'

const props = withDefaults(defineProps<BaseSkeletonProps>(), {
	shape: 'rect',
	isAnimated: true,
	isPulse: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { classes } = useCustomClass({
	getClass: function () {
		return props.customClass
	},
	elementKeys: ['root'],
})

function scaleDimension(value: number | string, scale: number): string {
	if (typeof value === 'number') return `${value * scale}px`
	if (scale === 1) return value
	return `calc(${value} * ${scale})`
}

const skeletonStyle = computed(() => {
	const styles: Record<string, string> = {}
	const scale = props.sizeScale / 100

	if (props.width) {
		styles.width = scaleDimension(props.width, scale)
	}

	if (props.height) {
		styles.height = scaleDimension(props.height, scale)
	}

	if (props.color) {
		styles.backgroundColor = props.color
	}

	// Для SCSS sz() — border-radius и дефолтные размеры shape
	if (scale !== 1) {
		styles['--size-scale'] = String(scale)
	}

	return styles
})
</script>

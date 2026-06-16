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

const props = withDefaults(defineProps<BaseSkeletonProps>(), {
	shape: 'rect',
	isAnimated: true,
	isPulse: false,
	sizeScale: 100,
})

const { classes } = useCustomClass({
	getClass: function () {
		return props.customClass
	},
	elementKeys: ['root'],
})

const skeletonStyle = computed(() => {
	const styles: Record<string, string> = {}
	const scale = props.sizeScale / 100

	if (props.width) {
		styles.width =
			typeof props.width === 'number'
				? `${props.width * scale}px`
				: scale === 1
					? props.width
					: `calc(${props.width} * ${scale})`
	}

	if (props.height) {
		styles.height =
			typeof props.height === 'number'
				? `${props.height * scale}px`
				: scale === 1
					? props.height
					: `calc(${props.height} * ${scale})`
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

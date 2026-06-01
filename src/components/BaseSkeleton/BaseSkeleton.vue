<template>
	<div
		class="base-skeleton"
		:class="[
			`base-skeleton--${shape}`,
			{
				'base-skeleton--animated': isAnimated,
				'base-skeleton--pulse': isPulse,
			},
			classes.root,
		]"
		:style="skeletonStyle"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useCustomClass } from '@composables/useCustomClass'

import './BaseSkeleton.style.scss'
import type { BaseSkeletonProps } from './BaseSkeleton.types'

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

/** Вычисленные стили с учётом sizeScale и color */
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

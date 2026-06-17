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
import '../styles/BaseSkeleton.style.scss'
import { SIZE_SCALE_DEFAULT } from '@constants'
import type { BaseSkeletonProps } from '../model/BaseSkeleton.types'

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

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
import { computed, getCurrentInstance } from 'vue'

import { useCustomClass } from '@composables/useCustomClass'

import '../styles/BaseSkeleton.style.scss'
import type { BaseSkeletonProps } from '../model/BaseSkeleton.types'

const props = defineProps<BaseSkeletonProps>()
const rawProps = getCurrentInstance()?.vnode.props

const shape = computed(() => props.shape ?? 'rect')
const isAnimated = computed(() =>
	rawProps && ('isAnimated' in rawProps || 'is-animated' in rawProps) ? (props.isAnimated ?? true) : true,
)
const isPulse = computed(() => props.isPulse ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { classes } = useCustomClass({
	getClass: function () {
		return props.customClass
	},
	elementKeys: ['root'],
})

/** Вычисленные стили с учётом sizeScale и color */
const skeletonStyle = computed(() => {
	const styles: Record<string, string> = {}
	const scale = sizeScale.value / 100

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

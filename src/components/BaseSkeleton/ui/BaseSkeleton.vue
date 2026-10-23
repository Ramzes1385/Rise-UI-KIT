<template>
	<div
		:class="[
			ui('root'),
			`base-skeleton--${shape}`,
			{
				'base-skeleton--animated': isAnimated,
				'base-skeleton--pulse': isPulse,
			},
			classes.root,
		]"
		:style="skeletonStyle"
		aria-hidden="true"></div>
</template>

<script setup lang="ts">
import '../styles/BaseSkeleton.style.scss'
import { useBaseSkeleton } from '../model/useBaseSkeleton'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseSkeletonProps } from '../types/BaseSkeleton.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseSkeletonProps>(),
	kitDefaults('BaseSkeleton', {
		shape: 'rect',
		isAnimated: true,
		isPulse: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const { ui, classes, skeletonStyle } = useBaseSkeleton(props)
</script>

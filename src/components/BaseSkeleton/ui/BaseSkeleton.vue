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
		:style="skeletonStyle"
		aria-hidden="true"></div>
</template>

<script setup lang="ts">
import '../styles/BaseSkeleton.style.scss'
import { kitDefaults } from '@composables/useDefaults'
import { useBaseSkeleton } from '../model/useBaseSkeleton'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseSkeletonProps } from '../types/BaseSkeleton.types'

// Заглушка декоративная (aria-hidden): о загрузке сообщает контейнер (aria-busy) или текст статуса, а не скелетон.
const props = withDefaults(
	defineProps<BaseSkeletonProps>(),
	kitDefaults('BaseSkeleton', {
		shape: 'rect',
		isAnimated: true,
		isPulse: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const { classes, skeletonStyle } = useBaseSkeleton(props)
</script>

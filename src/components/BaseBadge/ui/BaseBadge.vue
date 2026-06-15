<template>
	<span
		class="base-badge"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@click="handleClick">
		<slot>
			<BaseText class="base-badge__text" :custom-class="classes.text" tag="span" :weight="600" :size-scale="sizeScale">
				{{ label }}
			</BaseText>
		</slot>
	</span>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import { computed } from 'vue'

import '../styles/BaseBadge.style.scss'
import type { BaseBadgeEmits, BaseBadgeProps } from '../model/BaseBadge.types'

const props = defineProps<BaseBadgeProps>()

const emit = defineEmits<BaseBadgeEmits>()

const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-badge',
	getVariant: () => props.variant,
	getSizeScale: () => sizeScale.value,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'text'],
})

function handleClick(): void {
	emit('click')
}
</script>

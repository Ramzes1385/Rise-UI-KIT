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
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed } from 'vue'

import './BaseBadge.style.scss'
import type { BaseBadgeEmits, BaseBadgeProps } from './BaseBadge.types'

const props = defineProps<BaseBadgeProps>()

const emit = defineEmits<BaseBadgeEmits>()

const variant = computed(() => props.variant ?? 'default')
const sizeScale = computed(() => props.sizeScale ?? 100)

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'text'],
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-badge', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

function handleClick(): void {
	emit('click')
}
</script>

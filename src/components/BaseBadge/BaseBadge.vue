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

import './BaseBadge.style.scss'
import type { BaseBadgeEmits, BaseBadgeProps } from './BaseBadge.types'

const props = withDefaults(defineProps<BaseBadgeProps>(), {
	variant: 'default',
	sizeScale: 100,
})

const emit = defineEmits<BaseBadgeEmits>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'text'],
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-badge', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

function handleClick(): void {
	emit('click')
}
</script>

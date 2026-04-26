<template>
	<span
		class="base-badge"
		:class="[variantClass]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@click="handleClick">
		<slot>
			<BaseText class="base-badge__text" tag="span" :weight="600" :size-scale="sizeScale">
				{{ label }}
			</BaseText>
		</slot>
	</span>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseText } from '@/shared/ui/BaseText'

import './BaseBadge.style.scss'
import type { BaseBadgeEmits, BaseBadgeProps } from './BaseBadge.types'

const props = withDefaults(defineProps<BaseBadgeProps>(), {
	variant: 'default',
	sizeScale: 100,
})

const emit = defineEmits<BaseBadgeEmits>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-badge', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

function handleClick(): void {
	emit('click')
}
</script>

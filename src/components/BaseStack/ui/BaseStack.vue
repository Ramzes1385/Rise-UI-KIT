<template>
	<component :is="tag" :class="[ui('root'), modifiers, classes.root]" :style="sizeScaleStyle">
		<slot />
	</component>
</template>

<script setup lang="ts">
import '../styles/BaseStack.style.scss'
import { useBaseStack } from '../model/useBaseStack'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseStackProps, BaseStackSlots } from '../types/BaseStack.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseStackProps>(),
	kitDefaults('BaseStack', {
		variant: DEFAULT_VARIANT,
		direction: 'column',
		gap: 'md',
		align: 'stretch',
		justify: 'start',
		isWrap: false,
		isInline: false,
		tag: 'div',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseStackSlots>()

const { sizeScaleStyle, classes, ui, modifiers } = useBaseStack(props)
</script>

<template>
	<component :is="tag" :class="[ui('root'), modifiers, classes.root]" :style="rootStyle">
		<slot />
	</component>
</template>

<script setup lang="ts">
import '../styles/BaseGrid.style.scss'
import { useBaseGrid } from '../model/useBaseGrid'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseGridProps, BaseGridSlots } from '../types/BaseGrid.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseGridProps>(),
	kitDefaults('BaseGrid', {
		variant: DEFAULT_VARIANT,
		cols: 12,
		gap: 'md',
		tag: 'div',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseGridSlots>()

const { classes, ui, modifiers, rootStyle } = useBaseGrid(props)
</script>

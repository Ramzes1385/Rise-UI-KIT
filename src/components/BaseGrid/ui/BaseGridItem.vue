<template>
	<component :is="tag" :class="ui('root')" :style="itemStyle">
		<slot />
	</component>
</template>

<script setup lang="ts">
import '../styles/BaseGrid.style.scss'
import { useBaseGridItem } from '../model/useBaseGridItem'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseGridItemProps, BaseGridItemSlots } from '../types/BaseGridItem.types'

const props = withDefaults(defineProps<BaseGridItemProps>(), kitDefaults('BaseGridItem', { tag: 'div' }))

defineSlots<BaseGridItemSlots>()

const { ui, itemStyle } = useBaseGridItem(props)
</script>

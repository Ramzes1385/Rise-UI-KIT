<template>
	<div ref="rootRef" :class="[ui('root'), classes.root]">
		<slot />
		<div ref="layerRef" aria-hidden="true" :class="[ui('layer'), classes.layer]" :style="layerStyle"></div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseWatermark.style.scss'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseWatermark } from '../model/useBaseWatermark'
import type { BaseWatermarkProps, BaseWatermarkSlots } from '../types/BaseWatermark.types'

const props = withDefaults(
	defineProps<BaseWatermarkProps>(),
	kitDefaults('BaseWatermark', {
		width: 120,
		rotate: -22,
		gap: 64,
		opacity: 0.15,
		zIndex: 9,
		fontSize: 16,
		textColor: '#808080',
		isProtected: false,
	}),
)

defineSlots<BaseWatermarkSlots>()

const { ui, classes, rootRef, layerRef, layerStyle } = useBaseWatermark(props)
</script>

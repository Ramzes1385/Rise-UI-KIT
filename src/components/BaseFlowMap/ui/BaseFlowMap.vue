<template>
	<section
		class="base-flow-map"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rootStyle]"
		role="region"
		:aria-roledescription="UI_FLOW_MAP.ROLE"
		:aria-label="label" />
</template>

<script setup lang="ts">
import '../styles/BaseFlowMap.style.scss'
import { UI_FLOW_MAP } from '@/locales/messages'
import { useBaseFlowMap } from '../model/useBaseFlowMap'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFlowMapEmits, BaseFlowMapProps, BaseFlowMapSlots } from '../types/BaseFlowMap.types'

const props = withDefaults(
	defineProps<BaseFlowMapProps>(),
	kitDefaults('BaseFlowMap', {
		sizeScale: SIZE_SCALE_DEFAULT,
		notations: undefined,
		plugins: undefined,
		mode: 'view',
		modes: undefined,
		panels: undefined,
		scenario: undefined,
		isAutoplay: false,
		particles: 400,
		compactBreakpoint: 640,
		height: '560px',
		wheelZoom: 'ctrl',
		minZoom: 0.2,
		maxZoom: 3,
		isLoading: false,
		isDisabled: false,
	}),
)

const emit = defineEmits<BaseFlowMapEmits>()

defineSlots<BaseFlowMapSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, label, rootStyle } = useBaseFlowMap(props, emit)
</script>

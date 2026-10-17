<template>
	<section
		class="base-roadmap"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, customColorStyle]"
		:aria-label="ariaLabel ?? data.title"
		:aria-busy="isLoading || undefined"
		:aria-disabled="isDisabled || undefined"
		role="region">
		<slot name="empty" v-if="!data.stages.length" />
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseRoadmap.style.scss'
import { useBaseRoadmap } from '../model/useBaseRoadmap'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseRoadmapEmits, BaseRoadmapProps, BaseRoadmapSlots } from '../types/BaseRoadmap.types'

const props = withDefaults(defineProps<BaseRoadmapProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	storage: undefined,
	layout: 'path',
	narrowLayout: 'list',
	narrowWidth: 560,
	filter: 'all',
	hasSummary: true,
	hasFilter: true,
	hasLayoutSwitch: true,
	detailsPosition: 'auto',
})

const emit = defineEmits<BaseRoadmapEmits>()

defineSlots<BaseRoadmapSlots>()

const { sizeScaleStyle, variantClass, customColorStyle, classes } = useBaseRoadmap(props, emit)
</script>

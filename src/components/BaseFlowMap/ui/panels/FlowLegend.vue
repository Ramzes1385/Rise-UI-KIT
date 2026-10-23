<template>
	<section
		v-if="hasRows"
		class="base-flow-map__legend"
		:class="{ 'base-flow-map__legend--collapsed': !isOpen }"
		role="group"
		:aria-label="label">
		<button v-if="isCompact" type="button" class="base-flow-map__legend-toggle" :aria-expanded="isOpen" @click="toggle">
			<BaseIcon :name="isOpen ? 'chevron-down' : 'chevron-up'" />
			<span>{{ toggleLabel }}</span>
		</button>
		<div v-if="isOpen && $slots.legend" class="base-flow-map__legend-custom"><slot name="legend" :items="items" /></div>
		<ul v-else-if="isOpen" class="base-flow-map__legend-list">
			<li v-for="row in nodeRows" :key="row.id" class="base-flow-map__legend-row">
				<svg class="base-flow-map__legend-sample" width="24" height="14" viewBox="0 0 24 14" aria-hidden="true" focusable="false">
					<path
						class="base-flow-map__legend-shape"
						:class="{ 'base-flow-map__legend-shape--external': row.isExternal }"
						:d="shapePath(row.shape)" />
				</svg>
				<span>{{ row.label }}</span>
			</li>
			<li v-for="row in edgeRows" :key="row.id" class="base-flow-map__legend-row">
				<svg
					class="base-flow-map__legend-sample"
					:style="row.edge?.color ? { color: row.edge.color } : undefined"
					width="24"
					height="14"
					viewBox="0 0 24 14"
					aria-hidden="true"
					focusable="false">
					<path class="base-flow-map__legend-line" :d="edgeSample(row).line" :stroke-dasharray="edgeSample(row).dash" />
					<path
						v-for="(mark, index) in edgeSample(row).marks"
						:key="index"
						class="base-flow-map__legend-mark"
						:class="{ 'base-flow-map__legend-mark--filled': mark.isFilled }"
						:d="mark.path" />
				</svg>
				<span>{{ row.label }}</span>
			</li>
			<li v-for="row in statusRows" :key="row.id" class="base-flow-map__legend-row">
				<BaseIcon class="base-flow-map__legend-status" :name="row.status?.icon ?? 'info'" :style="{ color: row.status?.color }" />
				<span>{{ row.label }}</span>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { useFlowLegend } from '../../model/panels/useFlowLegend'
import { edgeSample, shapePath } from '../../model/panels/legendRows'
import type { FlowLegendItem } from '../../types/api/flowNotation.types'

defineSlots<{ legend?: (props: { items: FlowLegendItem[] }) => unknown }>()

const { isCompact, isOpen, hasRows, items, nodeRows, edgeRows, statusRows, toggle, label, toggleLabel } = useFlowLegend()
</script>

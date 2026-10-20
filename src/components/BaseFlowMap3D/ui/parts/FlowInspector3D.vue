<template>
	<section ref="rootRef" :class="className" :aria-label="UI_FLOW_MAP_3D.INSPECTOR" @click.stop @pointerdown.stop @keydown.stop>
		<div class="base-flow-map-3d__inspector-top">
			<div>
				<span class="base-flow-map-3d__eyebrow">{{ UI_FLOW_MAP_3D.INSPECTOR_EYEBROW }}</span>
				<b class="base-flow-map-3d__inspector-name">{{ title }}</b>
			</div>
			<div class="base-flow-map-3d__history">
				<BaseButton variant="ghost" :aria-label="UI_FLOW_MAP_3D.UNDO" :is-disabled="!history.canUndo" @click="$emit('undo')">
					<template #left><BaseIcon name="undo" /></template>
				</BaseButton>
				<BaseButton variant="ghost" :aria-label="UI_FLOW_MAP_3D.REDO" :is-disabled="!history.canRedo" @click="$emit('redo')">
					<template #left><BaseIcon name="redo" /></template>
				</BaseButton>
			</div>
		</div>
		<p class="base-flow-map-3d__history-line">{{ historyText }}</p>
		<template v-if="node">
			<label class="base-flow-map-3d__row">
				<span class="base-flow-map-3d__key">{{ UI_FLOW_MAP_3D.FIELD_NAME }}</span>
				<input
					class="base-flow-map-3d__field"
					:value="node.label"
					@change="$emit('rename', ($event.target as HTMLInputElement).value)" />
			</label>
			<div class="base-flow-map-3d__row">
				<span class="base-flow-map-3d__key">{{ UI_FLOW_MAP_3D.FIELD_TYPE }}</span>
				<span class="base-flow-map-3d__chips">
					<span class="base-flow-map-3d__chip">{{ kindLabel }}</span>
					<span v-if="groupLabel" class="base-flow-map-3d__chip">{{ groupLabel }}</span>
				</span>
			</div>
			<FlowInspector3DSection
				v-bind="{ node, modelTitle, modelKey, x, y }"
				has-swap
				@swap="$emit('swap')"
				@rotate="$emit('rotate')"
				@tint="$emit('tint', $event)"
				@scale="$emit('scale', $event)"
				@elevation="$emit('elevation', $event)" />
			<div class="base-flow-map-3d__row">
				<span class="base-flow-map-3d__key">{{ UI_FLOW_MAP_3D.FIELD_STATUS }}</span>
				<div class="base-flow-map-3d__segment" role="radiogroup" :aria-label="UI_FLOW_MAP_3D.FIELD_STATUS">
					<button
						v-for="option in statuses"
						:key="option.value"
						type="button"
						role="radio"
						class="base-flow-map-3d__segment-item"
						:aria-checked="status === option.value"
						@click="$emit('status', option.value)">
						<span class="base-flow-map-3d__tag-dot" :style="{ backgroundColor: option.color }" aria-hidden="true" />{{
							option.label
						}}
					</button>
				</div>
			</div>
		</template>
		<p v-else class="base-flow-map-3d__inspector-empty">{{ UI_FLOW_MAP_3D.INSPECTOR_EMPTY }}</p>
	</section>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import FlowInspector3DSection from './FlowInspector3DSection.vue'
import { useFlowInspector3D } from '../../model/edit/panels/useFlowInspector3D'
import type { FlowMap3DInspectorProps } from '../../types/internal/flowMap3dEdit.types'

const props = defineProps<FlowMap3DInspectorProps>()

defineEmits<{
	(event: 'swap' | 'rotate' | 'undo' | 'redo'): void
	(event: 'rename' | 'status', value: string): void
	(event: 'tint', value: string | null): void
	(event: 'scale' | 'elevation', value: number): void
}>()

const { title, historyText } = useFlowInspector3D(props)
</script>

<template>
	<section class="base-flow-map-3d__section" :aria-label="UI_FLOW_MAP_3D.SECTION_3D">
		<span class="base-flow-map-3d__eyebrow">{{ UI_FLOW_MAP_3D.SECTION_3D }}</span>
		<div class="base-flow-map-3d__row">
			<span class="base-flow-map-3d__key">{{ UI_FLOW_MAP_3D.FIELD_MODEL }}</span>
			<span class="base-flow-map-3d__model">
				<span class="base-flow-map-3d__model-text">
					<b>{{ modelTitle }}</b>
					<span class="base-flow-map-3d__mono">{{ formatMessage(UI_FLOW_MAP_3D.MODEL_KEY, { key: modelKey }) }}</span>
				</span>
				<BaseButton v-if="hasSwap" variant="ghost" @click="$emit('swap')">{{ UI_FLOW_MAP_3D.MODEL_REPLACE }}</BaseButton>
			</span>
		</div>
		<div class="base-flow-map-3d__row">
			<span class="base-flow-map-3d__key">{{ UI_FLOW_MAP_3D.FIELD_TINT }}</span>
			<div class="base-flow-map-3d__swatches" role="radiogroup" :aria-label="UI_FLOW_MAP_3D.TINT_GROUP">
				<button
					v-for="swatch in swatches"
					:key="swatch.value"
					type="button"
					role="radio"
					class="base-flow-map-3d__swatch"
					:style="{ backgroundColor: swatch.value }"
					:aria-checked="node.model3d?.tint === swatch.value"
					:aria-label="swatch.label"
					@click="$emit('tint', node.model3d?.tint === swatch.value ? null : swatch.value)" />
				<BaseColorPicker
					:model-value="customTint"
					is-presets-hidden
					is-resettable
					:aria-label="UI_FLOW_MAP_3D.TINT_CUSTOM"
					@update:model-value="$emit('tint', $event)"
					@reset="$emit('tint', null)" />
			</div>
		</div>
		<div class="base-flow-map-3d__row">
			<span class="base-flow-map-3d__key">{{ UI_FLOW_MAP_3D.FIELD_POSITION }}</span>
			<span class="base-flow-map-3d__pos">
				<span class="base-flow-map-3d__mono">{{ position }}</span>
				<BaseButton variant="ghost" @click="$emit('rotate')">{{ UI_FLOW_MAP_3D.POSITION_ROTATE }}</BaseButton>
			</span>
		</div>
		<div class="base-flow-map-3d__row base-flow-map-3d__row--pair">
			<BaseInputNumber
				:model-value="node.model3d?.scale ?? 1"
				:label="UI_FLOW_MAP_3D.FIELD_SCALE"
				:min="0.1"
				:step="0.1"
				@update:model-value="value => value !== null && value > 0 && $emit('scale', value)" />
			<BaseInputNumber
				:model-value="node.model3d?.elevation ?? 0"
				:label="UI_FLOW_MAP_3D.FIELD_ELEVATION"
				:min="0"
				:step="0.5"
				@update:model-value="value => value !== null && value >= 0 && $emit('elevation', value)" />
		</div>
	</section>
</template>

<script setup lang="ts">
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseColorPicker } from '@components/BaseColorPicker'
import { BaseInputNumber } from '@components/BaseInputNumber'
import type { FlowInspector3DSectionProps } from '../../types/internal/flowMap3dEdit.types'
import { useFlowInspector3DSection } from '../../model/edit/panels/useFlowInspector3DSection'

const props = defineProps<FlowInspector3DSectionProps>()

defineEmits<{
	(event: 'swap' | 'rotate'): void
	(event: 'tint', value: string | null): void
	(event: 'scale' | 'elevation', value: number): void
}>()

const { swatches, customTint, position } = useFlowInspector3DSection(props)
</script>

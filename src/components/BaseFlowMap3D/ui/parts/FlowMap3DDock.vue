<template>
	<div :class="className" role="toolbar" :aria-label="UI_FLOW_MAP_3D.DOCK">
		<BaseSegmented
			v-if="hasViewSwitch"
			:model-value="shownView"
			:options="viewOptions"
			:aria-label="UI_FLOW_MAP_3D.VIEW"
			@update:model-value="$emit('view', $event === '2d' ? '2d' : '3d')" />
		<template v-if="shownView === '3d'">
			<BaseButton variant="ghost" :aria-pressed="hasParticles" :aria-label="UI_FLOW_MAP_3D.PARTICLES" @click="$emit('particles')">
				<template #left><span class="base-flow-map-3d__particle" aria-hidden="true" /></template>
			</BaseButton>
			<BaseButton v-if="hasLayers" variant="ghost" :aria-pressed="isLayered" @click="$emit('layers')">
				<template #left><BaseIcon name="layers" /></template>
				{{ UI_FLOW_MAP_3D.LAYERS }}
			</BaseButton>
			<template v-if="hasCamera">
				<BaseButton
					v-for="item in presets"
					:key="item.value"
					variant="ghost"
					:aria-pressed="preset === item.value"
					:aria-label="item.label"
					@click="$emit('camera', item.value)">
					{{ item.text }}
				</BaseButton>
			</template>
		</template>
		<BaseButton v-if="hasEdit" variant="ghost" :aria-pressed="isEditing" @click="$emit('edit')">
			<template #left><BaseIcon name="edit" /></template>
			{{ UI_FLOW_MAP_3D.EDIT }}
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseSegmented } from '@components/BaseSegmented'
import type { FlowMap3DDockProps } from '../../types/internal/flowMap3dUi.types'

defineProps<FlowMap3DDockProps>()

defineEmits<{
	(event: 'view', value: '3d' | '2d'): void
	(event: 'camera', value: string): void
	(event: 'particles' | 'layers' | 'edit'): void
}>()
</script>

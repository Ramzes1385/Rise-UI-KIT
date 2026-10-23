<template>
	<div :class="className" role="group" :aria-label="UI_FLOW_MAP_3D.ZOOM">
		<BaseButton variant="ghost" :aria-label="UI_ARIA.ZOOM_IN" :is-disabled="isMax" is-focusable-when-disabled @click="$emit('in')">
			<template #left><BaseIcon name="plus" /></template>
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_ARIA.ZOOM_OUT" :is-disabled="isMin" is-focusable-when-disabled @click="$emit('out')">
			<template #left><BaseIcon name="minus" /></template>
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_SCENE_3D.RESET_CAMERA" @click="$emit('fit')">
			<template #left><BaseIcon name="crosshair" /></template>
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { UI_ARIA, UI_FLOW_MAP_3D, UI_SCENE_3D } from '@/locales/messages'
import type { FlowMap3DZoomProps } from '../../types/internal/flowMap3dUi.types'

defineProps<FlowMap3DZoomProps>()

defineEmits<(event: 'in' | 'out' | 'fit') => void>()
</script>

<template>
	<div :class="className" role="group" :aria-label="UI_ROADMAP_3D.TOUR">
		<span class="base-roadmap-3d__tour-text" aria-live="polite">{{ caption }}</span>
		<BaseButton variant="ghost" :aria-label="UI_ROADMAP_3D.PREV" :is-disabled="isFirst" @click="$emit('move', -1)">
			<template #left><BaseIcon name="skip-previous" /></template>
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_ROADMAP_3D.TOUR_STOP" @click="$emit('stop')">
			<template #left><BaseIcon name="stop" /></template>
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_ROADMAP_3D.NEXT" :is-disabled="isLast" @click="$emit('move', 1)">
			<template #left><BaseIcon name="skip-next" /></template>
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_ROADMAP_3D } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import type { RoadmapTourBarProps } from '../../types/internal/roadmap3dUi.types'

defineProps<RoadmapTourBarProps>()

defineEmits<{
	(event: 'move', delta: 1 | -1): void
	(event: 'stop'): void
}>()
</script>

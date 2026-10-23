<template>
	<div :class="className" role="toolbar" :aria-label="UI_SCENE_3D.CAMERA">
		<BaseButton variant="ghost" :aria-label="UI_SCENE_3D.ROTATE_QUARTER_LEFT" @click="$emit('rotate', -1)">
			<template #left><BaseIcon name="rotate-left" /></template>
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_SCENE_3D.ROTATE_QUARTER_RIGHT" @click="$emit('rotate', 1)">
			<template #left><BaseIcon name="rotate-right" /></template>
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_ARIA.ZOOM_IN" :is-disabled="isMax" is-focusable-when-disabled @click="$emit('zoom', 1)">
			<template #left><BaseIcon name="plus" /></template>
		</BaseButton>
		<BaseButton
			variant="ghost"
			:aria-label="UI_ARIA.ZOOM_OUT"
			:is-disabled="isMin"
			is-focusable-when-disabled
			@click="$emit('zoom', -1)">
			<template #left><BaseIcon name="minus" /></template>
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_ROADMAP_3D.OVERVIEW" @click="$emit('overview')">
			<template #left><BaseIcon name="home" /></template>
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_SCENE_3D.RESET_CAMERA" @click="$emit('reset')">
			<template #left><BaseIcon name="crosshair" /></template>
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { UI_ARIA, UI_ROADMAP_3D, UI_SCENE_3D } from '@/locales/messages'
import type { RoadmapToolbarProps } from '../../types/internal/roadmap3dUi.types'

defineProps<RoadmapToolbarProps>()

defineEmits<{
	(event: 'rotate', step: 1 | -1): void
	(event: 'zoom', direction: 1 | -1): void
	(event: 'overview' | 'reset'): void
}>()
</script>

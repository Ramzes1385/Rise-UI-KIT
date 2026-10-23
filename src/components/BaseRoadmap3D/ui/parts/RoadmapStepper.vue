<template>
	<div :class="className">
		<BaseButton v-if="hasNav" variant="ghost" class="base-roadmap-3d__nav-button" :is-disabled="isFirst" @click="$emit('go', -1)">
			<template #left><BaseIcon name="arrow-left" /></template>
			{{ UI_ROADMAP_3D.PREV }}
		</BaseButton>
		<ol class="base-roadmap-3d__steps" :aria-label="UI_ROADMAP_3D.STEPS">
			<li v-for="step in steps" :key="step.id" class="base-roadmap-3d__step-item">
				<button
					type="button"
					:class="[
						'base-roadmap-3d__step',
						`base-roadmap-3d__step--${step.status}`,
						{ 'base-roadmap-3d__step--focused': step.isFocused },
					]"
					:aria-label="step.label"
					:aria-current="step.isFocused ? 'step' : undefined"
					@click="$emit('select', step.id)">
					<BaseIcon v-if="step.status === 'done'" name="check" />
					<BaseIcon v-else-if="step.status === 'locked'" name="file-lock" />
					<span v-else>{{ step.n }}</span>
				</button>
			</li>
		</ol>
		<BaseButton v-if="hasNav" variant="ghost" class="base-roadmap-3d__nav-button" :is-disabled="isLast" @click="$emit('go', 1)">
			{{ UI_ROADMAP_3D.NEXT }}
			<template #right><BaseIcon name="arrow-right" /></template>
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_ROADMAP_3D } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import type { RoadmapStepperProps } from '../../types/internal/roadmap3dUi.types'

defineProps<RoadmapStepperProps>()

defineEmits<{
	(event: 'select', id: string): void
	(event: 'go', delta: 1 | -1): void
}>()
</script>

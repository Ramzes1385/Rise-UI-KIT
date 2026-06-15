<template>
	<div
		class="base-loader"
		:class="[`base-loader--${variant}`, { 'base-loader--overlay': isOverlay }, classes.root]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="status"
		aria-label="Загрузка">
		<div class="base-loader__animation" :class="classes.animation">
			<!-- Spinner -->
			<template v-if="variant === 'spinner'">
				<svg class="base-loader__spinner" :class="classes.spinner" viewBox="0 0 50 50">
					<circle class="base-loader__spinner-track" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
					<circle class="base-loader__spinner-fill" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
				</svg>
			</template>

			<!-- Dots -->
			<template v-if="variant === 'dots'">
				<span class="base-loader__dot"></span>
				<span class="base-loader__dot"></span>
				<span class="base-loader__dot"></span>
			</template>

			<!-- Pulse -->
			<template v-if="variant === 'pulse'">
				<span class="base-loader__pulse"></span>
			</template>

			<!-- Bars -->
			<template v-if="variant === 'bars'">
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
			</template>
		</div>

		<span v-if="hasLabel" class="base-loader__label" :class="classes.label">{{ label }}</span>
	</div>
</template>

<script setup lang="ts">
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { computed } from 'vue'
import '../styles/BaseLoader.style.scss'
import type { BaseLoaderProps } from '../model/BaseLoader.types'

const props = defineProps<BaseLoaderProps>()

const variant = computed(() => props.variant ?? 'spinner')
const hasLabel = computed(() => props.hasLabel ?? false)
const label = computed(() => props.label ?? 'Загрузка...')
const isOverlay = computed(() => props.isOverlay ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'animation', 'spinner', 'label'],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
</script>

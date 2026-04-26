<template>
	<div
		class="base-loader"
		:class="[`base-loader--${variant}`, `base-loader--${size}`, { 'base-loader--overlay': isOverlay }]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="status"
		aria-label="Загрузка">
		<div class="base-loader__animation">
			<!-- Spinner -->
			<template v-if="variant === 'spinner'">
				<svg class="base-loader__spinner" viewBox="0 0 50 50">
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

		<span v-if="hasLabel" class="base-loader__label">{{ label }}</span>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import './BaseLoader.style.scss'
import type { BaseLoaderProps } from './BaseLoader.types'

const props = withDefaults(defineProps<BaseLoaderProps>(), {
	variant: 'spinner',
	size: 'md',
	hasLabel: false,
	label: 'Загрузка...',
	isOverlay: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
</script>

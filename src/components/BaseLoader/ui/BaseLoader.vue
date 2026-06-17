<template>
	<div
		class="base-loader"
		:class="[`base-loader--${props.variant}`, { 'base-loader--overlay': props.isOverlay }, classes.root]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="status"
		:aria-label="UI_TEXT.LOADING_ARIA">
		<div class="base-loader__animation" :class="classes.animation">
			<!-- Spinner -->
			<template v-if="props.variant === 'spinner'">
				<svg class="base-loader__spinner" :class="classes.spinner" viewBox="0 0 50 50">
					<circle class="base-loader__spinner-track" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
					<circle class="base-loader__spinner-fill" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
				</svg>
			</template>

			<!-- Dots -->
			<template v-if="props.variant === 'dots'">
				<span class="base-loader__dot"></span>
				<span class="base-loader__dot"></span>
				<span class="base-loader__dot"></span>
			</template>

			<!-- Pulse -->
			<template v-if="props.variant === 'pulse'">
				<span class="base-loader__pulse"></span>
			</template>

			<!-- Bars -->
			<template v-if="props.variant === 'bars'">
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
			</template>
		</div>

		<span v-if="props.hasLabel" class="base-loader__label" :class="classes.label">{{ props.label }}</span>
	</div>
</template>

<script setup lang="ts">
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { UI_TEXT } from '@constants'
import '../styles/BaseLoader.style.scss'
import type { BaseLoaderProps } from '../model/BaseLoader.types'

const props = withDefaults(defineProps<BaseLoaderProps>(), {
	variant: 'spinner',
	hasLabel: false,
	label: UI_TEXT.LOADING,
	isOverlay: false,
	sizeScale: 100,
})
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'animation', 'spinner', 'label'],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
</script>

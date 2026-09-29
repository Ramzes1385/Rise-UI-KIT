<template>
	<div
		class="base-loader"
		:class="[`base-loader--${variant}`, { 'base-loader--overlay': isOverlay }, classes.root]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="status"
		:aria-label="accessibleName">
		<div class="base-loader__animation" :class="classes.animation" aria-hidden="true">
			<template v-if="variant === 'spinner'">
				<svg class="base-loader__spinner" :class="classes.spinner" viewBox="0 0 50 50">
					<circle class="base-loader__spinner-track" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
					<circle class="base-loader__spinner-fill" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
				</svg>
			</template>

			<template v-if="variant === 'dots'">
				<span class="base-loader__dot"></span>
				<span class="base-loader__dot"></span>
				<span class="base-loader__dot"></span>
			</template>

			<template v-if="variant === 'pulse'">
				<span class="base-loader__pulse"></span>
			</template>

			<template v-if="variant === 'bars'">
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
				<span class="base-loader__bar"></span>
			</template>
		</div>

		<span v-if="hasLabel" class="base-loader__label" :class="classes.label">{{ resolvedLabel }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseLoader.style.scss'
import { useBaseLoader } from '../model/useBaseLoader'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseLoaderProps } from '../types/BaseLoader.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseLoaderProps>(),
	kitDefaults('BaseLoader', {
		variant: 'spinner',
		hasLabel: false,
		isOverlay: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const { classes, sizeScaleStyle, customColorStyle, resolvedLabel, accessibleName } = useBaseLoader(props)
</script>

<template>
	<div
		ref="rootRef"
		:class="[ui('root'), `base-loader--${variant}`, { 'base-loader--overlay': isOverlay }, classes.root]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="status"
		:aria-label="accessibleName">
		<div :class="[ui('animation'), classes.animation]" aria-hidden="true">
			<template v-if="variant === 'spinner'">
				<svg :class="[ui('spinner'), classes.spinner]" viewBox="0 0 50 50">
					<circle :class="ui('spinner-track')" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
					<circle :class="ui('spinner-fill')" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
				</svg>
			</template>

			<template v-if="variant === 'dots'">
				<span :class="ui('dot')"></span>
				<span :class="ui('dot')"></span>
				<span :class="ui('dot')"></span>
			</template>

			<template v-if="variant === 'pulse'">
				<span :class="ui('pulse')"></span>
			</template>

			<template v-if="variant === 'bars'">
				<span :class="ui('bar')"></span>
				<span :class="ui('bar')"></span>
				<span :class="ui('bar')"></span>
				<span :class="ui('bar')"></span>
			</template>
		</div>

		<span v-if="hasLabel" :class="[ui('label'), classes.label]" aria-hidden="true">{{ resolvedLabel }}</span>
		<span :class="ui('announce')">{{ isAnnounced ? accessibleName : '' }}</span>
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

const { ui, classes, sizeScaleStyle, customColorStyle, resolvedLabel, accessibleName, isAnnounced, rootRef } = useBaseLoader(props)
</script>

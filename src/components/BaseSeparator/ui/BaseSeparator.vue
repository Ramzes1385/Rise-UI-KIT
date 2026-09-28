<template>
	<div
		class="base-separator"
		:style="[thicknessStyle, sizeScaleStyle, customColorStyle]"
		:class="[
			`base-separator--${orientation}`,
			{
				'base-separator--dashed': isDashed,
				'base-separator--with-content': label || $slots.default,
			},
			classes.root,
		]"
		role="separator"
		:aria-orientation="orientation"
		:aria-labelledby="label || $slots.default ? contentId : undefined">
		<template v-if="!label && !$slots.default">
			<div class="base-separator__line" :class="classes.line"></div>
		</template>

		<template v-if="label || $slots.default">
			<div class="base-separator__line base-separator__line--before" :class="classes.line"></div>
			<span :id="contentId" class="base-separator__content" :style="spacingStyle" :class="classes.content">
				<slot>{{ label }}</slot>
			</span>
			<div class="base-separator__line base-separator__line--after" :class="classes.line"></div>
		</template>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSeparator.style.scss'
import { kitDefaults } from '@composables/useDefaults'
import { useBaseSeparator } from '../model/useBaseSeparator'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseSeparatorProps, BaseSeparatorSlots } from '../types/BaseSeparator.types'

const props = withDefaults(
	defineProps<BaseSeparatorProps>(),
	kitDefaults('BaseSeparator', {
		orientation: 'horizontal',
		thickness: 1,
		isDashed: false,
		spacing: undefined,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
defineSlots<BaseSeparatorSlots>()

const { classes, sizeScaleStyle, customColorStyle, contentId, spacingStyle, thicknessStyle } = useBaseSeparator(props)
</script>

<template>
	<div
		:style="[rootStyle, sizeScaleStyle, customColorStyle]"
		:class="[
			ui('root'),
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
			<div :class="[ui('line'), classes.line]"></div>
		</template>

		<template v-if="label || $slots.default">
			<div :class="[ui('line'), 'base-separator__line--before', classes.line]"></div>
			<span :id="contentId" :class="[ui('content'), classes.content]" :style="spacingStyle">
				<slot>{{ label }}</slot>
			</span>
			<div :class="[ui('line'), 'base-separator__line--after', classes.line]"></div>
		</template>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSeparator.style.scss'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseSeparator } from '../model/useBaseSeparator'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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

const { ui, classes, sizeScaleStyle, customColorStyle, contentId, spacingStyle, rootStyle } = useBaseSeparator(props)
</script>

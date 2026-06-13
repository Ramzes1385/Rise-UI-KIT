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
		:role="orientation === 'horizontal' ? 'separator' : undefined"
		:aria-orientation="orientation">
		<!-- Линия без контента -->
		<template v-if="!label && !$slots.default">
			<div class="base-separator__line" :class="classes.line"></div>
		</template>

		<!-- Линия с контентом (метка или слот) -->
		<template v-if="label || $slots.default">
			<div class="base-separator__line base-separator__line--before" :class="classes.line"></div>
			<span class="base-separator__content" :style="spacingStyle" :class="classes.content">
				<slot>{{ label }}</slot>
			</span>
			<div class="base-separator__line base-separator__line--after" :class="classes.line"></div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'

import './BaseSeparator.style.scss'

import type { BaseSeparatorProps } from './BaseSeparator.types'

const props = defineProps<BaseSeparatorProps>()

const orientation = computed(() => props.orientation ?? 'horizontal')
const thickness = computed(() => props.thickness ?? 1)
const isDashed = computed(() => props.isDashed ?? false)
const spacing = computed(() => props.spacing ?? 10)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'line', 'content'],
})

/** Стиль spacing на контенте: Y = значение, X = значение * 2 */
const spacingStyle = computed(() => ({
	'--sep-pad-y': `${spacing.value}px`,
	'--sep-pad-x': `${spacing.value * 2}px`,
}))

/** Стиль толщины линии */
const thicknessStyle = computed(() => ({
	'--sep-thickness': `${thickness.value}px`,
}))
</script>

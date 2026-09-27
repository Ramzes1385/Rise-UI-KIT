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
		<!-- Линия без контента -->
		<template v-if="!label && !$slots.default">
			<div class="base-separator__line" :class="classes.line"></div>
		</template>

		<!-- Линия с контентом (метка или слот) -->
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
import { computed, useId } from 'vue'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { kitDefaults } from '@composables/useDefaults'
import { useSizeScale } from '@composables/useSizeScale'
import '../styles/BaseSeparator.style.scss'

import { SIZE_SCALE_DEFAULT } from '@constants'
import type { BaseSeparatorProps, BaseSeparatorSlots } from '../model/BaseSeparator.types'

const props = withDefaults(defineProps<BaseSeparatorProps>(), kitDefaults('BaseSeparator', {
	orientation: 'horizontal',
	thickness: 1,
	isDashed: false,
	spacing: undefined,
	sizeScale: SIZE_SCALE_DEFAULT,
}))
defineSlots<BaseSeparatorSlots>()
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'line', 'content'],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

/**
 * Потомки role="separator" презентационные (ARIA: Children Presentational), поэтому метка
 * внутри разделителя сама по себе не озвучивается — имя берётся из неё через aria-labelledby.
 * useId() стабилен между SSR и гидратацией.
 */
const contentId = useId()

/** Без пропа spacing отступы подписи берутся из стилей (0 12px); inline-переменные пишутся только для явного значения. */
const spacingStyle = computed(() => {
	if (props.spacing === undefined) return undefined
	return {
		'--sep-pad-y': `${props.spacing}px`,
		'--sep-pad-x': `${props.spacing * 2}px`,
	}
})

const thicknessStyle = computed(() => ({
	'--sep-thickness': `${props.thickness}px`,
}))
</script>

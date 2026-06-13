<template>
	<component
		:is="tag"
		class="base-text"
		:class="[modifierClasses, classes.root]"
		:style="[sizeScaleStyle, weightStyle, customColorStyle, maxLinesStyle]">
		<slot />
	</component>
</template>

<script setup lang="ts">
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { computed } from 'vue'
import './BaseText.style.scss'
import type { BaseTextProps } from './BaseText.types'

const props = defineProps<BaseTextProps>()

const tag = computed(() => props.tag ?? 'p')
const weight = computed(() => props.weight ?? 400)
const nowrap = computed(() => props.nowrap ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)
const truncate = computed(() => props.truncate ?? false)
const maxLines = computed(() => props.maxLines ?? 1)

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root'],
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

/** Инлайн-стиль для начертания */
const weightStyle = computed(() => ({
	fontWeight: weight.value,
}))

/** Инлайн-стиль для ограничения строк */
const maxLinesStyle = computed(() => {
	if (!truncate.value) return {}
	if (maxLines.value > 1) {
		return {
			display: '-webkit-box',
			WebkitLineClamp: maxLines.value,
			WebkitBoxOrient: 'vertical',
			overflow: 'hidden',
		}
	}
	return {}
})

/** Классы-модификаторы по БЭМ */
const modifierClasses = computed(() => [
	{ 'base-text--nowrap': nowrap.value },
	{ 'base-text--truncate': truncate.value && maxLines.value <= 1 },
])
</script>

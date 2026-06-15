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
import '../styles/BaseText.style.scss'
import type { BaseTextProps } from '../model/BaseText.types'

const props = defineProps<BaseTextProps>()

const tag = computed(() => props.tag ?? 'p')
const weight = computed(() => props.weight ?? 400)
const nowrap = computed(() => props.nowrap ?? false)
const truncate = computed(() => props.truncate ?? false)
const maxLines = computed(() => props.maxLines ?? 1)

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root'],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale ?? 100 })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const weightStyle = computed(() => ({
	fontWeight: weight.value,
}))

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

const modifierClasses = computed(() => [
	{ 'base-text--nowrap': nowrap.value },
	{ 'base-text--truncate': truncate.value && maxLines.value <= 1 },
])
</script>

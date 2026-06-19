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
import { computed } from 'vue'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import '../styles/BaseText.style.scss'
import { SIZE_SCALE_DEFAULT } from '@constants'
import type { BaseTextProps, BaseTextSlots } from '../model/BaseText.types'

const props = withDefaults(defineProps<BaseTextProps>(), {
	tag: 'p',
	weight: 400,
	nowrap: false,
	truncate: false,
	maxLines: 1,
	sizeScale: SIZE_SCALE_DEFAULT,
})
defineSlots<BaseTextSlots>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root'],
})
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const weightStyle = computed(() => ({
	fontWeight: props.weight,
}))

const maxLinesStyle = computed(() => {
	if (!props.truncate) return {}
	if (props.maxLines > 1) {
		return {
			display: '-webkit-box',
			WebkitLineClamp: props.maxLines,
			WebkitBoxOrient: 'vertical',
			overflow: 'hidden',
		}
	}
	return {}
})

const modifierClasses = computed(() => [
	{ 'base-text--nowrap': props.nowrap },
	{ 'base-text--truncate': props.truncate && props.maxLines <= 1 },
])
</script>

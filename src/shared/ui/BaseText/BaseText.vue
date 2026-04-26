<template>
	<component
		:is="tag"
		class="base-text"
		:class="modifierClasses"
		:style="[sizeScaleStyle, weightStyle, customColorStyle, maxLinesStyle]">
		<slot />
	</component>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { computed } from 'vue'
import './BaseText.style.scss'
import type { BaseTextProps } from './BaseText.types'

const props = withDefaults(defineProps<BaseTextProps>(), {
	tag: 'p',
	weight: 400,
	nowrap: false,
	sizeScale: 100,
	truncate: false,
	maxLines: 1,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

/** Инлайн-стиль для начертания */
const weightStyle = computed(() => ({
	fontWeight: props.weight,
}))

/** Инлайн-стиль для ограничения строк */
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

/** Классы-модификаторы по БЭМ */
const modifierClasses = computed(() => [
	{ 'base-text--nowrap': props.nowrap },
	{ 'base-text--truncate': props.truncate && props.maxLines <= 1 },
])
</script>

<template>
	<component
		:is="tag"
		:class="[ui('root'), modifierClasses, classes.root]"
		:style="[sizeScaleStyle, weightStyle, customColorStyle, maxLinesStyle]">
		<slot />
	</component>
</template>

<script setup lang="ts">
import '../styles/BaseText.style.scss'
import { useBaseText } from '../model/useBaseText'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseTextProps, BaseTextSlots } from '../types/BaseText.types'

const props = withDefaults(
	defineProps<BaseTextProps>(),
	kitDefaults('BaseText', {
		tag: 'p',
		weight: undefined,
		nowrap: false,
		truncate: false,
		maxLines: 1,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
defineSlots<BaseTextSlots>()

const { ui, classes, sizeScaleStyle, customColorStyle, weightStyle, maxLinesStyle, modifierClasses } = useBaseText(props)
</script>

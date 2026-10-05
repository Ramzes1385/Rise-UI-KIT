<template>
	<component
		:is="isLink ? BaseLink : 'button'"
		:class="[
			ui('root'),
			variantClass,
			`base-fab--${position}`,
			{ 'base-fab--extended': isExtended, 'base-fab--contained': isContained, 'base-fab--disabled': isDisabled },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		v-bind="elementProps"
		:aria-label="isExtended ? undefined : label"
		@click="emit('click', $event)">
		<BaseIcon :name="icon" :class="ui('icon')" :custom-class="classes.icon" :size-scale="calcIconScale('md', sizeScale)" />
		<span v-if="isExtended" :class="[ui('label'), classes.label]">{{ label }}</span>
	</component>
</template>

<script setup lang="ts">
import '@components/BaseLink/styles/BaseLink.style.scss'
import '../styles/BaseFab.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { useBaseFab } from '../model/useBaseFab'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseFabEmits, BaseFabProps } from '../types/BaseFab.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseFabProps>(),
	kitDefaults('BaseFab', {
		variant: DEFAULT_VARIANT,
		icon: 'plus',
		isExtended: false,
		position: 'bottom-right',
		isContained: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseFabEmits>()

const { ui, sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, isLink, elementProps } = useBaseFab(props)
</script>

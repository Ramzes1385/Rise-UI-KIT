<template>
	<div
		:class="[ui('root'), `base-button-group--${orientation}`, classes.root]"
		:style="[sizeScaleStyle]"
		role="group"
		:aria-label="ariaLabel">
		<slot />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseButtonGroup.style.scss'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseButtonGroup } from '../model/useBaseButtonGroup'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseButtonGroupProps, BaseButtonGroupSlots } from '../types/BaseButtonGroup.types'

const props = withDefaults(
	defineProps<BaseButtonGroupProps>(),
	kitDefaults('BaseButtonGroup', {
		variant: DEFAULT_VARIANT,
		orientation: 'horizontal',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseButtonGroupSlots>()

const { ui, sizeScaleStyle, classes } = useBaseButtonGroup(props)
</script>

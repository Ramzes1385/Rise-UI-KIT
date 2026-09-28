<template>
	<!-- Склеенные кнопки: общие углы, рамки соседей совпадают; группа с именем для скринридера -->
	<div
		class="base-button-group"
		:class="[`base-button-group--${orientation}`, classes.root]"
		:style="[sizeScaleStyle]"
		role="group"
		:aria-label="ariaLabel">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseButtonGroup } from '../model/useBaseButtonGroup'
import '../styles/BaseButtonGroup.style.scss'
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

const { sizeScaleStyle, classes } = useBaseButtonGroup(props)
</script>

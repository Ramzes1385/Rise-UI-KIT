<template>
	<!-- Контейнер страницы: ограничивает ширину содержимого, центрирует его и даёт боковые отступы -->
	<component :is="tag" class="base-container" :class="[`base-container--${size}`, classes.root]" :style="sizeScaleStyle">
		<slot />
	</component>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseContainer.style.scss'
import type { BaseContainerProps, BaseContainerSlots } from '../model/BaseContainer.types'

const props = withDefaults(
	defineProps<BaseContainerProps>(),
	kitDefaults('BaseContainer', {
		variant: DEFAULT_VARIANT,
		size: 'xl',
		tag: 'div',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseContainerSlots>()

const { sizeScaleStyle, classes } = useStandardBaseComponent('base-container', props, ['root'])
</script>

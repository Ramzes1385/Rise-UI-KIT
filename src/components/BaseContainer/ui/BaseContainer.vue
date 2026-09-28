<template>
	<!-- Контейнер страницы: ограничивает ширину содержимого, центрирует его и даёт боковые отступы -->
	<component :is="tag" class="base-container" :class="[`base-container--${size}`, classes.root]" :style="sizeScaleStyle">
		<slot />
	</component>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseContainer } from '../model/useBaseContainer'
import '../styles/BaseContainer.style.scss'
import type { BaseContainerProps, BaseContainerSlots } from '../types/BaseContainer.types'

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

const { sizeScaleStyle, classes } = useBaseContainer(props)
</script>

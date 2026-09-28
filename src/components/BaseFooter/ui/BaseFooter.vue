<template>
	<!-- Подвал сайта или приложения (<footer> — ориентир contentinfo): начало, середина и конец; на узком экране — столбиком -->
	<footer class="base-footer" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseContainer :size="containerSize" class="base-footer__inner" :custom-class="{ root: classes.inner }" :size-scale="sizeScale">
			<div v-if="slots.start" class="base-footer__start">
				<slot name="start" />
			</div>
			<div v-if="slots.default" class="base-footer__center">
				<slot />
			</div>
			<div v-if="slots.end" class="base-footer__end">
				<slot name="end" />
			</div>
		</BaseContainer>
	</footer>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'
import { kitDefaults } from '@composables/useDefaults'
import { BaseContainer } from '@components/BaseContainer'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseFooter.style.scss'
import type { BaseFooterProps, BaseFooterSlots } from '../types/BaseFooter.types'

const props = withDefaults(
	defineProps<BaseFooterProps>(),
	kitDefaults('BaseFooter', {
		variant: DEFAULT_VARIANT,
		containerSize: 'full',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseFooterSlots>()
const slots = useSlots()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-footer', props, [
	'root',
	'inner',
])
</script>

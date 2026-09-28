<template>
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
import '../styles/BaseFooter.style.scss'
import { useBaseFooter } from '../model/useBaseFooter'
import { kitDefaults } from '@composables/useDefaults'
import { BaseContainer } from '@components/BaseContainer'
import type { BaseFooterProps, BaseFooterSlots } from '../types/BaseFooter.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'

const props = withDefaults(
	defineProps<BaseFooterProps>(),
	kitDefaults('BaseFooter', {
		variant: DEFAULT_VARIANT,
		containerSize: 'full',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseFooterSlots>()
const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, slots } = useBaseFooter(props)
</script>

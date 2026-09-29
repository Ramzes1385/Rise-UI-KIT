<template>
	<component
		:is="link.is"
		class="base-link"
		:class="[variantClass, { 'base-link--disabled': !link.hasTarget }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		v-bind="link.attrs"
		@click="handleClick">
		<slot>{{ label }}</slot>
		<span v-if="isNewTab" class="base-link__external" :class="classes.external">
			<span aria-hidden="true">↗</span>
			<span class="base-link__hint"> {{ UI_ARIA.OPENS_IN_NEW_TAB }}</span>
		</span>
	</component>
</template>

<script setup lang="ts">
import '../styles/BaseLink.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { useBaseLink } from '../model/useBaseLink'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseLinkEmits, BaseLinkProps, BaseLinkSlots } from '../types/BaseLink.types'

const props = withDefaults(
	defineProps<BaseLinkProps>(),
	kitDefaults('BaseLink', {
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
		isDisabled: false,
	}),
)

const emit = defineEmits<BaseLinkEmits>()
defineSlots<BaseLinkSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, link, isNewTab, handleClick } = useBaseLink(props, emit)
</script>

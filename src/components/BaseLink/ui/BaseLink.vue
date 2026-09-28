<template>
	<component
		:is="link.is"
		class="base-link"
		:class="[variantClass, { 'base-link--disabled': !link.hasTarget }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		v-bind="link.attrs"
		@click="handleClick">
		<slot>{{ label }}</slot>
		<!-- Ссылка в новой вкладке: скринридер предупреждает об этом, зрячие видят стрелку -->
		<span v-if="isNewTab" class="base-link__external" :class="classes.external">
			<span aria-hidden="true">↗</span>
			<span class="base-link__hint"> {{ UI_ARIA.OPENS_IN_NEW_TAB }}</span>
		</span>
	</component>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseLink } from '../model/useBaseLink'
import '../styles/BaseLink.style.scss'
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

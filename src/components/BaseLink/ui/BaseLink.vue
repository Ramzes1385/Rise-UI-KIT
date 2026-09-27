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
import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { resolveLink, useLinkComponent } from '@composables/useLink'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, UI_ARIA } from '@constants'
import '../styles/BaseLink.style.scss'
import type { BaseLinkEmits, BaseLinkProps, BaseLinkSlots } from '../model/BaseLink.types'

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

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-link', props, ['root', 'external'])

/** Компонент ссылок приложения: проп, плагин или RouterLink — определяется один раз */
const appLinkComponent = useLinkComponent()

const link = computed(() =>
	resolveLink(
		{ to: props.to, href: props.href, target: props.target, rel: props.rel, isDisabled: props.isDisabled },
		props.linkComponent ?? appLinkComponent,
	),
)

const isNewTab = computed(() => link.value.hasTarget && props.target === '_blank')

function handleClick(event: MouseEvent): void {
	if (!link.value.hasTarget) {
		event.preventDefault()
		return
	}
	emit('click', event)
}
</script>

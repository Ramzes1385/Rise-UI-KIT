<template>
	<!-- Плавающая кнопка главного действия страницы: круглая с иконкой (имя — aria-label) или широкая с подписью -->
	<component
		:is="isLink ? BaseLink : 'button'"
		class="base-fab"
		:class="[
			variantClass,
			`base-fab--${position}`,
			{ 'base-fab--extended': isExtended, 'base-fab--contained': isContained, 'base-fab--disabled': isDisabled },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		v-bind="elementProps"
		:aria-label="isExtended ? undefined : label"
		@click="emit('click', $event)">
		<BaseIcon :name="icon" class="base-fab__icon" :custom-class="classes.icon" :size-scale="calcIconScale('md', sizeScale)" />
		<span v-if="isExtended" class="base-fab__label" :class="classes.label">{{ label }}</span>
	</component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { calcIconScale } from '@utils/iconUtils'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseFab.style.scss'
import type { BaseFabEmits, BaseFabProps } from '../model/BaseFab.types'

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

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-fab', props, [
	'root',
	'icon',
	'label',
])

const isLink = computed(() => Boolean(props.to || props.href))

/** Ссылка: адрес и отключение BaseLink; кнопка: type и disabled */
const elementProps = computed(() =>
	isLink.value
		? { to: props.to, href: props.href, isDisabled: props.isDisabled }
		: { type: 'button', disabled: props.isDisabled || undefined },
)
</script>

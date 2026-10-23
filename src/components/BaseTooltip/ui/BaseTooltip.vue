<template>
	<TooltipRoot
		:is-wrapperless="isWrapperless"
		:wrapper-class="[ui('root'), classes.root]"
		:handlers="handlers"
		:described-by="describedBy"
		:set-element="setWrapper">
		<template #trigger>
			<slot :trigger-props="triggerAttributes" />
		</template>
		<template #popup>
			<Teleport defer :to="teleportTarget">
				<Transition name="base-tooltip">
					<div
						v-if="isShown"
						:id="tooltipId"
						ref="popupRef"
						:class="[ui('popup'), `base-tooltip-popup--${placement}`, animationClass, variantClass, classes.tooltip]"
						:style="[tooltipStyle, sizeScaleStyle, variantStyle, customColorStyle]"
						v-bind="inheritedTheme"
						role="tooltip"
						@mouseenter="cancelHide"
						@mouseleave="handleLeave">
						<BaseText tag="span" :class="ui('text')" :custom-class="classes.text">{{ text }}</BaseText>
					</div>
				</Transition>
			</Teleport>
		</template>
	</TooltipRoot>
</template>

<script setup lang="ts">
import '../styles/BaseTooltip.style.scss'
import { BaseText } from '@components/BaseText'
import { TooltipRoot } from '../model/TooltipRoot'
import { useBaseTooltip } from '../model/useBaseTooltip'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseTooltipProps, BaseTooltipSlots } from '../types/BaseTooltip.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseTooltipProps>(),
	kitDefaults('BaseTooltip', {
		variant: DEFAULT_VARIANT,
		position: 'top',
		isAlwaysVisible: false,
		isWrapperless: false,
		sizeScale: SIZE_SCALE_DEFAULT,
		animation: 'fade',
	}),
)
defineSlots<BaseTooltipSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	teleportTarget,
	isShown,
	setWrapper,
	popupRef,
	inheritedTheme,
	tooltipId,
	triggerAttributes,
	handlers,
	describedBy,
	isWrapperless,
	placement,
	tooltipStyle,
	handleLeave,
	cancelHide,
	ui,
	animationClass,
} = useBaseTooltip(props)
</script>

<template>
	<span
		ref="wrapperRef"
		class="base-tooltip"
		:class="classes.root"
		@mouseenter="handleEnter"
		@mouseleave="handleLeave"
		@focusin="handleEnter"
		@focusout="handleLeave">
		<slot :trigger-props="triggerAttributes" />

		<Teleport defer :to="teleportTarget">
			<Transition name="base-tooltip">
				<div
					v-if="isShown"
					:id="tooltipId"
					ref="popupRef"
					class="base-tooltip-popup"
					:class="[`base-tooltip-popup--${placement}`, variantClass, classes.tooltip]"
					:style="[tooltipStyle, sizeScaleStyle, variantStyle, customColorStyle]"
					:data-theme="inheritedTheme"
					role="tooltip"
					@mouseenter="cancelHide"
					@mouseleave="handleLeave">
					<BaseText tag="span" :custom-class="classes.text">{{ text }}</BaseText>
				</div>
			</Transition>
		</Teleport>
	</span>
</template>

<script setup lang="ts">
import '../styles/BaseTooltip.style.scss'
import { BaseText } from '@components/BaseText'
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
		sizeScale: SIZE_SCALE_DEFAULT,
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
	wrapperRef,
	popupRef,
	inheritedTheme,
	tooltipId,
	triggerAttributes,
	placement,
	tooltipStyle,
	handleEnter,
	handleLeave,
	cancelHide,
} = useBaseTooltip(props)
</script>

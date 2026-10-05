<template>
	<div
		class="base-countdown"
		:class="[variantClass, `base-countdown--${layout}`, digitClasses, { 'base-countdown--finished': parts.isFinished }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="timer"
		:aria-live="isLive ? 'polite' : 'off'"
		aria-atomic="true">
		<div v-if="parts.isFinished && $slots.finished" class="base-countdown__finished">
			<slot name="finished" />
		</div>
		<template v-else>
			<span class="base-countdown__spoken">{{ spoken }}</span>
			<div class="base-countdown__display" aria-hidden="true">
				<slot v-bind="parts">
					<span v-if="layout === 'inline'" class="base-countdown__clock" :class="classes.value">
						<CountdownDigits :text="clock" :digits="clockDigits" :animation="digitAnimation" />
					</span>
					<template v-else>
						<span v-for="cell in cells" :key="cell.unit" class="base-countdown__unit" :class="classes.unit">
							<span class="base-countdown__value" :class="classes.value">
								<CountdownDigits :text="cell.value" :digits="cell.digits" :animation="digitAnimation" />
							</span>
							<span class="base-countdown__caption" :class="classes.caption">{{ cell.caption }}</span>
						</span>
					</template>
				</slot>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseCountdown.style.scss'
import CountdownDigits from './CountdownDigits.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseCountdown } from '../model/useBaseCountdown'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCountdownEmits, BaseCountdownProps, BaseCountdownSlots } from '../types/BaseCountdown.types'

const props = withDefaults(
	defineProps<BaseCountdownProps>(),
	kitDefaults('BaseCountdown', {
		variant: DEFAULT_VARIANT,
		format: undefined,
		layout: 'blocks',
		label: undefined,
		isLive: false,
		digitAnimation: 'roll',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCountdownEmits>()

defineSlots<BaseCountdownSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	digitClasses,
	digitAnimation,
	parts,
	cells,
	clock,
	clockDigits,
	spoken,
} = useBaseCountdown(props, emit)
</script>

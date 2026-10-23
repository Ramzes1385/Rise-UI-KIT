<template>
	<div
		:class="[
			ui('root'),
			variantClass,
			`base-countdown--${layout}`,
			digitClasses,
			{ 'base-countdown--finished': parts.isFinished },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="timer"
		:aria-live="isLive ? 'polite' : 'off'"
		aria-atomic="true">
		<div v-if="parts.isFinished && $slots.finished" :class="ui('finished')">
			<slot name="finished" />
		</div>
		<template v-else>
			<span :class="ui('spoken')">{{ spoken }}</span>
			<div :class="ui('display')" aria-hidden="true">
				<slot v-bind="parts">
					<span v-if="layout === 'inline'" :class="[ui('clock'), classes.value]">
						<CountdownDigits :text="clock" :digits="clockDigits" :animation="digitAnimation" :ui="ui" />
					</span>
					<template v-else>
						<span v-for="cell in cells" :key="cell.unit" :class="[ui('unit'), classes.unit]">
							<span :class="[ui('value'), classes.value]">
								<CountdownDigits :text="cell.value" :digits="cell.digits" :animation="digitAnimation" :ui="ui" />
							</span>
							<span :class="[ui('caption'), classes.caption]">{{ cell.caption }}</span>
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
	ui,
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

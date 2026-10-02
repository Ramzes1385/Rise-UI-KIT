<template>
	<div
		class="base-countdown"
		:class="[variantClass, `base-countdown--${layout}`, { 'base-countdown--finished': parts.isFinished }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="timer"
		:aria-live="isLive ? 'polite' : 'off'"
		aria-atomic="true">
		<span class="base-countdown__spoken">{{ spoken }}</span>
		<div v-if="parts.isFinished && $slots.finished" class="base-countdown__finished" aria-hidden="true">
			<slot name="finished" />
		</div>
		<div v-else class="base-countdown__display" aria-hidden="true">
			<slot v-bind="parts">
				<span v-if="layout === 'inline'" class="base-countdown__clock" :class="classes.value">{{ clock }}</span>
				<template v-else>
					<span v-for="cell in cells" :key="cell.unit" class="base-countdown__unit" :class="classes.unit">
						<span class="base-countdown__value" :class="classes.value">{{ cell.value }}</span>
						<span class="base-countdown__caption" :class="classes.caption">{{ cell.caption }}</span>
					</span>
				</template>
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseCountdown.style.scss'
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
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCountdownEmits>()

defineSlots<BaseCountdownSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, parts, cells, clock, spoken } = useBaseCountdown(props, emit)
</script>

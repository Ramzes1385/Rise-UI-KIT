<template>
	<div
		class="base-marquee"
		:class="[
			variantClass,
			`base-marquee--${direction}`,
			{
				'base-marquee--vertical': isVertical,
				'base-marquee--fade': hasFade,
				'base-marquee--running': isRunning,
				'base-marquee--paused': isPaused,
				'base-marquee--static': isReducedMotion,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, motionStyle]"
		role="marquee"
		:aria-label="rootLabel">
		<div ref="viewportRef" class="base-marquee__viewport" :class="classes.viewport" :tabindex="viewportTabindex">
			<div ref="trackRef" class="base-marquee__track">
				<div
					v-for="group in groupCount"
					:key="group"
					class="base-marquee__group"
					:role="items ? 'list' : undefined"
					:aria-hidden="group > 1 ? 'true' : undefined"
					:inert="group > 1 || undefined">
					<template v-if="items">
						<template v-for="(item, index) in items" :key="index">
							<span class="base-marquee__item" :class="classes.item" role="listitem">
								<slot name="item" :item="item" :index="index">{{ item }}</slot>
							</span>
							<span v-if="$slots.separator" class="base-marquee__separator" aria-hidden="true">
								<slot name="separator" />
							</span>
						</template>
					</template>
					<slot v-else />
				</div>
			</div>
		</div>
		<BaseButton
			v-if="hasPauseControl"
			variant="ghost"
			class="base-marquee__button"
			:custom-class="classes.button"
			:size-scale="sizeScale"
			:aria-label="isPaused ? UI_MARQUEE.PLAY : UI_MARQUEE.PAUSE"
			@click="togglePause">
			<BaseIcon :name="isPaused ? 'play' : 'pause'" :size-scale="calcIconScale('sm', sizeScale)" />
		</BaseButton>
	</div>
</template>

<script setup lang="ts" generic="T">
import '../styles/BaseMarquee.style.scss'
import { UI_MARQUEE } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@utils/media/iconUtils'
import { useBaseMarquee } from '../model/useBaseMarquee'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseMarqueeEmits, BaseMarqueeProps, BaseMarqueeSlots } from '../types/BaseMarquee.types'

const props = withDefaults(
	defineProps<BaseMarqueeProps<T>>(),
	kitDefaults('BaseMarquee', {
		variant: DEFAULT_VARIANT,
		direction: 'left',
		speed: 50,
		gap: 32,
		hasFade: false,
		hasPauseButton: true,
		isPaused: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseMarqueeEmits>()
defineSlots<BaseMarqueeSlots<T>>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	viewportRef,
	trackRef,
	isVertical,
	isReducedMotion,
	isRunning,
	isPaused,
	togglePause,
	groupCount,
	hasPauseControl,
	viewportTabindex,
	motionStyle,
	rootLabel,
} = useBaseMarquee(props, emit)
</script>

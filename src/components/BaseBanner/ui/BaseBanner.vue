<template>
	<Transition :css="false" v-bind="expand">
		<div
			v-if="isShown"
			role="region"
			:class="[ui('root'), `base-banner--${type}`, `base-banner--${position}`, variantClass, classes.root]"
			:style="[sizeScaleStyle, variantStyle, customColorStyle]"
			:aria-label="bannerLabel">
			<div :class="[ui('body'), classes.body]">
				<div v-if="hasIcon" :class="[ui('icon-wrapper'), classes.iconWrapper]">
					<slot name="icon">
						<BaseIcon :name="bannerIcon" :size-scale="calcIconScale('md', sizeScale)" :custom-class="classes.icon" />
					</slot>
				</div>

				<div :class="[ui('content'), classes.content]">
					<BaseText
						v-if="text || $slots.default"
						tag="p"
						:size-scale="sizeScale"
						:class="ui('text')"
						:custom-class="classes.text">
						<slot>{{ text }}</slot>
					</BaseText>

					<div v-if="$slots.action" :class="[ui('action'), classes.action]">
						<slot name="action" />
					</div>
				</div>

				<BaseButton
					v-if="isClosable"
					variant="ghost"
					:size-scale="sizeScale"
					:padding="closeButtonPadding"
					:class="ui('close')"
					:custom-class="classes.close"
					:aria-label="UI_ARIA.CLOSE"
					@click="handleClose">
					<BaseIcon name="close" :custom-class="classes.closeIcon" />
				</BaseButton>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import '../styles/BaseBanner.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import { useBaseBanner } from '../model/useBaseBanner'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseBannerEmits, BaseBannerProps, BaseBannerSlots } from '../types/BaseBanner.types'

const props = withDefaults(
	defineProps<BaseBannerProps>(),
	kitDefaults('BaseBanner', {
		variant: DEFAULT_VARIANT,
		type: 'primary',
		hasIcon: true,
		isClosable: false,
		isOpen: true,
		position: 'static',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseBannerEmits>()
defineSlots<BaseBannerSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	expand,
	isShown,
	closeButtonPadding,
	bannerIcon,
	bannerLabel,
	handleClose,
} = useBaseBanner(props, emit)
</script>

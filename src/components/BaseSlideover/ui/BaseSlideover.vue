<template>
	<teleport defer :to="teleportTarget" :disabled="isTeleportDisabled">
		<transition name="base-slideover">
			<div
				v-if="isOpen"
				:class="[
					ui('root'),
					animationClass,
					`base-slideover--${side}`,
					variantClass,
					isFullWidth && 'base-slideover--full',
					isContainedMode && 'base-slideover--contained',
					!hasOverlay && 'base-slideover--no-overlay',
					classes.root,
				]"
				:style="[widthStyle, sizeScaleStyle, variantStyle, customColorStyle, layerStyle]"
				v-bind="themeAttrs"
				@pointerdown="handleOverlayPointerdown"
				@click.self="handleOverlayClick">
				<div
					ref="panelRef"
					:class="[ui('panel'), `base-slideover__panel--${side}`, isFullWidth && 'base-slideover__panel--full', classes.panel]"
					:style="panelStyle"
					role="dialog"
					:aria-modal="isModal ? 'true' : undefined"
					:aria-labelledby="hasDefaultTitle ? titleId : undefined"
					:aria-label="hasDefaultTitle ? undefined : ariaLabel">
					<div v-if="hasHeader" :class="[ui('header'), classes.header]">
						<slot name="header">
							<BaseText
								v-if="title"
								:id="titleId"
								tag="h3"
								:weight="TEXT_WEIGHT.SEMIBOLD"
								:class="ui('title')"
								:custom-class="classes.title"
								>{{ title }}</BaseText
							>
						</slot>
						<BaseButton variant="ghost" :class="ui('close')" :aria-label="UI_ARIA.CLOSE" @click="handleClose">
							<BaseIcon name="close" />
						</BaseButton>
					</div>

					<div ref="bodyRef" :class="[ui('body'), classes.body]" :tabindex="isBodyScrollable ? 0 : undefined">
						<slot />
					</div>

					<footer v-if="hasFooter" :class="[ui('footer'), classes.footer]">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import '../styles/BaseSlideover.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseSlideover } from '../model/useBaseSlideover'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT } from '@composables/base/useBaseComponent'
import type { BaseSlideoverEmits, BaseSlideoverProps, BaseSlideoverSlots } from '../types/BaseSlideover.types'

const props = withDefaults(
	defineProps<BaseSlideoverProps>(),
	kitDefaults('BaseSlideover', {
		variant: DEFAULT_VARIANT,
		side: 'right',
		width: 100,
		isFullWidth: false,
		closeOnOverlay: true,
		closeOnEscape: true,
		isContained: false,
		hasOverlay: true,
		padding: undefined,
		animation: 'slide',
	}),
)
const emit = defineEmits<BaseSlideoverEmits>()
defineSlots<BaseSlideoverSlots>()

const {
	variantClass,
	variantStyle,
	sizeScaleStyle,
	customColorStyle,
	classes,
	widthStyle,
	isContainedMode,
	teleportTarget,
	isTeleportDisabled,
	panelStyle,
	hasHeader,
	hasFooter,
	hasDefaultTitle,
	layerStyle,
	handleOverlayClick,
	handleOverlayPointerdown,
	handleClose,
	panelRef,
	bodyRef,
	titleId,
	isBodyScrollable,
	isModal,
	ui,
	animationClass,
	themeAttrs,
} = useBaseSlideover(props, emit)
</script>

<template>
	<teleport defer :to="teleportTarget" :disabled="isTeleportDisabled">
		<transition name="base-slideover">
			<div
				v-if="isOpen"
				class="base-slideover"
				:class="[
					`base-slideover--${side}`,
					isFullWidth && 'base-slideover--full',
					isContainedMode && 'base-slideover--contained',
					!hasOverlay && 'base-slideover--no-overlay',
					classes.root,
				]"
				:style="[widthStyle, sizeScaleStyle, customColorStyle, layerStyle]"
				@click.self="handleOverlayClick">
				<div
					ref="panelRef"
					class="base-slideover__panel"
					:class="[`base-slideover__panel--${side}`, isFullWidth && 'base-slideover__panel--full', classes.panel]"
					:style="panelStyle"
					role="dialog"
					:aria-modal="isModal ? 'true' : undefined"
					:aria-labelledby="hasDefaultTitle ? titleId : undefined">
					<div v-if="hasHeader" class="base-slideover__header" :class="classes.header">
						<slot name="header">
							<BaseText
								v-if="title"
								:id="titleId"
								tag="h3"
								:weight="TEXT_WEIGHT.SEMIBOLD"
								class="base-slideover__title"
								:custom-class="classes.title"
								>{{ title }}</BaseText
							>
						</slot>
						<BaseButton variant="ghost" class="base-slideover__close" :aria-label="UI_ARIA.CLOSE" @click="handleClose">
							<BaseIcon name="close" />
						</BaseButton>
					</div>

					<!-- Тело: с прокруткой получает tabindex, чтобы его можно было прокрутить с клавиатуры -->
					<div ref="bodyRef" class="base-slideover__body" :class="classes.body" :tabindex="isBodyScrollable ? 0 : undefined">
						<slot />
					</div>

					<footer v-if="hasFooter" class="base-slideover__footer" :class="classes.footer">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { useBaseSlideover } from '../model/useBaseSlideover'
import '../styles/BaseSlideover.style.scss'
import type { BaseSlideoverEmits, BaseSlideoverProps, BaseSlideoverSlots } from '../types/BaseSlideover.types'

const props = withDefaults(
	defineProps<BaseSlideoverProps>(),
	kitDefaults('BaseSlideover', {
		side: 'right',
		width: 100,
		isFullWidth: false,
		closeOnOverlay: true,
		closeOnEscape: true,
		isContained: false,
		hasOverlay: true,
		padding: undefined,
	}),
)
const emit = defineEmits<BaseSlideoverEmits>()
defineSlots<BaseSlideoverSlots>()

const {
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
	handleClose,
	panelRef,
	bodyRef,
	titleId,
	isBodyScrollable,
	isModal,
} = useBaseSlideover(props, emit)
</script>

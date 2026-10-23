<template>
	<teleport defer :to="teleportTarget" :disabled="isContained">
		<transition name="base-modal" @after-leave="emit('after-leave')">
			<div
				v-if="isOpen"
				:class="[
					ui('root'),
					animationClass,
					variantClass,
					fullScreenClass,
					isContained && 'base-modal--contained',
					!hasOverlay && 'base-modal--no-overlay',
					classes.root,
				]"
				:style="[sizeScaleStyle, variantStyle, customColorStyle, layerStyle]"
				v-bind="themeAttrs"
				@pointerdown="handleOverlayPointerdown"
				@click.self="handleOverlayClick">
				<div
					ref="contentRef"
					:class="[ui('content'), classes.content]"
					:role="dialogRole"
					:aria-modal="isModal ? 'true' : undefined"
					:aria-labelledby="title ? titleId : undefined"
					:aria-label="title ? undefined : ariaLabel"
					:aria-describedby="ariaDescribedby">
					<div v-if="title" :class="[ui('header'), classes.header]">
						<div :class="[ui('header-left'), classes.headerLeft]">
							<BaseText
								:id="titleId"
								tag="h3"
								:size-scale="sizeScale"
								:weight="TEXT_WEIGHT.SEMIBOLD"
								:class="ui('title')"
								:custom-class="classes.title"
								>{{ title }}</BaseText
							>
						</div>
						<BaseButton
							variant="ghost"
							:size-scale="sizeScale"
							:class="ui('close')"
							:custom-class="classes.close"
							:aria-label="UI_ARIA.CLOSE"
							@click="handleClose">
							<BaseIcon name="close" :size-scale="sizeScale" />
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
import '../styles/BaseModal.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { useBaseModal } from '../model/useBaseModal'
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseModalEmits, BaseModalProps, BaseModalSlots } from '../types/BaseModal.types'

const props = withDefaults(
	defineProps<BaseModalProps>(),
	kitDefaults('BaseModal', {
		isOpen: undefined,
		variant: DEFAULT_VARIANT,
		closeOnOverlay: true,
		closeOnEscape: true,
		sizeScale: SIZE_SCALE_DEFAULT,
		isContained: false,
		hasOverlay: true,
		dialogRole: 'dialog',
		animation: 'scale',
	}),
)
const emit = defineEmits<BaseModalEmits>()
defineSlots<BaseModalSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	teleportTarget,
	hasFooter,
	fullScreenClass,
	layerStyle,
	handleOverlayClick,
	handleOverlayPointerdown,
	handleClose,
	contentRef,
	bodyRef,
	titleId,
	isBodyScrollable,
	isModal,
	ui,
	animationClass,
	themeAttrs,
} = useBaseModal(props, emit)
</script>

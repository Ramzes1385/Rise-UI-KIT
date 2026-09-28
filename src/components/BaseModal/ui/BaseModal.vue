<template>
	<teleport defer :to="teleportTarget" :disabled="isContained">
		<transition name="base-modal" @after-leave="emit('after-leave')">
			<div
				v-if="isOpen"
				class="base-modal"
				:class="[
					variantClass,
					fullScreenClass,
					isContained && 'base-modal--contained',
					!hasOverlay && 'base-modal--no-overlay',
					classes.root,
				]"
				:style="[sizeScaleStyle, variantStyle, customColorStyle, layerStyle]"
				@click.self="handleOverlayClick">
				<div
					ref="contentRef"
					class="base-modal__content"
					:class="classes.content"
					:role="dialogRole"
					:aria-modal="isModal ? 'true' : undefined"
					:aria-labelledby="title ? titleId : undefined"
					:aria-describedby="ariaDescribedby">
					<div v-if="title" class="base-modal__header" :class="classes.header">
						<div class="base-modal__header-left" :class="classes.headerLeft">
							<BaseText
								:id="titleId"
								tag="h3"
								:size-scale="sizeScale"
								:weight="TEXT_WEIGHT.SEMIBOLD"
								class="base-modal__title"
								:custom-class="classes.title"
								>{{ title }}</BaseText
							>
						</div>
						<BaseButton
							variant="ghost"
							:size-scale="sizeScale"
							class="base-modal__close"
							:custom-class="classes.close"
							:aria-label="UI_ARIA.CLOSE"
							@click="handleClose">
							<BaseIcon name="close" :size-scale="sizeScale" />
						</BaseButton>
					</div>

					<div ref="bodyRef" class="base-modal__body" :class="classes.body" :tabindex="isBodyScrollable ? 0 : undefined">
						<slot />
					</div>

					<footer v-if="hasFooter" class="base-modal__footer" :class="classes.footer">
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
import { kitDefaults } from '@composables/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseModalEmits, BaseModalProps, BaseModalSlots } from '../types/BaseModal.types'

const props = withDefaults(
	defineProps<BaseModalProps>(),
	kitDefaults('BaseModal', {
		isOpen: undefined,
		variant: DEFAULT_VARIANT,
		closeOnOverlay: true,
		sizeScale: SIZE_SCALE_DEFAULT,
		isContained: false,
		hasOverlay: true,
		dialogRole: 'dialog',
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
	handleClose,
	contentRef,
	bodyRef,
	titleId,
	isBodyScrollable,
	isModal,
} = useBaseModal(props, emit)
</script>

<template>
	<teleport to="body" :disabled="isContained">
		<transition name="modal-fade">
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
				:style="[sizeScaleStyle, variantStyle, customColorStyle]"
				@click.self="handleOverlayClick">
				<div class="base-modal__content" :class="classes.content">
					<!-- Заголовок -->
					<div v-if="title" class="base-modal__header" :class="classes.header">
						<div class="base-modal__header-left" :class="classes.headerLeft">
							<BaseText
								tag="h3"
								:size-scale="sizeScale"
								:weight="UI_FONT_WEIGHT.SEMIBOLD"
								class="base-modal__title"
								:custom-class="classes.title"
								>{{ title }}</BaseText
							>
						</div>
						<BaseButton
							variant="ghost"
							:padding="MODAL_CLOSE_BUTTON_PADDING"
							:size-scale="sizeScale"
							class="base-modal__close"
							:custom-class="classes.close"
							@click="handleClose">
							<BaseIcon name="close" :size-scale="sizeScale" />
						</BaseButton>
					</div>

					<!-- Тело -->
					<div class="base-modal__body" :class="classes.body">
						<slot />
					</div>

					<!-- Подвал -->
					<footer v-if="hasFooter" class="base-modal__footer" :class="classes.footer">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { usePopup } from '@composables/usePopup'
import { UI_FONT_WEIGHT, SIZE_SCALE_DEFAULT, MODAL_CLOSE_BUTTON_PADDING, DEFAULT_VARIANT} from '@constants'
import { computed, useSlots } from 'vue'
import '../styles/BaseModal.style.scss'
import type { BaseModalEmits, BaseModalProps } from '../model/BaseModal.types'

const props = withDefaults(defineProps<BaseModalProps>(), {
	isOpen: undefined,
	variant: DEFAULT_VARIANT,
	closeOnOverlay: true,
	sizeScale: SIZE_SCALE_DEFAULT,
	isContained: false,
	hasOverlay: true,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-modal', props, ['root', 'content', 'header', 'headerLeft', 'title', 'close', 'body', 'footer'])

const emit = defineEmits<BaseModalEmits>()
const slots = useSlots()

const hasFooter = computed(() => Boolean(slots.footer))

const fullScreenClass = computed(() => {
	if (!props.fullScreen) return undefined
	return `base-modal--fullscreen-${props.fullScreen}`
})

const { handleOverlayClick, close: handleClose } = usePopup({
	isOpen: () => props.isOpen,
	closeOnOverlay: () => props.closeOnOverlay ?? true,
	closeOnEscape: () => true,
	lockScroll: () => !props.isContained,
	onClose: () => {
		emit('update:isOpen', false)
		emit('close')
	},
})
</script>

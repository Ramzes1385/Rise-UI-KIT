<template>
	<teleport to="body">
		<transition name="modal-fade">
			<div
				v-if="isOpen"
				class="base-modal"
				:class="[`base-modal--${variant}`, fullScreen ? `base-modal--fullscreen-${fullScreen}` : '']"
				:style="sizeScaleStyle"
				@click.self="handleOverlayClick">
				<div class="base-modal__content" :class="[`base-modal__content--${size}`]">
					<!-- Заголовок -->
					<div v-if="title" class="base-modal__header">
						<div class="base-modal__header-left">
							<BaseText tag="h3" :size-scale="sizeScale" :weight="600" class="base-modal__title">{{ title }}</BaseText>
						</div>
						<BaseButton
							variant="ghost"
							size="sm"
							:size-scale="sizeScale"
							class="base-modal__close"
							@click="handleClose">
							<BaseIcon name="close" size="sm" :size-scale="sizeScale" />
						</BaseButton>
					</div>

					<!-- Тело -->
					<div class="base-modal__body">
						<slot />
					</div>

					<!-- Подвал -->
					<footer v-if="hasFooter" class="base-modal__footer">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { usePopup } from '@/shared/composables/usePopup'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { useSlots } from 'vue'
import './BaseModal.style.scss'
import type { BaseModalEmits, BaseModalProps } from './BaseModal.types'

const props = withDefaults(defineProps<BaseModalProps>(), {
	size: 'md',
	variant: 'default',
	closeOnOverlay: true,
	fullScreen: undefined,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-modal', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseModalEmits>()
const slots = useSlots()

/** Есть ли footer */
const hasFooter = !!slots.footer

/** Popup-паттерн: оверлей, Escape, блокировка скролла */
const { handleOverlayClick, close: handleClose } = usePopup({
	isOpen: () => props.isOpen,
	closeOnOverlay: () => props.closeOnOverlay ?? true,
	closeOnEscape: () => true,
	onClose: () => {
		emit('update:isOpen', false)
		emit('close')
	},
})
</script>

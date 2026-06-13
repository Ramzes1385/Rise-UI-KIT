<template>
	<teleport to="body" :disabled="isContained">
		<transition name="modal-fade">
			<div
				v-if="isOpen"
				class="base-modal"
				:class="[
					rootClasses,
					isContained && 'base-modal--contained',
					!hasOverlay && 'base-modal--no-overlay',
					classes.root,
				]"
				:style="rootStyles"
				@click.self="handleOverlayClick">
				<div class="base-modal__content" :class="classes.content">
					<!-- Заголовок -->
					<div v-if="title" class="base-modal__header" :class="classes.header">
						<div class="base-modal__header-left" :class="classes.headerLeft">
							<BaseText
								tag="h3"
								:size-scale="sizeScale"
								:weight="600"
								class="base-modal__title"
								:custom-class="classes.title"
								>{{ title }}</BaseText
							>
						</div>
						<BaseButton
							variant="ghost"
							:padding="2"
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
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { usePopup } from '@composables/usePopup'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed, useSlots } from 'vue'
import type { PropType } from 'vue'
import './BaseModal.style.scss'
import type { BaseModalEmits, BaseModalProps } from './BaseModal.types'

const props = defineProps({
	isOpen: { type: Boolean, required: true },
	title: String,
	variant: { type: String as PropType<BaseModalProps['variant']>, default: 'default' },
	color: Object as PropType<BaseModalProps['color']>,
	closeOnOverlay: { type: Boolean, default: true },
	fullScreen: String as PropType<BaseModalProps['fullScreen']>,
	sizeScale: { type: Number, default: 100 },
	isContained: { type: Boolean, default: false },
	hasOverlay: { type: Boolean, default: true },
	customClass: [String, Object] as PropType<BaseModalProps['customClass']>,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-modal', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'content', 'header', 'headerLeft', 'title', 'close', 'body', 'footer'],
})

const emit = defineEmits<BaseModalEmits>()
const slots = useSlots()

/** Есть ли footer */
const hasFooter = !!slots.footer

/** Класс fullScreen-модификатора */
const fullScreenClass = computed(() => {
	if (!props.fullScreen) return undefined
	return `base-modal--fullscreen-${props.fullScreen}`
})

/** Итоговые классы корневого элемента */
const rootClasses = computed(() => {
	const classes: (string | undefined)[] = [variantClass.value, fullScreenClass.value]
	return classes.filter(Boolean)
})

/** Итоговые стили корневого элемента */
const rootStyles = computed(() => {
	const styles: Record<string, string> = {}
	if (sizeScaleStyle.value) Object.assign(styles, sizeScaleStyle.value)
	if (variantStyle.value) Object.assign(styles, variantStyle.value)
	if (customColorStyle.value) Object.assign(styles, customColorStyle.value)
	return Object.keys(styles).length > 0 ? styles : undefined
})

/** Popup-паттерн: оверлей, Escape, блокировка скролла */
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

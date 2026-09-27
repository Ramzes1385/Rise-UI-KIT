<template>
	<teleport to="body" :disabled="isContained">
		<transition name="base-modal">
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
				<div
					ref="contentRef"
					class="base-modal__content"
					:class="classes.content"
					role="dialog"
					:aria-modal="isModal ? 'true' : undefined"
					:aria-labelledby="title ? titleId : undefined">
					<!-- Заголовок -->
					<div v-if="title" class="base-modal__header" :class="classes.header">
						<div class="base-modal__header-left" :class="classes.headerLeft">
							<BaseText
								:id="titleId"
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
							:size-scale="sizeScale"
							class="base-modal__close"
							:custom-class="classes.close"
							:aria-label="UI_ARIA.CLOSE"
							@click="handleClose">
							<BaseIcon name="close" :size-scale="sizeScale" />
						</BaseButton>
					</div>

					<!-- Тело: с прокруткой получает tabindex, чтобы его можно было прокрутить с клавиатуры -->
					<div
						ref="bodyRef"
						class="base-modal__body"
						:class="classes.body"
						:tabindex="isBodyScrollable ? 0 : undefined">
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
import { computed, ref, useId, useSlots } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFocusTrap } from '@composables/useFocusTrap'
import { usePopup } from '@composables/usePopup'
import { useScrollableRegion } from '@composables/useScrollableRegion'
import { UI_ARIA, UI_FONT_WEIGHT, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT } from '@constants'
import '../styles/BaseModal.style.scss'
import type { BaseModalEmits, BaseModalProps, BaseModalSlots } from '../model/BaseModal.types'

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
defineSlots<BaseModalSlots>()
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

const contentRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const titleId = useId()

/**
 * Тело с прокруткой получает tabindex="0": если в нём нет полей и кнопок, иначе его не прокрутить с клавиатуры.
 * Короткое тело в порядок Tab не попадает.
 */
const { isScrollable: isBodyScrollable } = useScrollableRegion({ elementRef: bodyRef })

/**
 * Модальный режим: оверлей на весь экран перехватывает клики (в том числе прозрачный при hasOverlay=false)
 * и блокирует прокрутку. В isContained окно перекрывает только свой контейнер, остальная страница
 * доступна — диалог немодальный: без aria-modal и без ловушки фокуса.
 */
const isModal = computed(() => !props.isContained)

useFocusTrap({
	containerRef: contentRef,
	isActive: () => Boolean(props.isOpen) && isModal.value,
})
</script>

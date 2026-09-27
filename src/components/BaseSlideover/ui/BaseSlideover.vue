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
					<!-- Заголовок -->
					<div v-if="hasHeader" class="base-slideover__header" :class="classes.header">
						<slot name="header">
							<BaseText
								v-if="title"
								:id="titleId"
								tag="h3"
								:weight="UI_FONT_WEIGHT.SEMIBOLD"
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
					<div
						ref="bodyRef"
						class="base-slideover__body"
						:class="classes.body"
						:tabindex="isBodyScrollable ? 0 : undefined">
						<slot />
					</div>

					<!-- Подвал -->
					<footer v-if="hasFooter" class="base-slideover__footer" :class="classes.footer">
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
import { kitDefaults } from '@composables/useDefaults'
import { useFocusTrap } from '@composables/useFocusTrap'
import { useLayerIndex } from '@composables/useLayerStack'
import { usePadding } from '@composables/usePadding'
import { usePopup } from '@composables/usePopup'
import { useScrollableRegion } from '@composables/useScrollableRegion'
import { useTeleportTarget } from '@composables/useTeleportTarget'
import { UI_ARIA, UI_FONT_WEIGHT } from '@constants'
import '../styles/BaseSlideover.style.scss'
import type { BaseSlideoverEmits, BaseSlideoverProps, BaseSlideoverSlots } from '../model/BaseSlideover.types'

const props = withDefaults(defineProps<BaseSlideoverProps>(), kitDefaults('BaseSlideover', {
	side: 'right',
	width: 100,
	isFullWidth: false,
	closeOnOverlay: true,
	closeOnEscape: true,
	isContained: false,
	hasOverlay: true,
	padding: undefined,
}))

/** Масштаб и кастомный цвет — на корне: панель и её содержимое наследуют --size-scale и --custom-* */
const { sizeScaleStyle, customColorStyle, classes } = useStandardBaseComponent('base-slideover', props, [
	'root',
	'panel',
	'header',
	'title',
	'body',
	'footer',
])

/** Стиль для масштабирования ширины панели */
const widthStyle = computed(() => {
	if (props.isFullWidth || props.width === 100) return undefined
	return { '--slideover-width-scale': String(props.width / 100) }
})

/** Режим ограничения активен: явный isContained или передан container */
const isContainedMode = computed(() => props.isContained || !!props.container)

/** Цель телепорта: проп container, иначе контейнер из плагина и BaseApp (teleportTo), иначе body */
const appTeleportTarget = useTeleportTarget()
const teleportTarget = computed<string | HTMLElement>(() => props.container ?? appTeleportTarget)

/** Отключить teleport только когда нет контейнера и явно contained */
const isTeleportDisabled = computed(() => !props.container && props.isContained)

/**
 * Отступы секций: число задаёт только горизонталь (множитель 1), объект — точечно.
 * omitUnsetSides оставляет остальные стороны на значениях из стилей (16px по вертикали, 20px по горизонтали).
 * Без пропа padding inline-переменные не пишутся: отступы целиком берутся из стилей.
 */
const { paddingStyle: explicitPaddingStyle } = usePadding({
	getPadding: () => props.padding,
	prefix: '--slideover-pad',
	axisMultiplier: 1,
	omitUnsetSides: true,
})
const panelStyle = computed(() => (props.padding === undefined ? undefined : explicitPaddingStyle.value))

const emit = defineEmits<BaseSlideoverEmits>()
defineSlots<BaseSlideoverSlots>()
const slots = useSlots()

const hasHeader = computed(() => Boolean(slots.header) || Boolean(props.title))
const hasFooter = computed(() => Boolean(slots.footer))

/** Popup-паттерн: оверлей, Escape, блокировка скролла */
/** Место панели среди открытых слоёв: панель, открытая из окна, — над ним */
const layerStyle = useLayerIndex(() => props.isOpen)

const { handleOverlayClick, close: handleClose } = usePopup({
	isOpen: () => props.isOpen,
	closeOnOverlay: () => props.closeOnOverlay,
	closeOnEscape: () => props.closeOnEscape,
	lockScroll: () => !isContainedMode.value,
	onClose: () => {
		emit('update:isOpen', false)
		emit('close')
	},
})

const panelRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const titleId = useId()

/**
 * Тело с прокруткой получает tabindex="0": если в нём нет полей и кнопок, иначе его не прокрутить с клавиатуры.
 * Короткое тело в порядок Tab не попадает.
 */
const { isScrollable: isBodyScrollable } = useScrollableRegion({ elementRef: bodyRef })

/** Заголовок из title рендерится только без слота header — иначе aria-labelledby ссылался бы на несуществующий id */
const hasDefaultTitle = computed(() => Boolean(props.title) && !slots.header)

/**
 * Модальный режим: оверлей на весь экран перехватывает клики (в том числе прозрачный при hasOverlay=false)
 * и блокирует прокрутку. В isContained/container панель перекрывает только свой контейнер,
 * остальная страница доступна — диалог немодальный: без aria-modal и без ловушки фокуса.
 */
const isModal = computed(() => !isContainedMode.value)

useFocusTrap({
	containerRef: panelRef,
	isActive: () => props.isOpen && isModal.value,
})
</script>

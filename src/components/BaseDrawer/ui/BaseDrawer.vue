<template>
	<!--
		Выдвижная панель: модальный диалог у края окна — снизу (лист на телефоне), сверху или сбоку. Закрывается кнопкой,
		Escape, кликом по затемнению и перетаскиванием за ручку или шапку к краю. Фокус заперт в панели и возвращается
		к кнопке, которая её открыла
	-->
	<teleport defer :to="teleportTarget">
		<transition name="base-drawer">
			<div
				v-if="isOpen"
				class="base-drawer"
				:class="[`base-drawer--${direction}`, { 'base-drawer--no-overlay': !hasOverlay, 'base-drawer--dragging': isDragging }, classes.root]"
				:style="[sizeScaleStyle, customColorStyle, layerStyle]"
				@click.self="handleOverlayClick">
				<div
					ref="panelRef"
					class="base-drawer__panel"
					:class="[`base-drawer__panel--${direction}`, classes.panel]"
					:style="dragStyle"
					role="dialog"
					aria-modal="true"
					:aria-labelledby="hasDefaultTitle ? titleId : undefined"
					:aria-label="hasDefaultTitle ? undefined : ariaLabel"
					:aria-describedby="description ? descriptionId : undefined"
					@pointerdown="handlePointerdown"
					@pointermove="handlePointermove"
					@pointerup="handlePointerup"
					@pointercancel="resetDrag">
					<div v-if="hasHandle" class="base-drawer__handle" :class="classes.handle" aria-hidden="true" />
					<div v-if="hasHeader" class="base-drawer__header" :class="classes.header">
						<slot name="header">
							<BaseText :id="titleId" tag="h2" :weight="TEXT_WEIGHT.SEMIBOLD" class="base-drawer__title" :custom-class="classes.title">
								{{ title }}
							</BaseText>
						</slot>
						<BaseButton variant="ghost" class="base-drawer__close" :aria-label="UI_ARIA.CLOSE" @click="handleClose">
							<BaseIcon name="close" />
						</BaseButton>
					</div>
					<p v-if="description" :id="descriptionId" class="base-drawer__description">{{ description }}</p>
					<!-- Тело с прокруткой получает tabindex, чтобы его можно было прокрутить с клавиатуры -->
					<div ref="bodyRef" class="base-drawer__body" :class="classes.body" :tabindex="isBodyScrollable ? 0 : undefined">
						<slot />
					</div>
					<footer v-if="slots.footer" class="base-drawer__footer" :class="classes.footer">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import { computed, ref, useId, useSlots, watch } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useFocusTrap } from '@composables/useFocusTrap'
import { useLayerIndex } from '@composables/useLayerStack'
import { usePopup } from '@composables/usePopup'
import { useScrollableRegion } from '@composables/useScrollableRegion'
import { useTeleportTarget } from '@composables/useTeleportTarget'
import '../styles/BaseDrawer.style.scss'
import type { BaseDrawerEmits, BaseDrawerProps, BaseDrawerSlots } from '../model/BaseDrawer.types'

const props = withDefaults(defineProps<BaseDrawerProps>(), kitDefaults('BaseDrawer', {
	variant: DEFAULT_VARIANT,
	direction: 'bottom',
	hasHandle: true,
	isDraggable: true,
	closeOnOverlay: true,
	closeOnEscape: true,
	hasOverlay: true,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const emit = defineEmits<BaseDrawerEmits>()
defineSlots<BaseDrawerSlots>()
const slots = useSlots()

const { sizeScaleStyle, customColorStyle, classes } = useStandardBaseComponent('base-drawer', props, [
	'root',
	'panel',
	'handle',
	'header',
	'title',
	'body',
	'footer',
])

const teleportTarget = useTeleportTarget()
const layerStyle = useLayerIndex(() => props.isOpen)

const titleId = useId()
const descriptionId = useId()

const hasHeader = computed(() => Boolean(slots.header) || Boolean(props.title))
/** Заголовок из title рендерится только без слота header — иначе aria-labelledby ссылался бы на несуществующий id */
const hasDefaultTitle = computed(() => Boolean(props.title) && !slots.header)

const { handleOverlayClick, close: handleClose } = usePopup({
	isOpen: () => props.isOpen,
	closeOnOverlay: () => props.closeOnOverlay,
	closeOnEscape: () => props.closeOnEscape,
	onClose: () => {
		emit('update:isOpen', false)
		emit('close')
	},
})

const panelRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)

useFocusTrap({ containerRef: panelRef, isActive: () => props.isOpen })

const { isScrollable: isBodyScrollable } = useScrollableRegion({ elementRef: bodyRef })

// ─── Перетаскивание к краю ─────────────────────────────────────────────────────

/** Доля размера панели: отпущенная дальше панель закрывается, ближе — возвращается */
const CLOSE_RATIO = 0.25

const isVertical = computed(() => props.direction === 'bottom' || props.direction === 'top')
/** Знак смещения к краю: вниз для нижней панели, вверх для верхней, вправо для правой, влево для левой */
const closeSign = computed(() => (props.direction === 'bottom' || props.direction === 'right' ? 1 : -1))

const isDragging = ref(false)
const dragOffset = ref(0)
/** Панель отпущена за порогом: уезжает к краю вместе с исчезающим затемнением */
const isDismissing = ref(false)
let dragStart = 0

function pointerPosition(event: PointerEvent): number {
	return isVertical.value ? event.clientY : event.clientX
}

/** Смещение панели: при перетаскивании — за указателем, при закрытии перетаскиванием — за край */
const dragStyle = computed(() => {
	const axis = isVertical.value ? 'Y' : 'X'
	if (isDismissing.value) return { transform: `translate${axis}(${closeSign.value * 100}%)` }
	if (!isDragging.value) return undefined
	return { transform: `translate${axis}(${closeSign.value * dragOffset.value}px)`, transition: 'none' }
})

/** Тянуть можно за ручку и шапку, но не за кнопки и поля в них */
function handlePointerdown(event: PointerEvent): void {
	const target = event.target as HTMLElement
	if (!props.isDraggable || event.button !== 0) return
	if (!target.closest('.base-drawer__handle, .base-drawer__header') || target.closest('button, a, input, select, textarea')) return
	panelRef.value?.setPointerCapture?.(event.pointerId)
	dragStart = pointerPosition(event)
	dragOffset.value = 0
	isDragging.value = true
}

function handlePointermove(event: PointerEvent): void {
	if (!isDragging.value) return
	dragOffset.value = Math.max(0, (pointerPosition(event) - dragStart) * closeSign.value)
}

function resetDrag(): void {
	isDragging.value = false
	dragOffset.value = 0
}

function handlePointerup(): void {
	if (!isDragging.value) return
	const panel = panelRef.value as HTMLElement
	const size = isVertical.value ? panel.offsetHeight : panel.offsetWidth
	const shouldClose = dragOffset.value > size * CLOSE_RATIO
	resetDrag()
	if (!shouldClose) return
	isDismissing.value = true
	handleClose()
}

/** Родитель не закрыл панель или открыл её снова — она возвращается на место */
watch(
	() => props.isOpen,
	() => {
		isDismissing.value = false
	},
)
</script>

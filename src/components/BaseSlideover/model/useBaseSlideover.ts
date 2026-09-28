import type { ComputedRef } from 'vue'
import { usePopup } from '@composables/usePopup'
import { usePadding } from '@composables/usePadding'
/** Composable: логика BaseSlideover — режим панели, отступы секций, закрытие и ловушка фокуса */
import { computed, ref, useId, useSlots } from 'vue'
import { useFocusTrap } from '@composables/useFocusTrap'
import { useLayerIndex } from '@composables/useLayerStack'
import { useTeleportTarget } from '@composables/useTeleportTarget'
import { useScrollableRegion } from '@composables/useScrollableRegion'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseSlideoverEmits, SlideoverProps } from '../types/BaseSlideover.types'

const SLIDEOVER_ELEMENTS = ['root', 'panel', 'header', 'title', 'body', 'footer']

function useSlideoverLayout(props: SlideoverProps) {
	// Цель телепорта: проп container, иначе контейнер из плагина и BaseApp (teleportTo), иначе body
	const appTeleportTarget = useTeleportTarget()
	// Число задаёт только горизонталь (множитель 1), объект — точечно; omitUnsetSides оставляет остальные стороны
	// на значениях из стилей (16px по вертикали, 20px по горизонтали)
	const { paddingStyle } = usePadding({
		getPadding: () => props.padding,
		prefix: '--slideover-pad',
		axisMultiplier: 1,
		omitUnsetSides: true,
	})

	return {
		widthStyle: computed(() =>
			props.isFullWidth || props.width === 100 ? undefined : { '--slideover-width-scale': String(props.width / 100) },
		),
		isContainedMode: computed(() => props.isContained || !!props.container),
		teleportTarget: computed<string | HTMLElement>(() => props.container ?? appTeleportTarget),
		isTeleportDisabled: computed(() => !props.container && props.isContained),
		// Без пропа padding inline-переменные не пишутся: отступы целиком берутся из стилей
		panelStyle: computed(() => (props.padding === undefined ? undefined : paddingStyle.value)),
	}
}

function useSlideoverSections(props: SlideoverProps) {
	const slots = useSlots()
	return {
		hasHeader: computed(() => Boolean(slots.header) || Boolean(props.title)),
		hasFooter: computed(() => Boolean(slots.footer)),
		// Заголовок из title рендерится только без слота header — иначе aria-labelledby ссылался бы на несуществующий id
		hasDefaultTitle: computed(() => Boolean(props.title) && !slots.header),
	}
}

function useSlideoverClose(props: SlideoverProps, emit: BaseSlideoverEmits, isContainedMode: ComputedRef<boolean>) {
	const { handleOverlayClick, close } = usePopup({
		isOpen: () => props.isOpen,
		closeOnOverlay: () => props.closeOnOverlay,
		closeOnEscape: () => props.closeOnEscape,
		lockScroll: () => !isContainedMode.value,
		onClose: () => {
			emit('update:isOpen', false)
			emit('close')
		},
	})
	return { handleOverlayClick, handleClose: close }
}

function useSlideoverDialog(props: SlideoverProps, isContainedMode: ComputedRef<boolean>) {
	const panelRef = ref<HTMLElement | null>(null)
	const bodyRef = ref<HTMLElement | null>(null)
	const titleId = useId()
	// Тело с прокруткой получает tabindex="0": если в нём нет полей и кнопок, иначе его не прокрутить с клавиатуры
	const { isScrollable: isBodyScrollable } = useScrollableRegion({ elementRef: bodyRef })
	// Модальный режим: оверлей на весь экран перехватывает клики (в том числе прозрачный при hasOverlay=false) и блокирует
	// прокрутку. В isContained/container панель перекрывает только свой контейнер — без aria-modal и ловушки фокуса
	const isModal = computed(() => !isContainedMode.value)
	useFocusTrap({ containerRef: panelRef, isActive: () => props.isOpen && isModal.value })

	return { panelRef, bodyRef, titleId, isBodyScrollable, isModal }
}

export function useBaseSlideover(props: SlideoverProps, emit: BaseSlideoverEmits) {
	// Масштаб и кастомный цвет — на корне: панель и её содержимое наследуют --size-scale и --custom-*
	const standard = useStandardBaseComponent('base-slideover', props, SLIDEOVER_ELEMENTS)
	const layout = useSlideoverLayout(props)

	return {
		...standard,
		...layout,
		...useSlideoverSections(props),
		// Место панели среди открытых слоёв: панель, открытая из окна, — над ним
		layerStyle: useLayerIndex(() => props.isOpen),
		...useSlideoverClose(props, emit, layout.isContainedMode),
		...useSlideoverDialog(props, layout.isContainedMode),
	}
}

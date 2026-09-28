/** Composable: логика BaseImageZoom — имя диалога, подписи миниатюр и ловушка фокуса */
import { computed, nextTick, ref } from 'vue'
import { formatMessage } from '@/locales'
import { UI_ARIA } from '@/locales/messages'
import { useFocusTrap } from '@composables/useFocusTrap'
import { useTeleportTarget } from '@composables/useTeleportTarget'
import type { BaseImageZoomProps } from '../types/BaseImageZoom.types'

export function useBaseImageZoom(props: BaseImageZoomProps) {
	// Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo)
	const teleportTarget = useTeleportTarget()
	const dialogRef = ref<HTMLElement | null>(null)
	const zoomImgRef = ref<HTMLElement | null>(null)
	const minimapImgRef = ref<HTMLElement | null>(null)
	// Просмотр смонтирован только пока открыт: ловушка активна всё время жизни компонента
	useFocusTrap({ containerRef: dialogRef, isActive: () => true })

	return {
		teleportTarget,
		// Имя диалога: у декоративного изображения (alt="") остаётся общее «Просмотр изображения»
		dialogLabel: computed((): string => (props.alt ? `${UI_ARIA.IMAGE_VIEWER}: ${props.alt}` : UI_ARIA.IMAGE_VIEWER)),
		thumbLabel: (index: number): string =>
			formatMessage(UI_ARIA.GALLERY_ITEM, { current: index + 1, total: props.gallery.galleryList.value.length }),
		dialogRef,
		zoomImgRef,
		minimapImgRef,
		handleImageLoad: () => nextTick(props.zoom.syncSizes),
		exposed: { zoomImgRef, minimapImgRef },
	}
}

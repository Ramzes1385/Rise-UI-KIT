import { cropBlob } from './crop/cropBlob'
import { useCropDrag } from './useCropDrag'
import { useCropKeys } from './useCropKeys'
import { useCropView } from './useCropView'
import { useUi } from '@composables/base/useUi'
import { panView, unitSize } from './crop/cropGeometry'
import { computed, ref, shallowRef, useId, watch, type Ref } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { AvatarImageSize, AvatarBlobOptions, AvatarCropperProps, BaseAvatarCropperEmits } from '../types/BaseAvatarCropper.types'

function useCropImage(props: AvatarCropperProps, emit: BaseAvatarCropperEmits) {
	const image = shallowRef<AvatarImageSize | null>(null)
	const hasError = ref(false)
	watch(
		() => props.src,
		() => {
			image.value = null
			hasError.value = false
		},
	)
	return {
		image,
		hasError,
		handleLoad(event: Event): void {
			const target = event.target as HTMLImageElement
			image.value = { width: target.naturalWidth || 1, height: target.naturalHeight || 1 }
		},
		handleError(): void {
			hasError.value = true
			emit('error')
		},
	}
}

function stepping(isStepping: Ref<boolean>) {
	return <Args extends unknown[]>(isStep: boolean, action: (...args: Args) => void) =>
		(...args: Args): void => {
			isStepping.value = isStep
			action(...args)
		}
}

export function useBaseAvatarCropper(props: AvatarCropperProps, emit: BaseAvatarCropperEmits) {
	const areaRef = ref<HTMLElement | null>(null)
	const imageRef = ref<HTMLImageElement | null>(null)
	const loading = useCropImage(props, emit)
	const crop = useCropView(props, emit, loading.image)
	const isEnabled = (): boolean => !props.isDisabled && Boolean(crop.view.value)
	const start = () => {
		const [view, image] = [crop.view.value, loading.image.value]
		const width = areaRef.value?.getBoundingClientRect().width || props.size
		return view && image ? { view, pixelsPerUnit: unitSize(view, image, width) } : null
	}
	const drag = useCropDrag({ start, isEnabled, setView: crop.setView })
	const keys = useCropKeys({
		isEnabled,
		zoom: () => crop.zoom.value,
		panBy: delta => {
			const origin = start()
			if (origin) crop.setView(panView(origin.view, delta, origin.pixelsPerUnit))
		},
		zoomTo: crop.zoomTo,
		reset: crop.reset,
	})
	const stepped = stepping(crop.isStepping)
	const getBlob = (options?: AvatarBlobOptions): Promise<Blob | null> =>
		imageRef.value && crop.crop.value
			? cropBlob({ image: imageRef.value, crop: crop.crop.value }, props.shape, options)
			: Promise.resolve(null)
	return {
		...useStandardBaseComponent('base-avatar-cropper', props, ['root', 'area', 'zoom']),
		ui: useUi(props, 'base-avatar-cropper'),
		areaRef,
		imageRef,
		hintId: `${useId()}-hint`,
		hasError: loading.hasError,
		isLoaded: computed(() => Boolean(crop.view.value)),
		imageStyle: crop.style,
		zoom: computed(() => Math.round(crop.zoom.value * 100) / 100),
		isDragging: drag.isDragging,
		isStepping: crop.isStepping,
		handleLoad: loading.handleLoad,
		handleError: loading.handleError,
		handlePointerDown: stepped(false, drag.handlePointerDown),
		handleKeydown: stepped(true, keys.handleKeydown),
		handleWheel: stepped(false, keys.handleWheel),
		setZoom: stepped(false, crop.zoomTo),
		exposed: { getBlob, reset: stepped(true, crop.reset) },
	}
}

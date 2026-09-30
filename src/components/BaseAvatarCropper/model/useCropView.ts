import type { Ref } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import { clampView, cropToView, imageStyle, initialView, sameCrop, viewToCrop } from './crop/cropGeometry'
import type { AvatarView, AvatarImageSize, AvatarCropperProps, BaseAvatarCropperEmits } from '../types/BaseAvatarCropper.types'

export function useCropView(props: AvatarCropperProps, emit: BaseAvatarCropperEmits, image: Ref<AvatarImageSize | null>) {
	const view = shallowRef<AvatarView | null>(null)
	const crop = computed(() => (view.value && image.value ? viewToCrop(view.value, image.value) : undefined))
	const setView = (next: AvatarView): void => {
		if (!image.value) return
		view.value = clampView(next, image.value, props.maxZoom)
		const value = viewToCrop(view.value, image.value)
		if (!sameCrop(props.crop, value)) emit('update:crop', value)
	}
	watch(image, size => {
		view.value = null
		if (size) setView(props.crop ? cropToView(props.crop, size, props.maxZoom) : initialView(size))
	})
	watch(
		() => props.crop,
		value => {
			if (value && image.value && !sameCrop(crop.value, value)) view.value = cropToView(value, image.value, props.maxZoom)
		},
	)
	return {
		view,
		crop,
		setView,
		style: computed(() => (view.value && image.value ? imageStyle(view.value, image.value) : {})),
		zoom: computed(() => view.value?.zoom ?? 1),
		reset(): void {
			if (image.value) setView(initialView(image.value))
		},
		zoomTo(zoom: number): void {
			if (view.value) setView({ ...view.value, zoom })
		},
	}
}

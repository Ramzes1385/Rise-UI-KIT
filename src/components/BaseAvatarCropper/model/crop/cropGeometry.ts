import type { AvatarCrop, AvatarView, AvatarImageSize } from '../../types/BaseAvatarCropper.types'

const FRAME_SHARE = 0.84

const shortSide = (image: AvatarImageSize): number => Math.min(image.width, image.height)

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const percent = (value: number): string => `${Math.round(value * 10000) / 10000}%`

export const initialView = (image: AvatarImageSize): AvatarView => ({ zoom: 1, centerX: image.width / 2, centerY: image.height / 2 })

export function clampView(view: AvatarView, image: AvatarImageSize, maxZoom: number): AvatarView {
	const zoom = clamp(view.zoom, 1, Math.max(1, maxZoom))
	const half = shortSide(image) / zoom / 2
	return {
		zoom,
		centerX: clamp(view.centerX, half, image.width - half),
		centerY: clamp(view.centerY, half, image.height - half),
	}
}

export function viewToCrop(view: AvatarView, image: AvatarImageSize): AvatarCrop {
	const size = Math.round(shortSide(image) / view.zoom)
	return {
		x: clamp(Math.round(view.centerX - size / 2), 0, image.width - size),
		y: clamp(Math.round(view.centerY - size / 2), 0, image.height - size),
		size,
	}
}

export function cropToView(crop: AvatarCrop, image: AvatarImageSize, maxZoom: number): AvatarView {
	const view = { zoom: shortSide(image) / Math.max(crop.size, 1), centerX: crop.x + crop.size / 2, centerY: crop.y + crop.size / 2 }
	return clampView(view, image, maxZoom)
}

export const sameCrop = (left: AvatarCrop | undefined, right: AvatarCrop): boolean =>
	left?.x === right.x && left.y === right.y && left.size === right.size

export function panView(view: AvatarView, delta: { x: number; y: number }, pixelsPerUnit: number): AvatarView {
	return { ...view, centerX: view.centerX - delta.x / pixelsPerUnit, centerY: view.centerY - delta.y / pixelsPerUnit }
}

export const unitSize = (view: AvatarView, image: AvatarImageSize, areaWidth: number): number =>
	(areaWidth * FRAME_SHARE * view.zoom) / shortSide(image)

export function imageStyle(view: AvatarView, image: AvatarImageSize): Record<string, string> {
	const scale = (view.zoom / shortSide(image)) * FRAME_SHARE * 100
	return {
		width: percent(image.width * scale),
		height: percent(image.height * scale),
		left: percent(50 - view.centerX * scale),
		top: percent(50 - view.centerY * scale),
	}
}

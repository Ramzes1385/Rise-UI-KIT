<template>
	<teleport defer :to="teleportTarget">
		<Transition name="base-image-zoom" appear @after-leave="emit('after-leave')">
			<div
				v-if="zoom.isZoomOpen.value"
				ref="dialogRef"
				:class="[
					ui('zoom'),
					{ 'base-image__zoom--gallery': gallery.hasGallery.value, 'base-image__zoom--animated': zoom.isZoomAnimated.value },
				]"
				role="dialog"
				aria-modal="true"
				:aria-label="dialogLabel"
				@keydown="zoom.handleKeydown"
				@wheel.prevent="zoom.handleWheel"
				@click.self="zoom.handleOverlayClick">
				<div :class="ui('zoom-toolbar')">
					<BaseButton
						variant="ghost"
						:class="ui('zoom-btn')"
						:custom-class="classes.zoomOutButton"
						:aria-label="UI_ARIA.ZOOM_OUT"
						:is-disabled="zoom.isMinScale.value"
						is-focusable-when-disabled
						@click="zoom.zoomOut">
						<template #left><BaseIcon name="minus" :custom-class="classes.zoomOutIcon" /></template>
					</BaseButton>
					<span :class="[ui('zoom-scale'), classes.zoomScale]">{{ zoom.scalePercent.value }}%</span>
					<BaseButton
						variant="ghost"
						:class="ui('zoom-btn')"
						:custom-class="classes.zoomInButton"
						:aria-label="UI_ARIA.ZOOM_IN"
						:is-disabled="zoom.isMaxScale.value"
						is-focusable-when-disabled
						@click="zoom.zoomIn">
						<template #left><BaseIcon name="plus" :custom-class="classes.zoomInIcon" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						:class="ui('zoom-btn')"
						:custom-class="classes.zoomResetButton"
						:aria-label="UI_ARIA.ZOOM_RESET"
						@click="zoom.resetZoom">
						<template #left><BaseIcon name="rotate-ccw" :custom-class="classes.zoomResetIcon" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						:class="ui('zoom-btn')"
						:custom-class="classes.rotateLeftButton"
						:aria-label="UI_ARIA.ROTATE_LEFT"
						@click="zoom.rotateLeft">
						<template #left><BaseIcon name="rotate-left" :custom-class="classes.rotateLeftIcon" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						:class="ui('zoom-btn')"
						:custom-class="classes.rotateRightButton"
						:aria-label="UI_ARIA.ROTATE_RIGHT"
						@click="zoom.rotateRight">
						<template #left><BaseIcon name="rotate-right" :custom-class="classes.rotateRightIcon" /></template>
					</BaseButton>
					<BaseSeparator orientation="vertical" :class="ui('zoom-divider')" />
					<BaseButton
						variant="ghost"
						:class="[ui('zoom-btn'), 'base-image__zoom-btn--close']"
						:custom-class="classes.zoomCloseButton"
						:aria-label="UI_ARIA.CLOSE"
						autofocus
						@click="zoom.closeZoom">
						<template #left><BaseIcon name="close" :custom-class="classes.zoomCloseIcon" /></template>
					</BaseButton>
				</div>

				<BaseButton
					v-if="gallery.hasGalleryPrev.value"
					variant="ghost"
					:class="[ui('zoom-nav'), 'base-image__zoom-nav--prev']"
					:custom-class="classes.galleryPrevButton"
					:aria-label="UI_ARIA.GALLERY_PREV"
					@click="gallery.handleGalleryPrev">
					<template #left><BaseIcon name="chevron-left" :custom-class="classes.galleryPrevIcon" /></template>
				</BaseButton>
				<BaseButton
					v-if="gallery.hasGalleryNext.value"
					variant="ghost"
					:class="[ui('zoom-nav'), 'base-image__zoom-nav--next']"
					:custom-class="classes.galleryNextButton"
					:aria-label="UI_ARIA.GALLERY_NEXT"
					@click="gallery.handleGalleryNext">
					<template #left><BaseIcon name="chevron-right" :custom-class="classes.galleryNextIcon" /></template>
				</BaseButton>

				<div :class="ui('zoom-container')" @click.self="zoom.handleOverlayClick">
					<img
						ref="zoomImgRef"
						:key="gallery.currentZoomSrc.value"
						:src="gallery.currentZoomSrc.value"
						:alt="imageAlt"
						:class="ui('zoom-img')"
						:style="zoom.zoomImageStyle.value"
						draggable="false"
						@load="handleImageLoad" />
				</div>

				<div v-if="gallery.hasGallery.value" :class="ui('zoom-gallery')">
					<div :class="ui('zoom-gallery-track')">
						<button
							v-for="(img, index) in gallery.galleryList.value"
							:key="index"
							type="button"
							:class="[ui('zoom-thumb'), { 'base-image__zoom-thumb--active': gallery.galleryIndex.value === index }]"
							:aria-label="thumbLabel(index)"
							:aria-current="gallery.galleryIndex.value === index ? 'true' : undefined"
							@click="gallery.handleGalleryGo(index)">
							<img :src="img" alt="" :class="ui('zoom-thumb-img')" draggable="false" />
						</button>
					</div>
					<span :class="[ui('zoom-counter'), classes.galleryCounter]"
						>{{ gallery.galleryIndex.value + 1 }} / {{ gallery.galleryList.value.length }}</span
					>
				</div>

				<div
					v-if="showMinimap && currentScale > 1"
					:class="ui('minimap')"
					@click="zoom.handleMinimapClick"
					@mousedown.prevent="zoom.handleMinimapDragStart">
					<img
						ref="minimapImgRef"
						:key="gallery.currentZoomSrc.value"
						:src="gallery.currentZoomSrc.value"
						alt=""
						:class="ui('minimap-img')"
						:style="zoom.minimapImageStyle.value"
						draggable="false"
						@load="handleImageLoad" />
					<div :class="ui('minimap-viewport')" :style="zoom.minimapViewportStyle.value"></div>
				</div>
			</div>
		</Transition>
	</teleport>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseSeparator } from '@components/BaseSeparator'
import { useBaseImageZoom } from '../model/useBaseImageZoom'
import type { BaseImageZoomEmits, BaseImageZoomProps } from '../types/BaseImageZoom.types'

const props = defineProps<BaseImageZoomProps>()
const emit = defineEmits<BaseImageZoomEmits>()

const { teleportTarget, imageAlt, dialogLabel, thumbLabel, dialogRef, zoomImgRef, minimapImgRef, handleImageLoad, exposed } =
	useBaseImageZoom(props)

defineExpose(exposed)
</script>

<template>
	<teleport defer :to="teleportTarget">
		<div
			ref="dialogRef"
			class="base-image__zoom"
			:class="{ 'base-image__zoom--gallery': gallery.hasGallery.value }"
			role="dialog"
			aria-modal="true"
			:aria-label="dialogLabel"
			@keydown="zoom.handleKeydown"
			@wheel.prevent="zoom.handleWheel"
			@click.self="zoom.handleOverlayClick">
			<div class="base-image__zoom-toolbar">
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.zoomOutButton"
					:aria-label="UI_ARIA.ZOOM_OUT"
					:is-disabled="zoom.isMinScale.value"
					is-focusable-when-disabled
					@click="zoom.zoomOut">
					<template #left><BaseIcon name="minus" :custom-class="classes.zoomOutIcon" /></template>
				</BaseButton>
				<span class="base-image__zoom-scale" :class="classes.zoomScale">{{ zoom.scalePercent.value }}%</span>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.zoomInButton"
					:aria-label="UI_ARIA.ZOOM_IN"
					:is-disabled="zoom.isMaxScale.value"
					is-focusable-when-disabled
					@click="zoom.zoomIn">
					<template #left><BaseIcon name="plus" :custom-class="classes.zoomInIcon" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.zoomResetButton"
					:aria-label="UI_ARIA.ZOOM_RESET"
					@click="zoom.resetZoom">
					<template #left><BaseIcon name="rotate-ccw" :custom-class="classes.zoomResetIcon" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.rotateLeftButton"
					:aria-label="UI_ARIA.ROTATE_LEFT"
					@click="zoom.rotateLeft">
					<template #left><BaseIcon name="rotate-left" :custom-class="classes.rotateLeftIcon" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.rotateRightButton"
					:aria-label="UI_ARIA.ROTATE_RIGHT"
					@click="zoom.rotateRight">
					<template #left><BaseIcon name="rotate-right" :custom-class="classes.rotateRightIcon" /></template>
				</BaseButton>
				<span class="base-image__zoom-divider" aria-hidden="true"></span>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn base-image__zoom-btn--close"
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
				class="base-image__zoom-nav base-image__zoom-nav--prev"
				:custom-class="classes.galleryPrevButton"
				:aria-label="UI_ARIA.GALLERY_PREV"
				@click="gallery.handleGalleryPrev">
				<template #left><BaseIcon name="chevron-left" :custom-class="classes.galleryPrevIcon" /></template>
			</BaseButton>
			<BaseButton
				v-if="gallery.hasGalleryNext.value"
				variant="ghost"
				class="base-image__zoom-nav base-image__zoom-nav--next"
				:custom-class="classes.galleryNextButton"
				:aria-label="UI_ARIA.GALLERY_NEXT"
				@click="gallery.handleGalleryNext">
				<template #left><BaseIcon name="chevron-right" :custom-class="classes.galleryNextIcon" /></template>
			</BaseButton>

			<div class="base-image__zoom-container" @click.self="zoom.handleOverlayClick">
				<img
					ref="zoomImgRef"
					:src="gallery.currentZoomSrc.value"
					:alt="imageAlt"
					class="base-image__zoom-img"
					:style="zoom.zoomImageStyle.value"
					draggable="false"
					@load="handleImageLoad" />
			</div>

			<div v-if="gallery.hasGallery.value" class="base-image__zoom-gallery">
				<div class="base-image__zoom-gallery-track">
					<button
						v-for="(img, index) in gallery.galleryList.value"
						:key="index"
						type="button"
						class="base-image__zoom-thumb"
						:class="{ 'base-image__zoom-thumb--active': gallery.galleryIndex.value === index }"
						:aria-label="thumbLabel(index)"
						:aria-current="gallery.galleryIndex.value === index ? 'true' : undefined"
						@click="gallery.handleGalleryGo(index)">
						<img :src="img" alt="" class="base-image__zoom-thumb-img" draggable="false" />
					</button>
				</div>
				<span class="base-image__zoom-counter" :class="classes.galleryCounter"
					>{{ gallery.galleryIndex.value + 1 }} / {{ gallery.galleryList.value.length }}</span
				>
			</div>

			<div
				v-if="showMinimap && currentScale > 1"
				class="base-image__minimap"
				@click="zoom.handleMinimapClick"
				@mousedown.prevent="zoom.handleMinimapDragStart">
				<img
					ref="minimapImgRef"
					:src="gallery.currentZoomSrc.value"
					alt=""
					class="base-image__minimap-img"
					:style="zoom.minimapImageStyle.value"
					draggable="false"
					@load="handleImageLoad" />
				<div class="base-image__minimap-viewport" :style="zoom.minimapViewportStyle.value"></div>
			</div>
		</div>
	</teleport>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { useBaseImageZoom } from '../model/useBaseImageZoom'
import type { BaseImageZoomProps } from '../types/BaseImageZoom.types'

const props = defineProps<BaseImageZoomProps>()

const { teleportTarget, imageAlt, dialogLabel, thumbLabel, dialogRef, zoomImgRef, minimapImgRef, handleImageLoad, exposed } =
	useBaseImageZoom(props)

defineExpose(exposed)
</script>

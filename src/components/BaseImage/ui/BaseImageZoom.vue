<template>
	<teleport to="body">
		<div
			class="base-image__zoom"
			@wheel.prevent="zoom.handleWheel"
			@click.self="zoom.handleOverlayClick">
			<div class="base-image__zoom-toolbar">
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.zoomOutButton"
					:is-disabled="zoom.isMinScale.value"
					@click="zoom.zoomOut">
					<template #left><BaseIcon name="minus" :custom-class="classes.zoomOutIcon" /></template>
				</BaseButton>
				<BaseText tag="span" class="base-image__zoom-scale" :custom-class="classes.zoomScale"
					>{{ zoom.scalePercent.value }}%</BaseText
				>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.zoomInButton"
					:is-disabled="zoom.isMaxScale.value"
					@click="zoom.zoomIn">
					<template #left><BaseIcon name="plus" :custom-class="classes.zoomInIcon" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.zoomResetButton"
					@click="zoom.resetZoom">
					<template #left><BaseIcon name="rotate-ccw" :custom-class="classes.zoomResetIcon" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.rotateLeftButton"
					@click="zoom.rotateLeft">
					<template #left><BaseIcon name="rotate-left" :custom-class="classes.rotateLeftIcon" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn"
					:custom-class="classes.rotateRightButton"
					@click="zoom.rotateRight">
					<template #left><BaseIcon name="rotate-right" :custom-class="classes.rotateRightIcon" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					class="base-image__zoom-btn base-image__zoom-btn--close"
					:custom-class="classes.zoomCloseButton"
					@click="zoom.closeZoom">
					<template #left><BaseIcon name="close" :custom-class="classes.zoomCloseIcon" /></template>
				</BaseButton>
			</div>

			<BaseButton
				v-if="gallery.hasGalleryPrev.value"
				variant="ghost"
				class="base-image__zoom-nav base-image__zoom-nav--prev"
				:custom-class="classes.galleryPrevButton"
				@click="gallery.handleGalleryPrev">
				<template #left><BaseIcon name="chevron-left" :custom-class="classes.galleryPrevIcon" /></template>
			</BaseButton>
			<BaseButton
				v-if="gallery.hasGalleryNext.value"
				variant="ghost"
				class="base-image__zoom-nav base-image__zoom-nav--next"
				:custom-class="classes.galleryNextButton"
				@click="gallery.handleGalleryNext">
				<template #left><BaseIcon name="chevron-right" :custom-class="classes.galleryNextIcon" /></template>
			</BaseButton>

			<div class="base-image__zoom-container">
				<img
					ref="zoomImgRef"
					:src="gallery.currentZoomSrc.value"
					:alt="alt"
					class="base-image__zoom-img"
					:style="zoom.zoomImageStyle.value"
					draggable="false"
					@load="() => nextTick(zoom.syncSizes)" />
			</div>

			<div v-if="gallery.hasGallery.value" class="base-image__zoom-gallery">
				<div class="base-image__zoom-gallery-track">
					<div
						v-for="(img, index) in gallery.galleryList.value"
						:key="index"
						class="base-image__zoom-thumb"
						:class="{ 'base-image__zoom-thumb--active': gallery.galleryIndex.value === index }"
						@click="gallery.handleGalleryGo(index)">
						<img :src="img" :alt="`${alt} ${index + 1}`" class="base-image__zoom-thumb-img" />
					</div>
				</div>
				<BaseText
					v-if="gallery.galleryList.value.length > 1"
					tag="span"
					class="base-image__zoom-counter"
					:custom-class="classes.galleryCounter"
					>{{ gallery.galleryIndex.value + 1 }} / {{ gallery.galleryList.value.length }}</BaseText
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
					:alt="alt"
					class="base-image__minimap-img"
					:style="zoom.minimapImageStyle.value"
					draggable="false"
					@load="() => nextTick(zoom.syncSizes)" />
				<div class="base-image__minimap-viewport" :style="zoom.minimapViewportStyle.value"></div>
			</div>
		</div>
	</teleport>
</template>

<script setup lang="ts">
import type { useImageZoom } from '@composables/useImageZoom'
import type { useImageGallery } from '../model/useImageGallery'

import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { nextTick, ref } from 'vue'

defineProps<{
	zoom: ReturnType<typeof useImageZoom>
	gallery: ReturnType<typeof useImageGallery>
	alt: string
	classes: Record<string, string>
	showMinimap: boolean
	currentScale: number
}>()

const zoomImgRef = ref<HTMLElement | null>(null)
const minimapImgRef = ref<HTMLElement | null>(null)

defineExpose({ zoomImgRef, minimapImgRef })
</script>

<template>
	<div
		:class="[
			ui('root'),
			variantClass,
			classes.root,
			`base-avatar-cropper--${shape}`,
			{
				'base-avatar-cropper--loading': !isLoaded,
				'base-avatar-cropper--dragging': isDragging,
				'base-avatar-cropper--stepping': isStepping,
				'base-avatar-cropper--disabled': isDisabled,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, { '--cropper-size': `${size}px` }]">
		<div
			ref="areaRef"
			:class="[ui('area'), classes.area]"
			role="group"
			:tabindex="isDisabled ? undefined : 0"
			:aria-roledescription="UI_AVATAR_CROPPER.ROLE"
			:aria-label="label ?? UI_AVATAR_CROPPER.LABEL"
			:aria-describedby="hintId"
			:aria-disabled="isDisabled || undefined"
			@pointerdown="handlePointerDown"
			@wheel="handleWheel"
			@keydown="handleKeydown">
			<img
				ref="imageRef"
				:class="ui('image')"
				:src="src"
				alt=""
				draggable="false"
				:style="imageStyle"
				@load="handleLoad"
				@error="handleError" />
			<span :class="ui('frame')" aria-hidden="true" />
			<span v-if="hasError" :class="ui('message')" role="alert">{{ UI_AVATAR_CROPPER.ERROR }}</span>
			<span :id="hintId" :class="ui('hint')">{{ UI_AVATAR_CROPPER.HINT }}</span>
		</div>
		<div :class="[ui('zoom'), classes.zoom]">
			<span :class="ui('zoom-label')" aria-hidden="true">{{ UI_AVATAR_CROPPER.ZOOM }}</span>
			<BaseRange
				:class="ui('range')"
				:model-value="zoom"
				:min="1"
				:max="maxZoom"
				:step="0.01"
				:aria-label="UI_AVATAR_CROPPER.ZOOM"
				:is-disabled="isDisabled || !isLoaded"
				:size-scale="sizeScale"
				@update:model-value="setZoom" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAvatarCropper.style.scss'
import { BaseRange } from '@components/BaseRange'
import { UI_AVATAR_CROPPER } from '@/locales/messages'
import { useBaseAvatarCropper } from '../model/useBaseAvatarCropper'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAvatarCropperEmits, BaseAvatarCropperExpose, BaseAvatarCropperProps } from '../types/BaseAvatarCropper.types'

const props = withDefaults(defineProps<BaseAvatarCropperProps>(), {
	variant: 'default',
	crop: undefined,
	shape: 'square',
	size: 280,
	maxZoom: 4,
	label: undefined,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseAvatarCropperEmits>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	areaRef,
	imageRef,
	hintId,
	hasError,
	isLoaded,
	imageStyle,
	zoom,
	isDragging,
	isStepping,
	handleLoad,
	handleError,
	handlePointerDown,
	handleKeydown,
	handleWheel,
	setZoom,
	exposed,
} = useBaseAvatarCropper(props, emit)

defineExpose<BaseAvatarCropperExpose>(exposed)
</script>

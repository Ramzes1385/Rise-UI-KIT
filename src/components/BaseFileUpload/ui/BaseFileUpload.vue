<template>
	<div
		ref="rootRef"
		class="base-file-upload"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-file-upload--disabled': isControlDisabled,
				'base-file-upload--dragover': isDragOver,
				'base-file-upload--error': hasError,
			},
			variantClass,
			classes.root,
		]">
		<input
			:id="inputId"
			ref="fileInput"
			type="file"
			class="base-file-upload__input"
			tabindex="-1"
			:accept="accept"
			:multiple="isMultiple"
			:disabled="isControlDisabled"
			@change="handleFileChange" />

		<FormFieldLabel
			v-if="label"
			:for-id="inputId"
			:label="label"
			class-name="base-file-upload__label"
			:custom-class="classes.label"
			:size-scale="sizeScale" />

		<div
			class="base-file-upload__dropzone"
			role="button"
			:tabindex="isControlDisabled ? -1 : 0"
			:aria-disabled="isControlDisabled || undefined"
			:aria-describedby="hasError ? errorsId : undefined"
			:class="[{ 'base-file-upload__dropzone--active': isDragOver }, classes.dropzone]"
			@click="triggerUpload"
			@keydown.enter.self.prevent="triggerUpload"
			@keydown.space.self.prevent="triggerUpload"
			@dragover.prevent="handleZoneDragOver"
			@dragleave="handleDragLeave"
			@drop.prevent="handleZoneDrop">
			<slot name="trigger">
				<BaseIcon name="upload" class="base-file-upload__icon" />
				<span class="base-file-upload__text" :class="classes.text">{{ buttonText ?? UI_TEXT.FILE_SELECT }}</span>
				<span v-if="accept || maxSize" class="base-file-upload__hint" :class="classes.hint">
					<span v-if="accept">{{ formatHint }}</span>
					<span v-if="maxSize">{{ UI_TEXT.FILE_MAX_SIZE_PREFIX }} {{ maxSize }} {{ UI_TEXT.FILE_MAX_SIZE_SUFFIX }}</span>
				</span>
			</slot>
		</div>

		<ul v-if="uploadedFiles.length > 0" class="base-file-upload__list" :class="classes.list">
			<li
				v-for="item in uploadedFiles"
				:key="item.id"
				class="base-file-upload__item"
				:class="[`base-file-upload__item--${item.status}`, classes.item]">
				<div class="base-file-upload__preview" :class="classes.preview" :style="previewStyle">
					<BaseImage
						v-if="item.previewUrl"
						:src="item.previewUrl"
						:alt="item.name"
						class="base-file-upload__preview-img"
						:custom-class="classes.previewImg"
						fit="cover"
						:border-radius="0"
						:zoom-config="{ hasZoom: allowPreview }" />
					<BaseIcon v-else :name="fileIconName(item)" class="base-file-upload__file-icon" />
				</div>

				<div class="base-file-upload__info" :class="classes.info">
					<span class="base-file-upload__name" :class="classes.name" :title="item.name">{{ item.name }}</span>
					<div class="base-file-upload__meta" :class="classes.meta">
						<span v-if="item.extension" class="base-file-upload__ext" :class="classes.ext">{{
							item.extension.toUpperCase()
						}}</span>
						<span class="base-file-upload__size" :class="classes.size">{{ formatSize(item.size) }}</span>
						<span class="base-file-upload__status" :class="[`base-file-upload__status--${item.status}`, classes.status]">
							<template v-if="item.status === 'done'">{{ UI_TEXT.FILE_STATUS_DONE }}</template>
							<template v-else-if="item.status === 'uploading'">{{ item.progress }}%</template>
							<template v-else-if="item.status === 'error'">{{ UI_TEXT.FILE_STATUS_ERROR }}</template>
							<template v-else>{{ UI_TEXT.FILE_STATUS_PENDING }}</template>
						</span>
					</div>
					<BaseProgress
						v-if="item.status === 'uploading'"
						:value="item.progress"
						shape="line"
						:aria-label="item.name"
						:size-scale="sizeScale"
						:custom-class="classes.progress"
						class="base-file-upload__progress" />
				</div>

				<BaseButton
					variant="ghost"
					class="base-file-upload__remove"
					:custom-class="classes.remove"
					:aria-label="`${UI_TEXT.DELETE} ${item.name}`"
					:is-disabled="isControlDisabled"
					:size-scale="sizeScale"
					@click="handleRemove(item)">
					<template #left><BaseIcon name="close" :size-scale="calcIconScale('sm', sizeScale)" /></template>
				</BaseButton>
			</li>
		</ul>

		<BaseAnimation
			v-if="hasError"
			:id="errorsId"
			name="fade"
			is-group
			tag="ul"
			:custom-class="classes.errors"
			class="base-file-upload__errors">
			<li v-for="(err, index) in displayErrors" :key="err + index" class="base-file-upload__error-item" :class="classes.errorItem">
				{{ err }}
			</li>
		</BaseAnimation>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseFileUpload.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseImage } from '@components/BaseImage'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
import { BaseProgress } from '@components/BaseProgress'
import { BaseAnimation } from '@components/BaseAnimation'
import { FormFieldLabel } from '@components/BaseFormField'
import { useBaseFileUpload } from '../model/useBaseFileUpload'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseFileUploadEmits, BaseFileUploadProps, BaseFileUploadSlots } from '../types/BaseFileUpload.types'

const props = withDefaults(
	defineProps<BaseFileUploadProps>(),
	kitDefaults('BaseFileUpload', {
		accept: '',
		isMultiple: false,
		isDisabled: false,
		variant: DEFAULT_VARIANT,
		maxSize: 5,
		maxCount: 10,
		label: '',
		previewSize: undefined,
		allowPreview: true,
		emptyText: () => UI_TEXT.FILE_DROP,
		sizeScale: SIZE_SCALE_DEFAULT,
		error: '',
	}),
)
const emit = defineEmits<BaseFileUploadEmits>()
defineSlots<BaseFileUploadSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isControlDisabled,
	fileInput,
	rootRef,
	inputId,
	errorsId,
	uploadedFiles,
	isDragOver,
	handleRemove,
	handleDragLeave,
	displayErrors,
	hasError,
	previewStyle,
	formatHint,
	formatSize,
	fileIconName,
	triggerUpload,
	handleZoneDragOver,
	handleZoneDrop,
	handleFileChange,
	exposed,
} = useBaseFileUpload(props, emit)

defineExpose(exposed)
</script>

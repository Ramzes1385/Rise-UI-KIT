<template>
	<div
		ref="rootRef"
		class="base-file-upload"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-file-upload--disabled': isDisabled,
				'base-file-upload--dragover': isDragOver,
				'base-file-upload--error': hasError,
			},
			variantClass,
			classes.root,
		]">
		<input
			ref="fileInput"
			type="file"
			class="base-file-upload__input"
			:accept="accept"
			:multiple="isMultiple"
			:disabled="isDisabled"
			@change="handleFileChange" />

		<BaseText v-if="label" tag="label" class="base-file-upload__label" :custom-class="classes.label">{{
			label
		}}</BaseText>

		<div
			class="base-file-upload__dropzone"
			tabindex="0"
			:class="[{ 'base-file-upload__dropzone--active': isDragOver }, classes.dropzone]"
			@click="triggerUpload"
			@dragover.prevent="handleDragOver"
			@dragleave="handleDragLeave"
			@drop.prevent="handleDrop">
			<slot name="trigger">
				<BaseText tag="span" class="base-file-upload__text" :custom-class="classes.text">{{ buttonText }}</BaseText>
				<BaseText v-if="accept" tag="span" class="base-file-upload__hint" :custom-class="classes.hint">{{
					formatHint
				}}</BaseText>
			<BaseText v-if="maxSize" tag="span" class="base-file-upload__hint" :custom-class="classes.hint"
				>{{ UI_TEXT.FILE_MAX_SIZE_PREFIX }} {{ maxSize }} {{ UI_TEXT.FILE_MAX_SIZE_SUFFIX }}</BaseText
			>
			</slot>
		</div>

		<ul v-if="uploadedFiles.length > 0" class="base-file-upload__list" :class="classes.list">
			<li
				v-for="item in uploadedFiles"
				:key="item.id"
				class="base-file-upload__item"
				:class="[`base-file-upload__item--${item.status}`, classes.item]">
				<div
					v-if="item.previewUrl"
					class="base-file-upload__preview"
					:class="classes.preview"
					:style="{ width: `${scaledPreviewSize}px`, height: `${scaledPreviewSize}px` }">
					<BaseImage
						:src="item.previewUrl"
						:alt="item.name"
						class="base-file-upload__preview-img"
						:custom-class="classes.previewImg"
						fit="contain"
						:has-zoom="allowPreview" />
				</div>

				<div class="base-file-upload__info" :class="classes.info">
					<BaseText
						tag="span"
						class="base-file-upload__name"
						:custom-class="classes.name"
						:title="item.name"
						truncate
						>{{ item.name }}</BaseText
					>
					<div class="base-file-upload__meta" :class="classes.meta">
						<BaseText tag="span" class="base-file-upload__ext" :custom-class="classes.ext">{{
							item.extension.toUpperCase()
						}}</BaseText>
						<BaseText tag="span" class="base-file-upload__size" :custom-class="classes.size">{{
							formatSize(item.size)
						}}</BaseText>
					</div>
					<BaseText
						tag="span"
						class="base-file-upload__status"
						:class="[`base-file-upload__status--${item.status}`, classes.status]">
						<template v-if="item.status === 'done'">{{ UI_TEXT.FILE_STATUS_DONE }}</template>
						<template v-else-if="item.status === 'uploading'">{{ item.progress }}%</template>
						<template v-else-if="item.status === 'error'">{{ UI_TEXT.FILE_STATUS_ERROR }}</template>
						<template v-else>{{ UI_TEXT.FILE_STATUS_PENDING }}</template>
					</BaseText>
					<BaseProgress
						v-if="item.status === 'uploading'"
						:value="item.progress"
						shape="line"
						:size-scale="sizeScale"
						:custom-class="classes.progress"
						class="base-file-upload__progress" />
				</div>

				<BaseButton
					variant="ghost"
					class="base-file-upload__remove"
					:custom-class="classes.remove"
					:title="UI_TEXT.DELETE"
					:size-scale="sizeScale"
					@click="handleRemove(item)">
					<BaseIcon name="close" :size-scale="calcIconScale('xs', sizeScale)" />
				</BaseButton>
			</li>
		</ul>

		<BaseAnimation
			v-if="hasError"
			name="fade"
			is-group
			tag="ul"
			:custom-class="classes.errors"
			class="base-file-upload__errors">
			<li
				v-for="(err, index) in displayErrors"
				:key="err + index"
				class="base-file-upload__error-item"
				:class="classes.errorItem">
				<BaseText tag="span" :size-scale="sizeScale">{{ index + 1 }}. {{ err }}</BaseText>
			</li>
		</BaseAnimation>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseAnimation } from '@components/BaseAnimation'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseProgress } from '@components/BaseProgress'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFileUploadState } from '@composables/useFileUploadState'
import { useFormField } from '@composables/useFormField'
import { UI_TEXT, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT} from '@constants'
import { toHTMLInputElement } from '@utils/domUtils'
import { formatAcceptHint, formatFileSize } from '@utils/fileUtils'
import type { BaseFileUploadEmits, BaseFileUploadProps, BaseFileUploadSlots } from '../model/BaseFileUpload.types'
import '../styles/BaseFileUpload.style.scss'

const props = withDefaults(defineProps<BaseFileUploadProps>(), {
	accept: '',
	isMultiple: false,
	isDisabled: false,
	variant: DEFAULT_VARIANT,
	maxSize: 5,
	maxCount: 10,
	label: '',
	buttonText: UI_TEXT.FILE_SELECT,
	previewSize: 64,
	allowPreview: true,
	emptyText: UI_TEXT.FILE_DROP,
	sizeScale: SIZE_SCALE_DEFAULT,
	error: '',
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-file-upload', props, [
		'root',
		'label',
		'dropzone',
		'text',
		'hint',
		'list',
		'item',
		'preview',
		'previewImg',
		'info',
		'name',
		'meta',
		'ext',
		'size',
		'status',
		'progress',
		'remove',
		'errors',
		'errorItem',
	])

const emit = defineEmits<BaseFileUploadEmits>()
defineSlots<BaseFileUploadSlots>()

const formField = useFormField({
	value: () => undefined,
	error: () => props.error,
})

const fileInput = ref<HTMLInputElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)

const {
	uploadedFiles,
	isDragOver,
	displayErrors: uploadErrors,
	addFiles,
	handleRemove,
	handleDragOver,
	handleDragLeave,
	handleDrop,
} = useFileUploadState({
	getMaxSize: () => props.maxSize,
	getAccept: () => props.accept,
	getMaxCount: () => props.maxCount,
	onError: (message: string) => emit('error', message),
	onChange: (files: File[]) => emit('change', files),
	onRemove: (file) => emit('remove', file),
})

const displayErrors = computed(() => [...(formField.error ? [formField.error] : []), ...uploadErrors.value])
const hasError = computed(() => displayErrors.value.length > 0)

const scaledPreviewSize = computed(() => Math.round((props.previewSize * props.sizeScale) / 100))

const formatHint = computed(() => formatAcceptHint(props.accept))

function formatSize(bytes: number): string {
	return formatFileSize(bytes)
}

function triggerUpload(): void {
	fileInput.value?.click()
}

function handleFileChange(e: Event): void {
	const target = toHTMLInputElement(e.target)
	if (!target || !target.files) return
	addFiles(Array.from(target.files))
	target.value = ''
}

defineExpose({
	rootRef,
	focus: () => rootRef.value?.focus(),
	blur: () => rootRef.value?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>

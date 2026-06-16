<template>
	<div
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
					>до {{ maxSize }} МБ</BaseText
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
						<template v-if="item.status === 'done'">{{ UI_FILE_STATUS_DONE }}</template>
						<template v-else-if="item.status === 'uploading'">{{ item.progress }}%</template>
						<template v-else-if="item.status === 'error'">{{ UI_FILE_STATUS_ERROR }}</template>
						<template v-else>{{ UI_FILE_STATUS_PENDING }}</template>
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
					:title="UI_DELETE_TEXT"
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
import type { BaseFileUploadEmits, BaseFileUploadProps, UploadedFile } from '../model/BaseFileUpload.types'

import { computed, onBeforeUnmount, ref } from 'vue'

import { BaseAnimation } from '@components/BaseAnimation'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseProgress } from '@components/BaseProgress'
import { BaseText } from '@components/BaseText'
import { UI_DELETE_TEXT, UI_FILE_STATUS_DONE, UI_FILE_STATUS_ERROR, UI_FILE_STATUS_PENDING, UI_PROGRESS_INTERVAL_MS } from '@constants'
import { useBaseComponent } from '@composables/useBaseComponent'
import { createImagePreview, formatAcceptHint, formatFileSize, getExtension, validateFile } from '@utils/fileUtils'

import '../styles/BaseFileUpload.style.scss'

const props = withDefaults(defineProps<BaseFileUploadProps>(), {
	accept: '',
	isMultiple: false,
	isDisabled: false,
	variant: 'default',
	maxSize: 5,
	maxCount: 10,
	label: '',
	buttonText: 'Выберите файлы',
	previewSize: 64,
	allowPreview: true,
	emptyText: 'Перетащите файлы сюда',
	sizeScale: 100,
	error: '',
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-file-upload',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: [
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
	],
})

const emit = defineEmits<BaseFileUploadEmits>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFiles = ref<UploadedFile[]>([])
const isDragOver = ref(false)
const internalErrors = ref<string[]>([])

/** Активные таймеры имитации прогресса — очищаются при размонтировании. */
const progressIntervals = new Set<ReturnType<typeof setInterval>>()

/** Отображаемые ошибки (проп + внутренние) */
const displayErrors = computed(() => [...(props.error ? [props.error] : []), ...internalErrors.value])

/** Есть ли хотя бы одна ошибка */
const hasError = computed(() => displayErrors.value.length > 0)

/** Масштабированный размер превью */
const scaledPreviewSize = computed(() => Math.round((props.previewSize * props.sizeScale) / 100))

/** Подсказка по форматам */
const formatHint = computed(() => formatAcceptHint(props.accept))

/** Генерация уникального ID */
function generateId(): string {
	return `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** Форматирование размера */
function formatSize(bytes: number): string {
	return formatFileSize(bytes)
}

/** Валидация файлов */
function validateFiles(files: File[]): File[] {
	const valid: File[] = []

	for (const file of files) {
		const result = validateFile(file, {
			maxSize: props.maxSize,
			accept: props.accept,
		})
		if (!result.isValid) {
			for (const err of result.errors) {
				internalErrors.value.push(err)
				emit('error', err)
			}
			continue
		}
		valid.push(file)
	}

	return valid
}

async function addFiles(files: File[]): Promise<void> {
	/* istanbul ignore next — defensive: пустой массив отсекается на уровне input change */
	if (files.length === 0) return

	const remaining = props.maxCount - uploadedFiles.value.length
	if (remaining <= 0) {
		internalErrors.value.push(`Максимум файлов: ${props.maxCount}`)
		emit('error', `Максимум файлов: ${props.maxCount}`)
		return
	}

	internalErrors.value = []
	const toAdd = files.slice(0, remaining)
	const valid = validateFiles(toAdd)

	for (const file of valid) {
		await createUploadItem(file)
	}

	emit(
		'change',
		uploadedFiles.value.map(uploadedFile => uploadedFile.file),
	)
}

async function createUploadItem(file: File): Promise<void> {
	const previewUrl = await createImagePreview(file)
	uploadedFiles.value.push({
		id: generateId(),
		file,
		name: file.name,
		size: file.size,
		type: file.type,
		extension: getExtension(file.name),
		previewUrl,
		status: previewUrl ? 'uploading' : 'pending',
		progress: 0,
	})

	if (previewUrl) {
		simulateUploadProgress(uploadedFiles.value[uploadedFiles.value.length - 1].id)
	}
}

function simulateUploadProgress(itemId: string): void {
	const interval = setInterval(() => {
		const item = uploadedFiles.value.find(f => f.id === itemId)
		if (!item) {
			clearInterval(interval)
			progressIntervals.delete(interval)
			return
		}
		item.progress = Math.min(item.progress + Math.floor(Math.random() * 20) + 5, 100)
		if (item.progress >= 100) {
			item.status = 'done'
			item.progress = 100
			clearInterval(interval)
			progressIntervals.delete(interval)
		}
	}, UI_PROGRESS_INTERVAL_MS)
	progressIntervals.add(interval)
}

function triggerUpload(): void {
	fileInput.value?.click()
}

function handleFileChange(e: Event): void {
	const target = e.target as HTMLInputElement
	if (target.files) {
		addFiles(Array.from(target.files))
		target.value = ''
	}
}

function handleRemove(item: UploadedFile): void {
	uploadedFiles.value = uploadedFiles.value.filter(uploadedFile => uploadedFile.id !== item.id)
	/* istanbul ignore next — previewUrl присутствует только для image-файлов */
	if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
	emit('remove', item)
	emit(
		'change',
		uploadedFiles.value.map(uploadedFile => uploadedFile.file),
	)
}

function handleDragOver(): void {
	isDragOver.value = true
}

function handleDragLeave(): void {
	isDragOver.value = false
}

function handleDrop(e: DragEvent): void {
	isDragOver.value = false
	if (e.dataTransfer?.files) {
		addFiles(Array.from(e.dataTransfer.files))
	}
}

/** Очистка незавершённых таймеров прогресса при размонтировании. */
onBeforeUnmount(() => {
	progressIntervals.forEach(clearInterval)
	progressIntervals.clear()
})
</script>

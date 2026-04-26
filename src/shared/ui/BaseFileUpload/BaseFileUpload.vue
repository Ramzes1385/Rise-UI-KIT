<template>
	<div
		class="base-file-upload"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-file-upload--disabled': isDisabled,
				'base-file-upload--dragover': isDragOver,
			},
			variantClass,
		]">
		<input
			ref="fileInput"
			type="file"
			class="base-file-upload__input"
			:accept="accept"
			:multiple="isMultiple"
			:disabled="isDisabled"
			@change="handleFileChange" />

		<label v-if="label" class="base-file-upload__label">
			{{ label }}
		</label>

		<div
			class="base-file-upload__dropzone"
			:class="{ 'base-file-upload__dropzone--active': isDragOver }"
			@click="triggerUpload"
			@dragover.prevent="handleDragOver"
			@dragleave="handleDragLeave"
			@drop.prevent="handleDrop">
			<slot name="trigger">
				<span class="base-file-upload__icon">📁</span>
				<span class="base-file-upload__text">{{ buttonText }}</span>
				<span v-if="accept" class="base-file-upload__hint">{{ formatHint }}</span>
				<span v-if="maxSize" class="base-file-upload__hint">до {{ maxSize }} МБ</span>
			</slot>
		</div>

		<ul v-if="uploadedFiles.length > 0" class="base-file-upload__list">
			<li
				v-for="item in uploadedFiles"
				:key="item.id"
				class="base-file-upload__item"
				:class="`base-file-upload__item--${item.status}`">
				<div
					class="base-file-upload__preview"
					:style="{ width: `${previewSize}px`, height: `${previewSize}px` }"
					@click="handlePreview(item)">
					<img v-if="item.previewUrl" :src="item.previewUrl" :alt="item.name" class="base-file-upload__preview-img" />
					<span v-else class="base-file-upload__preview-icon">{{ fileIcon(item.extension) }}</span>
				</div>

				<div class="base-file-upload__info">
					<span class="base-file-upload__name" :title="item.name">{{ item.name }}</span>
					<div class="base-file-upload__meta">
						<span class="base-file-upload__ext">{{ item.extension.toUpperCase() }}</span>
						<span class="base-file-upload__size">{{ formatSize(item.size) }}</span>
					</div>
					<span class="base-file-upload__status">
						<template v-if="item.status === 'done'"
							><BaseIcon name="check" size="xs" :size-scale="sizeScale" /> Загружено</template
						>
						<template v-else-if="item.status === 'uploading'">⏳ Загрузка...</template>
						<template v-else-if="item.status === 'error'"
							><BaseIcon name="x-mark" size="xs" :size-scale="sizeScale" /> Ошибка</template
						>
						<template v-else>○ Ожидание</template>
					</span>
				</div>

				<BaseButton
					variant="ghost"
					class="base-file-upload__remove"
					title="Удалить"
					:size-scale="sizeScale"
					@click="handleRemove(item)">
					<BaseIcon name="close" size="xs" :size-scale="sizeScale" />
				</BaseButton>
			</li>
		</ul>

		<!-- Модальный просмотр изображения -->
		<Teleport to="body">
			<div v-if="previewFile" class="base-file-upload__overlay" @click="closePreview">
				<div class="base-file-upload__modal" @click.stop>
					<BaseButton
						variant="ghost"
						class="base-file-upload__modal-close"
						:size-scale="sizeScale"
						@click="closePreview">
						<BaseIcon name="close" size="sm" :size-scale="sizeScale" />
					</BaseButton>

					<div v-if="hasMultipleImages" class="base-file-upload__modal-nav">
						<BaseButton
							variant="ghost"
							class="base-file-upload__modal-nav-btn"
							:size-scale="sizeScale"
							@click="navigatePreview(-1)">
							<BaseIcon name="chevron-left" size="sm" :size-scale="sizeScale" />
						</BaseButton>
					</div>

					<img :src="previewFile.previewUrl!" :alt="previewFile.name" class="base-file-upload__modal-img" />

					<div v-if="hasMultipleImages" class="base-file-upload__modal-nav">
						<BaseButton
							variant="ghost"
							class="base-file-upload__modal-nav-btn"
							:size-scale="sizeScale"
							@click="navigatePreview(1)">
							<BaseIcon name="chevron-right" size="sm" :size-scale="sizeScale" />
						</BaseButton>
					</div>

					<div class="base-file-upload__modal-info">
						<span class="base-file-upload__modal-name">{{ previewFile.name }}</span>
						<span class="base-file-upload__modal-size">{{ formatSize(previewFile.size) }}</span>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import {
	createImagePreview,
	formatAcceptHint,
	formatFileSize,
	getExtension,
	getFileIcon,
	validateFile,
} from '@/shared/utils/fileUtils'
import { computed, ref } from 'vue'
import './BaseFileUpload.style.scss'
import type { BaseFileUploadEmits, BaseFileUploadProps, UploadedFile } from './BaseFileUpload.types'

const props = withDefaults(defineProps<BaseFileUploadProps>(), {
	isMultiple: false,
	isDisabled: false,
	variant: 'default',
	maxSize: 5,
	maxCount: 10,
	label: '',
	buttonText: 'Выберите файлы',
	accept: '',
	previewSize: 64,
	allowPreview: true,
	emptyText: 'Перетащите файлы сюда',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-file-upload', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseFileUploadEmits>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFiles = ref<UploadedFile[]>([])
const isDragOver = ref(false)
const previewFile = ref<UploadedFile | null>(null)
const previewIndex = ref(0)

/** Подсказка по форматам */
const formatHint = computed(() => formatAcceptHint(props.accept))

/** Есть ли несколько изображений для навигации */
const hasMultipleImages = computed(() => {
	return uploadedFiles.value.filter(f => f.previewUrl).length > 1
})

/** Генерация уникального ID */
function generateId(): string {
	return `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** Иконка по расширению */
function fileIcon(ext: string): string {
	return getFileIcon(ext)
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
			emit('error', result.error)
			continue
		}
		valid.push(file)
	}

	return valid
}

/** Добавление файлов */
async function addFiles(files: File[]): Promise<void> {
	if (files.length === 0) return

	const remaining = props.maxCount - uploadedFiles.value.length
	if (remaining <= 0) {
		emit('error', `Максимум файлов: ${props.maxCount}`)
		return
	}

	const toAdd = files.slice(0, remaining)
	const valid = validateFiles(toAdd)

	for (const file of valid) {
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
		})

		// Имитация загрузки (для демонстрации статуса)
		if (previewUrl) {
			setTimeout(() => {
				const item = uploadedFiles.value.find(f => f.file === file)
				if (item) {
					item.status = 'done'
				}
			}, 500)
		}
	}

	emit(
		'change',
		uploadedFiles.value.map(f => f.file),
	)
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
	uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== item.id)
	if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
	emit('remove', item)
	emit(
		'change',
		uploadedFiles.value.map(f => f.file),
	)
}

function handlePreview(item: UploadedFile): void {
	if (item.previewUrl && props.allowPreview) {
		previewIndex.value = uploadedFiles.value.findIndex(f => f.id === item.id)
		previewFile.value = item
	}
}

function closePreview(): void {
	previewFile.value = null
}

function navigatePreview(direction: number): void {
	const imageFiles = uploadedFiles.value.filter(f => f.previewUrl)
	if (imageFiles.length === 0) return

	const currentIndex = imageFiles.findIndex(f => f.id === previewFile.value?.id)
	const newIndex = (currentIndex + direction + imageFiles.length) % imageFiles.length
	previewFile.value = imageFiles[newIndex]
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
</script>

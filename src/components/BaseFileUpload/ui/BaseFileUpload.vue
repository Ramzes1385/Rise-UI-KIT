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
		<!-- Скрытый input открывается только программно: единственная точка входа с клавиатуры — зона загрузки -->
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

		<!-- Зона загрузки — кнопка: клик, Enter и Space открывают выбор файла; ошибки связаны через aria-describedby -->
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

		<!-- Список файлов: строки-карточки; цвет компонента (color) их не перекрашивает -->
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
import { computed, ref, useId } from 'vue'
import { BaseAnimation } from '@components/BaseAnimation'
import { BaseButton } from '@components/BaseButton'
import { FormFieldLabel } from '@components/BaseFormField'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseProgress } from '@components/BaseProgress'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useFileUploadState } from '@composables/useFileUploadState'
import { useFormDisabled } from '@composables/useFormContext'
import { useFormField } from '@composables/useFormField'
import { UI_TEXT, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT } from '@constants'
import { toHTMLInputElement } from '@utils/domUtils'
import { formatAcceptHint, formatFileSize } from '@utils/fileUtils'
import { calcIconScale } from '@utils/iconUtils'
import type { BaseFileUploadEmits, BaseFileUploadProps, BaseFileUploadSlots, UploadedFile } from '../model/BaseFileUpload.types'
import '../styles/BaseFileUpload.style.scss'

const props = withDefaults(defineProps<BaseFileUploadProps>(), kitDefaults('BaseFileUpload', {
	accept: '',
	isMultiple: false,
	isDisabled: false,
	variant: DEFAULT_VARIANT,
	maxSize: 5,
	maxCount: 10,
	label: '',
	// Без пропа размер превью берётся из стилей (40px, масштабируется sizeScale): inline-размер — только при явном значении
	previewSize: undefined,
	allowPreview: true,
	emptyText: () => UI_TEXT.FILE_DROP,
	sizeScale: SIZE_SCALE_DEFAULT,
	error: '',
}))

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг (fieldset формы блокирует только нативные поля) */
const isControlDisabled = useFormDisabled(() => props.isDisabled)

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
const inputId = useId()
const errorsId = useId()

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
	getIsMultiple: () => props.isMultiple,
	onError: (message: string) => emit('error', message),
	onChange: (files: File[]) => emit('change', files),
	onRemove: file => emit('remove', file),
})

const displayErrors = computed(() => [...(formField.error ? [formField.error] : []), ...uploadErrors.value])
const hasError = computed(() => displayErrors.value.length > 0)

/** Явный previewSize (px) масштабируется вместе с компонентом; без пропа размер задают стили. */
const previewStyle = computed(() => {
	if (props.previewSize === undefined) return undefined
	const size = `${Math.round((props.previewSize * props.sizeScale) / 100)}px`
	return { width: size, height: size }
})

const formatHint = computed(() => formatAcceptHint(props.accept))

function formatSize(bytes: number): string {
	return formatFileSize(bytes)
}

/** Иконка файла без превью: по MIME-типу — изображение, видео или документ. */
function fileIconName(item: UploadedFile): string {
	if (item.type.startsWith('image/')) return 'image'
	if (item.type.startsWith('video/')) return 'video'
	return 'file'
}

function triggerUpload(): void {
	if (isControlDisabled.value) return
	fileInput.value?.click()
}

// Отключённое состояние не может полагаться только на CSS pointer-events: drop и клавиатура его обходят
function handleZoneDragOver(): void {
	if (isControlDisabled.value) return
	handleDragOver()
}

function handleZoneDrop(e: DragEvent): void {
	if (isControlDisabled.value) return
	handleDrop(e)
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

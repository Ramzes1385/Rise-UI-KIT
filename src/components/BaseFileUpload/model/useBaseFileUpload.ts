/** Composable: логика BaseFileUpload — выбор и перетаскивание файлов, ошибки и превью */
import { computed, ref, useId } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { toHTMLInputElement } from '@utils/domUtils'
import { useFormField } from '@composables/useFormField'
import { useFormDisabled } from '@composables/useFormContext'
import { formatAcceptHint, formatFileSize } from '@utils/fileUtils'
import { useFileUploadState } from '@composables/useFileUploadState'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseFileUploadEmits, FileUploadProps, UploadedFile } from '../types/BaseFileUpload.types'

const FILE_UPLOAD_ELEMENTS = [
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
]

/** Иконка файла без превью: по MIME-типу — изображение, видео или документ */
function fileIconName(item: UploadedFile): string {
	if (item.type.startsWith('image/')) return 'image'
	if (item.type.startsWith('video/')) return 'video'
	return 'file'
}

function useUploadState(props: FileUploadProps, emit: BaseFileUploadEmits) {
	return useFileUploadState({
		getMaxSize: () => props.maxSize,
		getAccept: () => props.accept,
		getMaxCount: () => props.maxCount,
		getIsMultiple: () => props.isMultiple,
		onError: (message: string) => emit('error', message),
		onChange: (files: File[]) => emit('change', files),
		onRemove: file => emit('remove', file),
	})
}

/** Отключённое состояние не может полагаться только на CSS pointer-events: drop и клавиатура его обходят */
function useDropzone(
	state: ReturnType<typeof useFileUploadState>,
	isDisabled: ComputedRef<boolean>,
	fileInput: Ref<HTMLInputElement | null>,
) {
	return {
		triggerUpload(): void {
			if (isDisabled.value) return
			fileInput.value?.click()
		},
		handleZoneDragOver(): void {
			if (isDisabled.value) return
			state.handleDragOver()
		},
		handleZoneDrop(e: DragEvent): void {
			if (isDisabled.value) return
			state.handleDrop(e)
		},
		handleFileChange(e: Event): void {
			const target = toHTMLInputElement(e.target)
			if (!target || !target.files) return
			state.addFiles(Array.from(target.files))
			target.value = ''
		},
	}
}

/** Явный previewSize (px) масштабируется вместе с компонентом; без пропа размер задают стили */
function previewStyleOf(props: FileUploadProps): { width: string; height: string } | undefined {
	if (props.previewSize === undefined) return undefined
	const size = `${Math.round((props.previewSize * props.sizeScale) / 100)}px`
	return { width: size, height: size }
}

export function useBaseFileUpload(props: FileUploadProps, emit: BaseFileUploadEmits) {
	// Блокировка: свой isDisabled или неактивная BaseForm вокруг (fieldset формы блокирует только нативные поля)
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const standard = useStandardBaseComponent('base-file-upload', props, FILE_UPLOAD_ELEMENTS)
	const formField = useFormField({ value: () => undefined, error: () => props.error })
	const fileInput = ref<HTMLInputElement | null>(null)
	const rootRef = ref<HTMLElement | null>(null)
	const inputId = useId()
	const errorsId = useId()
	const state = useUploadState(props, emit)
	const displayErrors = computed(() => [...(formField.error ? [formField.error] : []), ...state.displayErrors.value])

	return {
		...standard,
		isControlDisabled,
		fileInput,
		rootRef,
		inputId,
		errorsId,
		uploadedFiles: state.uploadedFiles,
		isDragOver: state.isDragOver,
		handleRemove: state.handleRemove,
		handleDragLeave: state.handleDragLeave,
		displayErrors,
		hasError: computed(() => displayErrors.value.length > 0),
		previewStyle: computed(() => previewStyleOf(props)),
		formatHint: computed(() => formatAcceptHint(props.accept)),
		formatSize: (bytes: number): string => formatFileSize(bytes),
		fileIconName,
		...useDropzone(state, isControlDisabled, fileInput),
		exposed: {
			rootRef,
			focus: () => rootRef.value?.focus(),
			blur: () => rootRef.value?.blur(),
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}

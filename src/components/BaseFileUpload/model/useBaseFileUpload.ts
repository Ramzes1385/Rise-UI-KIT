import type { ComputedRef, Ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { computed, ref, useId, watch } from 'vue'
import { toHTMLInputElement } from '@utils/dom/domUtils'
import { useFormField } from '@composables/form/useFormField'
import { useFormDisabled } from '@composables/form/useFormContext'
import { useFileUploadState } from '@composables/form/useFileUploadState'
import { formatAcceptHint, formatFileSize } from '@utils/media/fileUtils'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseFileUploadEmits, BaseFileUploadExpose, FileUploadProps, UploadedFile } from '../types/BaseFileUpload.types'

const FILE_UPLOAD_ELEMENTS = [
	'root',
	'label',
	'dropzone',
	'text',
	'dropText',
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
	'fileError',
	'retry',
	'errors',
	'errorItem',
]

const PREVIEW_ZOOM = Object.freeze({ hasZoom: true })

function useLeavingItems(files: Ref<UploadedFile[]>) {
	const leavingCount = ref(0)
	watch(
		() => files.value.map(file => file.id),
		(next, prev) => {
			const kept = new Set(next)
			leavingCount.value += prev.filter(id => !kept.has(id)).length
		},
		{ flush: 'pre' },
	)
	return {
		leavingCount,
		pinLeavingItem(element: Element): void {
			const item = element as HTMLElement
			Object.assign(item.style, { top: `${item.offsetTop}px`, left: `${item.offsetLeft}px`, width: `${item.offsetWidth}px` })
			item.setAttribute('aria-hidden', 'true')
		},
		releaseLeavingItem(): void {
			leavingCount.value = Math.max(leavingCount.value - 1, 0)
		},
	}
}

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
		getUploader: () => props.uploader,
		getAllowPreview: () => props.allowPreview,
		onError: (message: string) => emit('error', message),
		onChange: (files: File[]) => emit('change', files),
		onRemove: file => emit('remove', file),
		onUploadSuccess: (file, response) => emit('upload-success', file, response),
		onUploadError: (file, message) => emit('upload-error', file, message),
	})
}

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

function previewStyleOf(props: FileUploadProps): { width: string; height: string } | undefined {
	if (props.previewSize === undefined) return undefined
	const size = `${Math.round((props.previewSize * props.sizeScale) / 100)}px`
	return { width: size, height: size }
}

function useFileUploadForm(props: FileUploadProps, state: ReturnType<typeof useFileUploadState>) {
	const formField = useFormField({
		value: () => (state.uploadedFiles.value.length > 0 ? state.uploadedFiles.value.length : undefined),
		error: () => props.error,
		isRequired: () => props.isRequired === true,
	})
	return {
		formField,
		displayErrors: computed(() => [...(formField.error ? [formField.error] : []), ...state.displayErrors.value]),
	}
}

function exposeOf(
	refs: { rootRef: Ref<HTMLElement | null>; dropzoneRef: Ref<HTMLElement | null> },
	formField: ReturnType<typeof useFormField>,
	state: ReturnType<typeof useFileUploadState>,
): BaseFileUploadExpose {
	return {
		get rootRef() {
			return refs.rootRef.value
		},
		focus: () => refs.dropzoneRef.value?.focus(),
		blur: () => refs.dropzoneRef.value?.blur(),
		validate: formField.validate,
		reset: () => {
			state.clear()
			formField.reset()
		},
		retry: state.retry,
	}
}

export function useBaseFileUpload(props: FileUploadProps, emit: BaseFileUploadEmits) {
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const standard = useStandardBaseComponent('base-file-upload', props, FILE_UPLOAD_ELEMENTS)
	const fileInput = ref<HTMLInputElement | null>(null)
	const rootRef = ref<HTMLElement | null>(null)
	const dropzoneRef = ref<HTMLElement | null>(null)
	const state = useUploadState(props, emit)
	const { formField, displayErrors } = useFileUploadForm(props, state)
	const ids = { inputId: useId(), errorsId: useId() }

	return {
		...standard,
		ui: useUi(props, 'base-file-upload'),
		...useLeavingItems(state.uploadedFiles),
		isControlDisabled,
		fileInput,
		rootRef,
		dropzoneRef,
		...ids,
		uploadedFiles: state.uploadedFiles,
		isDragOver: state.isDragOver,
		announcement: state.announcement,
		handleRemove: state.handleRemove,
		handleRetry: state.retry,
		handleDragLeave: state.handleDragLeave,
		displayErrors,
		hasError: computed(() => displayErrors.value.length > 0),
		previewZoom: PREVIEW_ZOOM,
		previewStyle: computed(() => previewStyleOf(props)),
		formatHint: computed(() => formatAcceptHint(props.accept)),
		formatSize: (bytes: number): string => formatFileSize(bytes),
		fileIconName,
		...useDropzone(state, isControlDisabled, fileInput),
		exposed: exposeOf({ rootRef, dropzoneRef }, formField, state),
	}
}

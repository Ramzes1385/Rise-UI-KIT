import type { UploadedFile } from '@components/BaseFileUpload/model/BaseFileUpload.types'

export interface UseFileUploadStateOptions {
	getMaxSize: () => number
	getAccept: () => string
	getMaxCount: () => number
	onError: (message: string) => void
	onChange: (files: File[]) => void
	onRemove: (file: UploadedFile) => void
}

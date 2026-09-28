import { placeholderImage } from '@/stories/helpers'

export function imageFile(name: string, hue = 200): File {
	const svg = decodeURIComponent(placeholderImage({ width: 400, height: 250, hue }).split(',')[1]!)
	return new File([svg], name, { type: 'image/svg+xml' })
}

export function documentFile(name: string, sizeKb: number, type = 'application/pdf'): File {
	return new File([new Uint8Array(sizeKb * 1024)], name, { type })
}

export function dropData(files: File[]): DataTransfer {
	const data = new DataTransfer()
	for (const file of files) data.items.add(file)
	Object.defineProperty(data, 'files', { value: data.files })
	return data
}

export const UPLOAD_TIMEOUT = 6000

import { computed, shallowRef } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { describeSource } from './cryptoProSignFormat'
import { bytesToBase64, toBytes } from './cades/plugin'
import { formatFileSize } from '@utils/media/fileUtils'
import type { BaseCryptoProSignProps } from '../types/BaseCryptoProSign.types'

const DEFAULT_FILE_NAME = 'document'
const BASE64_TEXT = /^[\sA-Za-z0-9+/=]+$/
const PEM_ARMOR = /-----[^-]+-----/g

async function signatureFromFile(file: File): Promise<string> {
	const bytes = await toBytes(file)
	const text = new TextDecoder().decode(bytes).replace(PEM_ARMOR, '').trim()
	if (text && BASE64_TEXT.test(text)) return text.replace(/\s+/g, '')
	return bytesToBase64(bytes)
}

export function useCryptoProSignSource(props: BaseCryptoProSignProps) {
	const pickedFiles = shallowRef<File[]>([])
	const signatureFile = shallowRef<File | null>(null)
	const isBatch = computed(() => Boolean(props.isMultiple) && props.mode === 'sign' && props.data === undefined)
	const source = computed(() => (isBatch.value ? undefined : (props.data ?? pickedFiles.value[0])))
	const fileName = computed(() => {
		const value = source.value
		if (value instanceof File && value.name) return value.name
		return props.fileName || DEFAULT_FILE_NAME
	})
	const isHash = computed(() => source.value instanceof Blob && source.value.size > (props.hashThreshold ?? Infinity))
	return {
		source,
		isBatch,
		files: pickedFiles,
		hasHashFiles: computed(() => pickedFiles.value.some(file => file.size > (props.hashThreshold ?? Infinity))),
		fileName,
		isHash,
		hasSignature: computed(() => Boolean(props.signature) || signatureFile.value !== null),
		sourceText: computed(() => (props.data === undefined ? '' : describeSource(props.data, fileName.value, props.mode))),
		hashHint: computed(() => {
			const text = isBatch.value ? UI_CRYPTOPRO.HASH_HINT_BATCH : UI_CRYPTOPRO.HASH_HINT
			return formatMessage(text, { size: formatFileSize(props.hashThreshold ?? 0) })
		}),
		pickFile: (files: File[]): void => {
			pickedFiles.value = isBatch.value ? files : files.slice(0, 1)
		},
		removeFile: (removed?: { file: File }): void => {
			pickedFiles.value = isBatch.value && removed ? pickedFiles.value.filter(file => file !== removed.file) : []
		},
		pickSignature: (files: File[]): void => {
			signatureFile.value = files[0] ?? null
		},
		removeSignature: (): void => {
			signatureFile.value = null
		},
		readSignature: async (): Promise<string> => props.signature || (signatureFile.value ? signatureFromFile(signatureFile.value) : ''),
	}
}

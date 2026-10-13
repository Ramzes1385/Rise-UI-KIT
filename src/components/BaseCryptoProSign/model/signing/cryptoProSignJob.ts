import { markRaw } from 'vue'
import { warn } from '@/locales/warn'
import { readyPlugin } from '../cades/plugin'
import { signRequest } from '../cades/signing'
import { UI_WARNINGS } from '@/locales/messages'
import { base64ToBlob } from '../cryptoProSignFormat'
import { downloadFile } from '@utils/media/fileUtils'
import { toCryptoProError } from '@composables/crypto/useCryptoPro/core/errors'
import type { CryptoProError, CryptoProCertificate } from '@composables/crypto/useCryptoPro'
import type { CadesPlugin, CadesWindow } from '@composables/crypto/useCryptoPro/types/cadesplugin.types'
import type {
	CryptoProSignJob,
	CryptoProSignResult,
	BaseCryptoProSignProps,
	CryptoProSignActionContext,
} from '../../types/BaseCryptoProSign.types'

export function pluginError(error: unknown): CryptoProError {
	return markRaw(toCryptoProError(error, (window as CadesWindow).cadesplugin as CadesPlugin | undefined))
}

export async function ensureReady(context: CryptoProSignActionContext): Promise<boolean> {
	return context.isReady.value || context.check()
}

export async function signWith(
	props: BaseCryptoProSignProps,
	context: CryptoProSignActionContext,
	job: CryptoProSignJob,
): Promise<CryptoProSignResult> {
	const certificate = context.certificate.value as CryptoProCertificate
	const level = props.level ?? 'bes'
	const tsaAddress = props.tsaAddress ?? ''
	if (level !== 'bes' && !tsaAddress) warn(UI_WARNINGS.CRYPTOPRO_NO_TSA, { level })
	const { data, detached, isHash, coSignature, onProgress } = job
	const request = { data, thumbprint: certificate.thumbprint, detached, level, tsaAddress, isHash, coSignature, onProgress }
	const signature = await signRequest(readyPlugin().plugin, request)
	return { signature, detached, isHash, level, certificate, fileName: job.fileName, isCoSign: coSignature !== undefined }
}

export function downloadSignature(result: CryptoProSignResult | null): void {
	if (!result) return
	const url = URL.createObjectURL(base64ToBlob(result.signature))
	downloadFile(url, `${result.fileName}.sig`)
	setTimeout(() => URL.revokeObjectURL(url), 1000)
}

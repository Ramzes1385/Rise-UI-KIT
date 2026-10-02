import { warn } from '@/locales/warn'
import { readyPlugin } from './cades/plugin'
import { signRequest } from './cades/signing'
import { markRaw, ref, shallowRef } from 'vue'
import { formatMessage } from '@/locales/state'
import { base64ToBlob } from './cryptoProSignFormat'
import { downloadFile } from '@utils/media/fileUtils'
import { verifySignature } from './cades/verification'
import { UI_CRYPTOPRO, UI_WARNINGS } from '@/locales/messages'
import { toCryptoProError } from '@composables/crypto/useCryptoPro/core/errors'
import type { CadesPlugin, CadesWindow } from '@composables/crypto/useCryptoPro/types/cadesplugin.types'
import { CryptoProError, type CryptoProFailure, type CryptoProCertificate } from '@composables/crypto/useCryptoPro'
import type {
	CryptoProSignLevel,
	CryptoProSignActionState,
	CryptoProSignSource,
	CryptoProSignResult,
	CryptoProVerifyResult,
	BaseCryptoProSignEmits,
	BaseCryptoProSignProps,
	CryptoProSignActionContext,
} from '../types/BaseCryptoProSign.types'

function pluginError(error: unknown): CryptoProError {
	return markRaw(toCryptoProError(error, (window as CadesWindow).cadesplugin as CadesPlugin | undefined))
}

function useCryptoProSignActionState(emit: BaseCryptoProSignEmits) {
	const isBusy = ref(false)
	const progress = ref<number | null>(null)
	const actionError = shallowRef<CryptoProFailure | null>(null)
	const announcement = ref('')
	return {
		isBusy,
		progress,
		actionError,
		announcement,
		start(): void {
			isBusy.value = true
			actionError.value = null
			announcement.value = ''
		},
		finish(): void {
			isBusy.value = false
			progress.value = null
		},
		fail(error: unknown): void {
			const failure = pluginError(error)
			actionError.value = failure
			announcement.value = failure.message
			emit('error', failure)
		},
		onProgress(value: number): void {
			progress.value = value
		},
	}
}

async function ensureReady(context: CryptoProSignActionContext): Promise<boolean> {
	return context.isReady.value || context.check()
}

function signLevel(props: BaseCryptoProSignProps): CryptoProSignLevel {
	return props.level ?? 'bes'
}

async function signWith(
	props: BaseCryptoProSignProps,
	context: CryptoProSignActionContext,
	state: CryptoProSignActionState,
): Promise<CryptoProSignResult> {
	const certificate = context.certificate.value as CryptoProCertificate
	const isHash = context.isHash.value
	const detached = isHash || context.isDetached.value
	const level = signLevel(props)
	const tsaAddress = props.tsaAddress ?? ''
	if (level !== 'bes' && !tsaAddress) warn(UI_WARNINGS.CRYPTOPRO_NO_TSA, { level })
	const data = context.source.value as CryptoProSignSource
	const request = { data, thumbprint: certificate.thumbprint, detached, level, tsaAddress, isHash, onProgress: state.onProgress }
	const signature = await signRequest(readyPlugin().plugin, request)
	return { signature, detached, isHash, level, certificate, fileName: context.fileName.value }
}

async function verifyWith(
	context: CryptoProSignActionContext,
	state: CryptoProSignActionState,
	signature: string,
): Promise<CryptoProVerifyResult> {
	const data = context.source.value
	const isHash = context.isHash.value
	const base = { isDetached: data !== undefined, isHash }
	try {
		const signers = await verifySignature(readyPlugin().plugin, { signature, data, isHash, onProgress: state.onProgress })
		return { ...base, isValid: true, signers, error: null }
	} catch (error) {
		if (error instanceof CryptoProError) throw error
		return { ...base, isValid: false, signers: [], error: pluginError(error) }
	}
}

async function guarded<T>(state: CryptoProSignActionState, action: () => Promise<T | null>): Promise<T | null> {
	if (state.isBusy.value) return null
	state.start()
	try {
		return await action()
	} catch (error) {
		state.fail(error)
		return null
	} finally {
		state.finish()
	}
}

function downloadSignature(result: CryptoProSignResult | null): void {
	if (!result) return
	const url = URL.createObjectURL(base64ToBlob(result.signature))
	downloadFile(url, `${result.fileName}.sig`)
	setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function useCryptoProSignActions(props: BaseCryptoProSignProps, emit: BaseCryptoProSignEmits, context: CryptoProSignActionContext) {
	const state = useCryptoProSignActionState(emit)
	const signResult = shallowRef<CryptoProSignResult | null>(null)
	const verifyResult = shallowRef<CryptoProVerifyResult | null>(null)

	const sign = (): Promise<CryptoProSignResult | null> =>
		guarded(state, async () => {
			signResult.value = null
			if (!context.certificate.value || context.source.value === undefined || !(await ensureReady(context))) return null
			const result = await signWith(props, context, state)
			signResult.value = result
			state.announcement.value = formatMessage(UI_CRYPTOPRO.SIGNED, { name: `${result.fileName}.sig` })
			emit('signed', result)
			return result
		})

	const verify = (): Promise<CryptoProVerifyResult | null> =>
		guarded(state, async () => {
			verifyResult.value = null
			const signature = await context.readSignature()
			if (!signature || !(await ensureReady(context))) return null
			const result = await verifyWith(context, state, signature)
			verifyResult.value = result
			state.announcement.value = result.isValid ? UI_CRYPTOPRO.VALID : UI_CRYPTOPRO.INVALID
			emit('verified', result)
			return result
		})

	return { ...state, signResult, verifyResult, sign, verify, download: (): void => downloadSignature(signResult.value) }
}

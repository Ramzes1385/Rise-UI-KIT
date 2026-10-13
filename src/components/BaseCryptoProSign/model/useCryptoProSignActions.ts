import { ref, shallowRef } from 'vue'
import { readyPlugin } from './cades/plugin'
import { formatMessage } from '@/locales/state'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { verifySignature } from './cades/verification'
import { CryptoProError, type CryptoProFailure } from '@composables/crypto/useCryptoPro'
import { downloadSignature, ensureReady, pluginError, signWith } from './signing/cryptoProSignJob'
import type {
	CryptoProSignJob,
	CryptoProSignResult,
	CryptoProVerifyResult,
	BaseCryptoProSignEmits,
	BaseCryptoProSignProps,
	CryptoProSignActionState,
	CryptoProSignActionContext,
} from '../types/BaseCryptoProSign.types'

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

export async function guarded<T>(state: CryptoProSignActionState, action: () => Promise<T | null>): Promise<T | null> {
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

async function buildJob(
	props: BaseCryptoProSignProps,
	context: CryptoProSignActionContext,
	onProgress: (progress: number) => void,
): Promise<CryptoProSignJob | null> {
	const source = context.source.value
	const isHash = context.isHash.value
	const base = { data: source ?? '', fileName: context.fileName.value, isHash, onProgress }
	if (props.mode !== 'cosign') {
		return source === undefined ? null : { ...base, detached: isHash || context.isDetached.value }
	}
	const coSignature = await context.readSignature()
	return coSignature ? { ...base, detached: source !== undefined, coSignature } : null
}

export function useCryptoProSignActions(props: BaseCryptoProSignProps, emit: BaseCryptoProSignEmits, context: CryptoProSignActionContext) {
	const state = useCryptoProSignActionState(emit)
	const signResult = shallowRef<CryptoProSignResult | null>(null)
	const verifyResult = shallowRef<CryptoProVerifyResult | null>(null)

	const sign = (): Promise<CryptoProSignResult | null> =>
		guarded(state, async () => {
			signResult.value = null
			const job = await buildJob(props, context, state.onProgress)
			if (!context.certificate.value || !job || !(await ensureReady(context))) return null
			const result = await signWith(props, context, job)
			signResult.value = result
			const text = result.isCoSign ? UI_CRYPTOPRO.COSIGNED : UI_CRYPTOPRO.SIGNED
			state.announcement.value = formatMessage(text, { name: `${result.fileName}.sig` })
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

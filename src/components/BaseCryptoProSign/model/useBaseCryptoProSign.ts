import { useUi } from '@composables/base/useUi'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { computed, onMounted, ref, watch } from 'vue'
import { useCryptoProSignSource } from './useCryptoProSignSource'
import { useCryptoProSignStatus } from './useCryptoProSignStatus'
import { useCryptoProSignActions } from './useCryptoProSignActions'
import { useCryptoProSignBatch } from './signing/useCryptoProSignBatch'
import { useCryptoProSignCertificates } from './useCryptoProSignCertificates'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useCryptoPro, type CryptoProFailure } from '@composables/crypto/useCryptoPro'
import type {
	CryptoProSignMode,
	CryptoProSignRunParts,
	BaseCryptoProSignProps,
	BaseCryptoProSignEmits,
} from '../types/BaseCryptoProSign.types'

function runLabel(mode: CryptoProSignMode): string {
	if (mode === 'verify') return UI_CRYPTOPRO.VERIFY
	return mode === 'cosign' ? UI_CRYPTOPRO.COSIGN : UI_CRYPTOPRO.SIGN
}

function regionLabel(mode: CryptoProSignMode): string {
	if (mode === 'verify') return UI_CRYPTOPRO.REGION_VERIFY
	return mode === 'cosign' ? UI_CRYPTOPRO.REGION_COSIGN : UI_CRYPTOPRO.REGION_SIGN
}

function useDetached(props: BaseCryptoProSignProps, emit: BaseCryptoProSignEmits, isHash: () => boolean) {
	const local = ref(props.detached ?? false)
	watch(
		() => props.detached,
		value => {
			local.value = value ?? false
		},
	)
	const isDetached = computed(() => isHash() || local.value)
	return {
		isDetached,
		detachedValue: computed(() => (isDetached.value ? 'detached' : 'attached')),
		detachedOptions: computed(() => [
			{ value: 'attached', label: UI_CRYPTOPRO.ATTACHED, isDisabled: isHash() },
			{ value: 'detached', label: UI_CRYPTOPRO.DETACHED },
		]),
		selectDetached: (value: string | number): void => {
			local.value = value === 'detached'
			emit('update:detached', local.value)
		},
	}
}

function useCryptoProLoader(props: BaseCryptoProSignProps, emit: BaseCryptoProSignEmits) {
	const crypto = useCryptoPro({ scriptUrl: () => props.scriptUrl, timeout: props.timeout, checkOnMount: false })
	const report = (error: CryptoProFailure | null): void => {
		if (error) emit('error', error)
	}
	async function refresh(): Promise<void> {
		const isReady = await crypto.check()
		if (!isReady) return report(crypto.status.error)
		if (props.mode === 'verify') return
		await crypto.getCertificates().catch(() => undefined)
		if (crypto.error.value?.code !== 'noCertificates') report(crypto.error.value)
	}
	onMounted(() => void refresh())
	return { crypto, refresh }
}

function useRunControl(props: BaseCryptoProSignProps, parts: CryptoProSignRunParts) {
	const isVerify = computed(() => props.mode === 'verify')
	const isCoSign = computed(() => props.mode === 'cosign')
	const hasInput = computed(() => {
		if (isCoSign.value) return parts.hasSignature.value
		return parts.isBatch.value ? parts.hasFiles.value : parts.hasSource.value
	})
	const run = (): void => {
		if (isVerify.value) void parts.verify()
		else if (parts.isBatch.value) void parts.signAll()
		else void parts.sign()
	}
	const canRun = computed(() => {
		if (props.isDisabled || parts.isBusy.value || !parts.isReady.value) return false
		return isVerify.value ? parts.hasSignature.value : parts.isSelectedUsable.value && hasInput.value
	})
	return {
		isVerify,
		isCoSign,
		run,
		canRun,
		needsSignature: computed(() => isVerify.value || isCoSign.value),
		runLabel: computed(() => runLabel(props.mode ?? 'sign')),
		regionLabel: computed(() => regionLabel(props.mode ?? 'sign')),
	}
}

export function useBaseCryptoProSign(props: BaseCryptoProSignProps, emit: BaseCryptoProSignEmits) {
	const { crypto, refresh } = useCryptoProLoader(props, emit)
	const source = useCryptoProSignSource(props)
	const certificates = useCryptoProSignCertificates(props, emit, crypto.certificates)
	const detached = useDetached(props, emit, () => source.isHash.value)
	const actionContext = {
		isReady: crypto.isReady,
		check: crypto.check,
		source: source.source,
		fileName: source.fileName,
		isHash: source.isHash,
		isDetached: detached.isDetached,
		certificate: certificates.selectedCertificate,
		readSignature: source.readSignature,
	}
	const actions = useCryptoProSignActions(props, emit, actionContext)
	const batch = useCryptoProSignBatch(props, emit, { context: actionContext, batch: { files: source.files }, state: actions })
	return {
		...useStandardBaseComponent('base-crypto-pro-sign', props, ['root']),
		ui: useUi(props, 'base-crypto-pro-sign'),
		...useCryptoProSignStatus(crypto.status),
		...source,
		...certificates,
		...detached,
		...actions,
		...batch,
		...useRunControl(props, {
			isReady: crypto.isReady,
			isBusy: actions.isBusy,
			hasSignature: source.hasSignature,
			hasSource: computed(() => source.source.value !== undefined),
			isBatch: source.isBatch,
			hasFiles: computed(() => source.files.value.length > 0),
			isSelectedUsable: certificates.isSelectedUsable,
			verify: actions.verify,
			sign: actions.sign,
			signAll: batch.signAll,
		}),
		status: crypto.status,
		isReady: crypto.isReady,
		isLoadingCertificates: crypto.isLoading,
		hasNoCertificates: computed(() => crypto.isReady.value && !crypto.isLoading.value && crypto.certificates.value.length === 0),
		progressPercent: computed(() => Math.round((actions.progress.value ?? 0) * 100)),
		refresh,
	}
}

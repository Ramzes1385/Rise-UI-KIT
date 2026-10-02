import { UI_CRYPTOPRO } from '@/locales/messages'
import { computed, onMounted, ref, watch } from 'vue'
import { useCryptoProSignSource } from './useCryptoProSignSource'
import { useCryptoProSignStatus } from './useCryptoProSignStatus'
import { useCryptoProSignActions } from './useCryptoProSignActions'
import { useCryptoProSignCertificates } from './useCryptoProSignCertificates'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useCryptoPro, type CryptoProFailure } from '@composables/crypto/useCryptoPro'
import type { BaseCryptoProSignProps, BaseCryptoProSignEmits } from '../types/BaseCryptoProSign.types'

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

export function useBaseCryptoProSign(props: BaseCryptoProSignProps, emit: BaseCryptoProSignEmits) {
	const { crypto, refresh } = useCryptoProLoader(props, emit)
	const source = useCryptoProSignSource(props)
	const certificates = useCryptoProSignCertificates(props, emit, crypto.certificates)
	const detached = useDetached(props, emit, () => source.isHash.value)
	const actions = useCryptoProSignActions(props, emit, {
		isReady: crypto.isReady,
		check: crypto.check,
		source: source.source,
		fileName: source.fileName,
		isHash: source.isHash,
		isDetached: detached.isDetached,
		certificate: certificates.selectedCertificate,
		readSignature: source.readSignature,
	})
	const isVerify = computed(() => props.mode === 'verify')
	const canRun = computed(() => {
		if (props.isDisabled || actions.isBusy.value || !crypto.isReady.value) return false
		return isVerify.value ? source.hasSignature.value : certificates.isSelectedUsable.value && source.source.value !== undefined
	})
	return {
		...useStandardBaseComponent('base-crypto-pro-sign', props, ['root']),
		...useCryptoProSignStatus(crypto.status),
		...source,
		...certificates,
		...detached,
		...actions,
		status: crypto.status,
		isReady: crypto.isReady,
		isLoadingCertificates: crypto.isLoading,
		hasNoCertificates: computed(() => crypto.isReady.value && !crypto.isLoading.value && crypto.certificates.value.length === 0),
		isVerify,
		canRun,
		progressPercent: computed(() => Math.round((actions.progress.value ?? 0) * 100)),
		regionLabel: computed(() => (isVerify.value ? UI_CRYPTOPRO.REGION_VERIFY : UI_CRYPTOPRO.REGION_SIGN)),
		refresh,
	}
}

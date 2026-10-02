import { computed, ref, watch, type Ref } from 'vue'
import { certificateOption, isUsable } from './cryptoProSignFormat'
import type { CryptoProCertificate } from '@composables/crypto/useCryptoPro'
import type { BaseCryptoProSignEmits, BaseCryptoProSignProps } from '../types/BaseCryptoProSign.types'

export function useCryptoProSignCertificates(
	props: BaseCryptoProSignProps,
	emit: BaseCryptoProSignEmits,
	certificates: Readonly<Ref<CryptoProCertificate[]>>,
) {
	const localThumbprint = ref(props.thumbprint ?? '')
	watch(
		() => props.thumbprint,
		value => {
			localThumbprint.value = value ?? ''
		},
	)
	const select = (value: string | number | (string | number)[]): void => {
		localThumbprint.value = String(value)
		emit('update:thumbprint', localThumbprint.value)
	}
	const selectedCertificate = computed(() => certificates.value.find(item => item.thumbprint === localThumbprint.value) ?? null)
	watch(certificates, list => {
		const first = list.find(item => isUsable(item, new Date()))
		if (!selectedCertificate.value && first) select(first.thumbprint)
	})
	return {
		thumbprintValue: localThumbprint,
		selectedCertificate,
		isSelectedUsable: computed(() => selectedCertificate.value !== null && isUsable(selectedCertificate.value, new Date())),
		certificateOptions: computed(() => certificates.value.map(item => certificateOption(item, new Date()))),
		selectCertificate: select,
	}
}

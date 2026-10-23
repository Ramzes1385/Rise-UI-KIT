import { useCryptoPro } from '@composables/crypto/useCryptoPro'
import { computed, onMounted, reactive, ref, useId } from 'vue'

const modes = [
	{ value: 'attached', label: 'Присоединённая' },
	{ value: 'detached', label: 'Отсоединённая' },
]

export function setup() {
	const { certificates, error, isSigning, check, getCertificates, sign } = useCryptoPro({ checkOnMount: false })
	const form = reactive({ text: 'Договор поставки № 42 от 2 октября 2026 г.', thumbprint: '', mode: 'attached' })
	const signature = ref('')
	const certificateName = useId()

	const certificateOptions = computed(() =>
		certificates.value.map(certificate => ({
			value: certificate.thumbprint,
			label: certificate.organization ? `${certificate.name}, ${certificate.organization}` : certificate.name,
			isDisabled: !certificate.isValid || !certificate.hasPrivateKey,
		})),
	)

	onMounted(async () => {
		await check()
		const list = await getCertificates().catch(() => [])
		form.thumbprint = list.find(certificate => certificate.isValid && certificate.hasPrivateKey)?.thumbprint ?? ''
	})

	async function signText(): Promise<void> {
		signature.value = ''
		signature.value = await sign(form.text, { thumbprint: form.thumbprint, detached: form.mode === 'detached' }).catch(() => '')
	}

	return { modes, certificateName, error, isSigning, form, signature, certificateOptions, signText }
}

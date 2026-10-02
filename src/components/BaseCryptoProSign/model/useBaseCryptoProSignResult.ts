import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { formatDate } from './cryptoProSignFormat'
import type { CryptoProVerifySigner } from '../types/BaseCryptoProSign.types'
import type { CryptoProSignerView, BaseCryptoProSignResultProps } from '../types/BaseCryptoProSignParts.types'

function signerLines(signer: CryptoProVerifySigner): string[] {
	const inn = signer.inn ? formatMessage(UI_CRYPTOPRO.INN, { inn: signer.inn }) : ''
	const certificate = signer.isCertificateValid
		? formatMessage(UI_CRYPTOPRO.CERTIFICATE_VALID, { date: formatDate(signer.validTo) })
		: UI_CRYPTOPRO.CERTIFICATE_NOT_VALID
	return [
		[signer.organization, inn].filter(Boolean).join(' · '),
		signer.signingTime ? formatMessage(UI_CRYPTOPRO.SIGNED_AT, { date: formatDate(signer.signingTime, true) }) : '',
		signer.timeStampTime ? formatMessage(UI_CRYPTOPRO.TIMESTAMP_AT, { date: formatDate(signer.timeStampTime, true) }) : '',
		certificate,
	].filter(Boolean)
}

export function useBaseCryptoProSignResult(props: BaseCryptoProSignResultProps) {
	return {
		signedText: computed(() =>
			props.signResult ? formatMessage(UI_CRYPTOPRO.SIGNED, { name: `${props.signResult.fileName}.sig` }) : '',
		),
		verifyTitle: computed(() => (props.verifyResult?.isValid ? UI_CRYPTOPRO.VALID : UI_CRYPTOPRO.INVALID)),
		signers: computed((): CryptoProSignerView[] =>
			(props.verifyResult?.signers ?? []).map((signer, index) => ({
				key: `${signer.thumbprint}-${index}`,
				name: signer.name,
				lines: signerLines(signer),
				isCertificateValid: signer.isCertificateValid,
			})),
		),
	}
}

export const CARD_FACE_DEFAULT_BACKGROUND = 'linear-gradient(135deg, var(--rise-color-neutral-700), var(--rise-color-neutral-950))'

export const CARD_BRAND_BACKGROUNDS: Readonly<Record<string, string>> = {
	visa: 'linear-gradient(135deg, var(--rise-color-info-700), var(--rise-color-info-950))',
	mastercard: 'linear-gradient(135deg, var(--rise-color-neutral-800), var(--rise-color-primary-900))',
	mir: 'linear-gradient(135deg, var(--rise-color-success-700), var(--rise-color-info-900))',
	maestro: 'linear-gradient(135deg, var(--rise-color-info-800), var(--rise-color-error-900))',
	amex: 'linear-gradient(135deg, var(--rise-color-info-700), var(--rise-color-info-900))',
	unionpay: 'linear-gradient(135deg, var(--rise-color-error-800), var(--rise-color-info-900))',
	jcb: 'linear-gradient(135deg, var(--rise-color-success-800), var(--rise-color-info-900))',
	discover: 'linear-gradient(135deg, var(--rise-color-warning-800), var(--rise-color-primary-950))',
	diners: 'linear-gradient(135deg, var(--rise-color-neutral-600), var(--rise-color-neutral-900))',
}

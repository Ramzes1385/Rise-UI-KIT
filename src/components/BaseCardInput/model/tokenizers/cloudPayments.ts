import { UI_CARD } from '@/locales/messages'
import type { CardData, CardTokenizer } from '../../types/BaseCardInput.types'
import type {
	CloudPaymentsCardFields,
	CloudPaymentsCheckout,
	CloudPaymentsTokenizerOptions,
	CloudPaymentsWindow,
} from '../../types/cloudPayments.types'

const YEAR_DIGITS = 100

function cardFields(data: CardData): CloudPaymentsCardFields {
	const fields: CloudPaymentsCardFields = {
		cardNumber: data.number,
		expDateMonth: String(data.expiry.month).padStart(2, '0'),
		expDateYear: String(data.expiry.year % YEAR_DIGITS).padStart(2, '0'),
		cvv: data.code,
	}
	return data.holder ? { ...fields, name: data.holder } : fields
}

function errorCodes(reason: unknown): string[] {
	if (typeof reason === 'string') return [reason]
	if (reason && typeof reason === 'object') return Object.values(reason).filter((value): value is string => typeof value === 'string')
	return []
}

function tokenizeError(reason: unknown): Error {
	if (reason instanceof Error) return reason
	return new Error(UI_CARD.TOKENIZE_FAILED, { cause: errorCodes(reason) })
}

export function createCloudPaymentsTokenizer(options: CloudPaymentsTokenizerOptions): CardTokenizer {
	let checkout: CloudPaymentsCheckout | null = null
	const getCheckout = (): CloudPaymentsCheckout | null => {
		const Checkout = options.Checkout ?? (window as CloudPaymentsWindow).cp?.Checkout
		if (!checkout && Checkout) checkout = new Checkout({ publicId: options.publicId })
		return checkout
	}
	return async data => {
		const instance = getCheckout()
		if (!instance) throw new Error(UI_CARD.TOKENIZER_UNAVAILABLE)
		try {
			return await instance.createPaymentCryptogram(cardFields(data))
		} catch (reason) {
			throw tokenizeError(reason)
		}
	}
}

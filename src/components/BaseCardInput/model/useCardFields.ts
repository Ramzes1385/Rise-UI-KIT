import { computed, reactive, ref } from 'vue'
import { cardFieldError } from './card/cardErrors'
import type { CardBrand } from '@utils/form/cardUtils'
import { CARD_INPUT_FIELDS } from '../types/BaseCardInput.types'
import { cardDigits, getCardBrand, parseCardExpiry } from '@utils/form/cardUtils'
import type { BaseCardInputProps, CardCheckContext, CardData, CardInputField, CardInputValue } from '../types/BaseCardInput.types'

function emptyFlags(): Record<CardInputField, boolean> {
	return { number: false, expiry: false, code: false, holder: false }
}

function mapFields<T>(map: (field: CardInputField) => T): Record<CardInputField, T> {
	return { number: map('number'), expiry: map('expiry'), code: map('code'), holder: map('holder') }
}

function checkContext(props: BaseCardInputProps, brand: CardBrand | undefined): CardCheckContext {
	const acceptedIds = props.brands ? new Set(props.brands.map(item => (typeof item === 'string' ? item : item.id))) : null
	return { brand, options: { brands: props.brands }, acceptedIds, hasHolder: props.hasHolder !== false, now: new Date() }
}

function cardSummary(
	texts: Record<CardInputField, string>,
	errors: Record<CardInputField, string | null>,
	props: BaseCardInputProps,
): Pick<CardInputValue, 'last4' | 'expiry' | 'holder'> {
	const expiry = errors.expiry === null ? parseCardExpiry(texts.expiry) : undefined
	return {
		last4: errors.number === null ? cardDigits(texts.number).slice(-4) : '',
		expiry: expiry ?? null,
		holder: props.hasHolder === false ? '' : texts.holder.trim(),
	}
}

export function useCardFields(props: BaseCardInputProps) {
	const texts = reactive<Record<CardInputField, string>>({ number: '', expiry: '', code: '', holder: props.modelValue?.holder ?? '' })
	const touched = reactive(emptyFlags())
	const isValidated = ref(false)
	const options = computed(() => ({ brands: props.brands }))
	const brand = computed(() => getCardBrand(texts.number, options.value))
	const context = computed<CardCheckContext>(() => checkContext(props, brand.value))
	const rawErrors = computed(() => mapFields(field => cardFieldError(field, texts[field], context.value)))
	const isShown = (field: CardInputField): boolean =>
		touched[field] && (texts[field] !== '' || isValidated.value || Boolean(props.isRequired))
	const isComplete = computed(() => CARD_INPUT_FIELDS.every(field => rawErrors.value[field] === null))
	const summary = computed<CardInputValue>(() => ({
		...cardSummary(texts, rawErrors.value, props),
		brand: brand.value?.id ?? null,
		isComplete: isComplete.value,
	}))
	return {
		texts,
		brand,
		options,
		rawErrors,
		summary,
		errors: computed(() => mapFields(field => (isShown(field) ? (rawErrors.value[field] ?? undefined) : undefined))),
		touch(field: CardInputField): void {
			touched[field] = true
		},
		validate(): boolean {
			Object.assign(
				touched,
				mapFields(() => true),
			)
			isValidated.value = true
			return isComplete.value
		},
		reset(): void {
			Object.assign(
				texts,
				mapFields(() => ''),
			)
			Object.assign(touched, emptyFlags())
			isValidated.value = false
		},
		getCardData(): CardData | null {
			const { expiry, holder } = summary.value
			if (!isComplete.value || expiry === null) return null
			return { number: cardDigits(texts.number), expiry, code: texts.code, holder, brand: brand.value }
		},
	}
}

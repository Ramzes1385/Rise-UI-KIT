import { computed, useSlots } from 'vue'
import { UI_CARD } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import type { BaseBankCardProps } from '../types/BaseBankCard.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { cardBrandName, CARD_FACE_DOT, cardFaceBackground } from '@utils/form/cardFaceUtils'
import { CARD_BRANDS, type CardBrand, type CardExpiry, parseCardExpiry } from '@utils/form/cardUtils'

const MASK_LENGTH = 4
const YEAR_DIGITS = 100

function resolveBrand(brand: BaseBankCardProps['brand']): CardBrand | undefined {
	if (!brand) return undefined
	return typeof brand === 'string' ? CARD_BRANDS.find(item => item.id === brand) : brand
}

function resolveExpiry(expiry: BaseBankCardProps['expiry']): CardExpiry | undefined {
	if (!expiry) return undefined
	return typeof expiry === 'string' ? parseCardExpiry(expiry) : expiry
}

function formatExpiry(expiry: CardExpiry): string {
	return `${String(expiry.month).padStart(2, '0')}/${String(expiry.year % YEAR_DIGITS).padStart(2, '0')}`
}

function isPastExpiry(expiry: CardExpiry | undefined, now = new Date()): boolean {
	if (!expiry) return false
	return expiry.year * 12 + expiry.month - 1 < now.getFullYear() * 12 + now.getMonth()
}

export function useBaseBankCard(props: BaseBankCardProps) {
	const slots = useSlots()
	const hasCover = computed(() => Boolean(props.cover || slots.cover))
	const brand = computed(() => resolveBrand(props.brand))
	const expiry = computed(() => resolveExpiry(props.expiry))
	const expiryText = computed(() => (expiry.value ? formatExpiry(expiry.value) : ''))
	const isExpired = computed(() => props.isExpired ?? isPastExpiry(expiry.value))
	const summary = computed(() => {
		const name = brand.value ? cardBrandName(brand.value) : UI_CARD.SAVED_CARD
		const parts = [formatMessage(UI_CARD.SAVED_ENDING, { brand: name, last4: props.last4 ?? '' })]
		if (expiryText.value)
			parts.push(formatMessage(isExpired.value ? UI_CARD.SAVED_EXPIRED : UI_CARD.SAVED_EXPIRES, { date: expiryText.value }))
		return parts.join(', ')
	})
	return {
		...useStandardBaseComponent('base-bank-card', props, ['root', 'brand', 'number', 'expiry', 'label']),
		ui: useUi(props, 'base-bank-card'),
		brand,
		expiryText,
		isExpired,
		summary,
		maskedNumber: computed(() => `${CARD_FACE_DOT.repeat(MASK_LENGTH)} ${props.last4 ?? ''}`),
		hasCover,
		faceStyle: computed(() =>
			props.isCompact && !hasCover.value ? undefined : { '--base-bank-card-bg': cardFaceBackground(brand.value, props.background) },
		),
	}
}

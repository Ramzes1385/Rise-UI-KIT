import { computed, ref } from 'vue'
import { UI_CARD } from '@/locales/messages'
import { cardDigits } from '@utils/form/cardUtils'
import type { useCardFields } from '../useCardFields'
import type { BaseCardInputProps, CardInputField } from '../../types/BaseCardInput.types'
import { CARD_FACE_DOT, cardFaceBackground, maskedCardNumber } from '@utils/form/cardFaceUtils'

export function useCardPreview(props: BaseCardInputProps, fields: ReturnType<typeof useCardFields>) {
	const focused = ref<CardInputField | null>(null)
	const view = computed(() => {
		if (!props.hasPreview) return null
		const brand = fields.brand.value
		return {
			brand,
			number: maskedCardNumber(cardDigits(fields.texts.number), brand),
			holder: fields.texts.holder.trim() || UI_CARD.HOLDER_PLACEHOLDER,
			expiry: fields.texts.expiry || UI_CARD.EXPIRY_PLACEHOLDER,
			code: fields.texts.code ? CARD_FACE_DOT.repeat(fields.texts.code.length) : (brand?.code.name ?? UI_CARD.CODE),
			hasHolder: props.hasHolder !== false,
			isFlipped: focused.value === 'code',
			style: { '--base-card-input-face-bg': cardFaceBackground(brand, props.previewBackground) },
		}
	})
	return {
		view,
		focus(field: CardInputField): void {
			focused.value = field
		},
		blur(): void {
			focused.value = null
		},
	}
}

import { computed } from 'vue'
import type { CardBrandMarkProps } from '../types/cardBrandMark.types'
import { cardBrandName, CARD_BRAND_ICON_PATHS } from '@utils/form/cardFaceUtils'

export function useCardBrandMark(props: CardBrandMarkProps) {
	return {
		image: computed(() => props.brandIcons?.[props.brand.id]),
		path: computed(() => CARD_BRAND_ICON_PATHS[props.brand.id]),
		name: computed(() => cardBrandName(props.brand)),
	}
}

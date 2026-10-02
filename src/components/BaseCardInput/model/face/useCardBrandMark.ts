import { computed } from 'vue'
import { cardBrandName } from '../card/cardErrors'
import type { CardBrandMarkProps } from '../../types/cardFace.types'
import { CARD_BRAND_ICON_PATHS } from '../../types/cardBrandIcons.types'

export function useCardBrandMark(props: CardBrandMarkProps) {
	return {
		image: computed(() => props.brandIcons?.[props.brand.id]),
		path: computed(() => CARD_BRAND_ICON_PATHS[props.brand.id]),
		name: computed(() => cardBrandName(props.brand)),
	}
}

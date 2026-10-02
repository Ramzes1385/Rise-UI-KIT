import type { RatingBounds, RatingProps } from '../types/BaseRating.types'
import { countProp, finiteProp, positiveProp } from '@utils/form/numberPropUtils'

const COMPONENT = 'BaseRating'
const DEFAULT_MAX = 5
const DEFAULT_STEP = 1

export function ratingBounds(props: RatingProps): RatingBounds {
	const max = countProp({ component: COMPONENT, prop: 'max', value: props.max, fallback: DEFAULT_MAX })
	const step = positiveProp({ component: COMPONENT, prop: 'step', value: props.step, fallback: DEFAULT_STEP })
	const value = finiteProp({ component: COMPONENT, prop: 'modelValue', value: props.modelValue, fallback: 0 })
	return { max, step, value: Math.max(0, Math.min(max, value)) }
}

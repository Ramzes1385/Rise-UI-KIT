import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

export interface BaseComponentProps<V extends string = string, K extends string = string> {
	variant?: V
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	color?: CustomColor
	customClass?: CustomClassProp<K>
}

import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

export interface UseBaseComponentOptions {
	block: string
	getVariant: () => string | undefined
	getSizeScale: () => number
	getColor: () => CustomColor | undefined
	getClass: () => CustomClassProp | undefined
	elementKeys?: string[]
}

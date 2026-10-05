import { useUi } from '@composables/base/useUi'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { BaseSplitButtonProps } from '../types/BaseSplitButton.types'

export function useBaseSplitButton(props: BaseSplitButtonProps) {
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'main', 'toggle'] }),
		ui: useUi(props, 'base-split-button'),
	}
}

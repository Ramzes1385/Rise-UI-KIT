/** Composable: логика BaseFab — кнопка или ссылка */
import { computed } from 'vue'
import type { BaseFabProps } from '../types/BaseFab.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'

export function useBaseFab(props: BaseFabProps) {
	const isLink = computed(() => Boolean(props.to || props.href))

	return {
		...useStandardBaseComponent('base-fab', props, ['root', 'icon', 'label']),
		isLink,
		/** Ссылка: адрес и отключение BaseLink; кнопка: type и disabled */
		elementProps: computed(() =>
			isLink.value
				? { to: props.to, href: props.href, isDisabled: props.isDisabled }
				: { type: 'button', disabled: props.isDisabled || undefined },
		),
	}
}

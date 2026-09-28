import { computed } from 'vue'
import { resolveLink, useLinkComponent } from '@composables/useLink'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseLinkEmits, BaseLinkProps } from '../types/BaseLink.types'

export function useBaseLink(props: BaseLinkProps, emit: BaseLinkEmits) {
	const appLinkComponent = useLinkComponent()
	const link = computed(() =>
		resolveLink(
			{ to: props.to, href: props.href, target: props.target, rel: props.rel, isDisabled: props.isDisabled },
			props.linkComponent ?? appLinkComponent,
		),
	)

	return {
		...useStandardBaseComponent('base-link', props, ['root', 'external']),
		link,
		isNewTab: computed(() => link.value.hasTarget && props.target === '_blank'),
		handleClick(event: MouseEvent): void {
			if (!link.value.hasTarget) {
				event.preventDefault()
				return
			}
			emit('click', event)
		},
	}
}

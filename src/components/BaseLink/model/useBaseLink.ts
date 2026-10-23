import { computed } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { BaseLinkEmits, BaseLinkProps } from '../types/BaseLink.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { resolveLink, useLinkComponent } from '@composables/interaction/useLink'

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
		ui: useUi(props, 'base-link'),
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

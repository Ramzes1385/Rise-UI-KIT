import { computed, ref } from 'vue'
import { formatMessage } from '@/locales'
import { useUi } from '@composables/base/useUi'
import { UI_ARIA, UI_TEXT } from '@/locales/messages'
import { calcIconScale } from '@utils/media/iconUtils'
import { useClickable } from '@composables/interaction/useClickable'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseBadgeEmits, BaseBadgeProps } from '../types/BaseBadge.types'

export function useBaseBadge(props: BaseBadgeProps, emit: BaseBadgeEmits) {
	const clickable = useClickable({ event: 'click', isDisabled: () => Boolean(props.isDisabled) })

	return {
		...useStandardBaseComponent('base-badge', props, ['root', 'text', 'remove']),
		ui: useUi(props, 'base-badge'),
		...clickable,
		statusClass: computed(() => (props.status && props.status !== 'primary' ? `base-badge--status-${props.status}` : '')),
		dotAttributes: computed(() => {
			if (!props.isDot || clickable.isClickable.value) return {}
			return props.label ? { role: 'img', 'aria-label': props.label } : { 'aria-hidden': 'true' as const }
		}),
		resolvedRemoveLabel: computed(
			() => props.removeLabel ?? (props.label ? formatMessage(UI_ARIA.TAG_REMOVE, { name: props.label }) : UI_TEXT.DELETE),
		),
		removeIconScale: computed(() => calcIconScale('xs', props.sizeScale)),
		removeButton: ref<HTMLButtonElement | null>(null),
		handleClick: (event: MouseEvent) => {
			if (!props.isDisabled) emit('click', event)
		},
		handleRemove: (event: MouseEvent) => {
			if (!props.isDisabled) emit('remove', event)
		},
	}
}

import { warn } from '@/locales/warn'
import { formatMessage } from '@/locales'
import { computed, ref, watch } from 'vue'
import { useUi } from '@composables/base/useUi'
import { calcIconScale } from '@utils/media/iconUtils'
import { UI_ARIA, UI_TEXT, UI_WARNINGS } from '@/locales/messages'
import { useClickable } from '@composables/interaction/useClickable'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseBadgeEmits, BaseBadgeProps } from '../types/BaseBadge.types'

let isDotWarned = false

function warnUnnamedDot(isUnnamed: boolean): void {
	if (!isUnnamed || isDotWarned) return
	isDotWarned = true
	warn(UI_WARNINGS.BADGE_DOT_WITHOUT_LABEL)
}

export function useBaseBadge(props: BaseBadgeProps, emit: BaseBadgeEmits) {
	const clickable = useClickable({ event: 'click', isDisabled: () => Boolean(props.isDisabled) })

	const isUnnamedDotButton = computed(() => Boolean(props.isDot) && clickable.isClickable.value && !props.label)
	watch(isUnnamedDotButton, warnUnnamedDot, { immediate: true })

	return {
		...useStandardBaseComponent('base-badge', props, ['root', 'text', 'remove']),
		ui: useUi(props, 'base-badge'),
		isClickable: clickable.isClickable,
		handleKeydown: clickable.handleKeydown,
		clickableAttributes: computed(() => (props.isRemovable ? {} : clickable.clickableAttributes.value)),
		statusClass: computed(() => (props.status && props.status !== 'primary' ? `base-badge--status-${props.status}` : '')),
		dotAttributes: computed(() => {
			if (!props.isDot) return {}
			if (clickable.isClickable.value) return { 'aria-label': props.label || UI_ARIA.BADGE_DOT }
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

import { computed, useSlots } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { BaseFooterProps } from '../types/BaseFooter.types'
import { useStructuredData } from '@composables/seo/useStructuredData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseFooter(props: BaseFooterProps) {
	const slots = useSlots()
	const hasTop = computed(() => Boolean(slots.top) || Boolean(props.columns?.length))
	return {
		...useStandardBaseComponent('base-footer', props, ['root', 'inner']),
		ui: useUi(props, 'base-footer'),
		slots,
		hasTop,
		...useStructuredData(
			'BaseFooter',
			() => props.seo,
			() => ({ '@type': 'Organization' }),
		),
		hasBar: computed(() => Boolean(slots.start || slots.default || slots.end) || !hasTop.value),
	}
}

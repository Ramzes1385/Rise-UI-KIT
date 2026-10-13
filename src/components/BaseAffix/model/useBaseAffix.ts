import { useUi } from '@composables/base/useUi'
import { computed, ref, type StyleValue } from 'vue'
import { useAffixObserver } from './useAffixObserver'
import type { AffixProps, BaseAffixEmits } from '../types/BaseAffix.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseAffix(props: AffixProps, emit: BaseAffixEmits) {
	const standard = useStandardBaseComponent('base-affix', props, ['root'])
	const rootRef = ref<HTMLElement | null>(null)
	const isFixed = ref(false)
	const offsets = computed(() => {
		const isDefault = props.offsetTop === undefined && props.offsetBottom === undefined
		return { top: isDefault ? 0 : props.offsetTop, bottom: props.offsetBottom }
	})

	useAffixObserver({
		elementRef: rootRef,
		offsets: () => offsets.value,
		target: () => props.target,
		onChange(value) {
			isFixed.value = value
			emit('change', value)
		},
	})

	return {
		...standard,
		ui: useUi(props, 'base-affix'),
		rootRef,
		isFixed,
		modifiers: computed(() => ({ 'base-affix--fixed': isFixed.value, 'base-affix--shadow': props.hasShadow })),
		rootStyle: computed((): StyleValue => {
			const { top, bottom } = offsets.value
			return [
				standard.sizeScaleStyle.value,
				{ top: top === undefined ? undefined : `${top}px`, bottom: bottom === undefined ? undefined : `${bottom}px` },
			]
		}),
	}
}

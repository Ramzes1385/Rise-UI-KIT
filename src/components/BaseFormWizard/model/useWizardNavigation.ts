import { computed, ref, watch } from 'vue'
import type { BaseFormWizardEmits, FormWizardProps } from '../types/BaseFormWizard.types'

export function useWizardNavigation(props: FormWizardProps, emit: BaseFormWizardEmits) {
	const resolveId = (id: string | undefined): string => props.steps.find(step => step.id === id)?.id ?? props.steps[0]?.id ?? ''
	const currentId = ref(resolveId(props.step))
	const currentIndex = computed(() =>
		Math.max(
			props.steps.findIndex(step => step.id === currentId.value),
			0,
		),
	)

	watch(
		() => props.step,
		id => {
			if (id !== undefined) currentId.value = resolveId(id)
		},
	)
	watch(
		() => props.steps.map(step => step.id).join('\n'),
		() => {
			currentId.value = resolveId(currentId.value)
		},
	)

	return {
		currentId,
		currentIndex,
		currentStep: computed(() => props.steps[currentIndex.value]),
		isFirst: computed(() => currentIndex.value === 0),
		isLast: computed(() => currentIndex.value === props.steps.length - 1),
		indexOf: (id: string): number => props.steps.findIndex(step => step.id === id),
		moveTo(index: number): void {
			const from = currentId.value
			currentId.value = props.steps[index].id
			emit('update:step', currentId.value)
			emit('step-change', { to: currentId.value, from })
		},
	}
}

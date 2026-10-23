import { computed } from 'vue'
import { finishWizard } from './wizardFinish'
import type { useWizardNavigation } from './useWizardNavigation'
import type { useWizardValidation } from './useWizardValidation'
import type { BaseFormWizardEmits, FormWizardProps } from '../types/BaseFormWizard.types'

export function useWizardActions(
	props: FormWizardProps,
	emit: BaseFormWizardEmits,
	deps: { nav: ReturnType<typeof useWizardNavigation>; validation: ReturnType<typeof useWizardValidation> },
) {
	const { nav, validation } = deps
	const isLocked = computed(() => props.isDisabled || props.isLoading || validation.isChecking.value)

	async function next(): Promise<boolean> {
		const step = nav.currentStep.value
		if (isLocked.value || !step) return false
		if (nav.isLast.value) return finishWizard(props, emit, deps)
		if (!(await validation.check(nav.currentIndex.value))) {
			emit('invalid', step.id)
			return false
		}
		emit('next', step.id)
		nav.moveTo(nav.currentIndex.value + 1)
		return true
	}

	function goBackTo(index: number): boolean {
		const step = nav.currentStep.value
		if (isLocked.value || !step || index < 0 || index >= nav.currentIndex.value) return false
		emit('back', step.id)
		nav.moveTo(index)
		return true
	}

	function skip(): void {
		const step = nav.currentStep.value
		emit('skip', step.id)
		validation.clear(step.id)
		nav.moveTo(nav.currentIndex.value + 1)
	}

	async function goTo(id: string): Promise<boolean> {
		const target = nav.indexOf(id)
		const current = nav.currentIndex.value
		if (isLocked.value || target < 0 || target === current) return false
		if (target < current) return goBackTo(target)
		if (props.isLinear) return target === current + 1 && next()
		nav.moveTo(target)
		return true
	}

	return { isLocked, next, skip, goTo, back: (): boolean => goBackTo(nav.currentIndex.value - 1) }
}

import { nextTick, ref, useId } from 'vue'
import { useUi } from '@composables/base/useUi'
import { isImeKeydown } from '@utils/dom/keyboardUtils'
import { useFormDisabled } from '@composables/form/useFormContext'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseInplaceEmits, InplaceProps, InplaceState } from '../types/BaseInplace.types'

function useInplaceActions(props: InplaceProps, emit: BaseInplaceEmits, state: InplaceState) {
	async function edit(): Promise<void> {
		if (state.isControlDisabled.value) return
		state.draft.value = props.modelValue
		state.isEditing.value = true
		await nextTick()
		state.inputRef.value?.focus()
		state.inputRef.value?.inputRef?.select()
	}

	async function finish(): Promise<void> {
		state.isEditing.value = false
		await nextTick()
		state.displayRef.value?.focus()
	}

	async function save(): Promise<void> {
		if (!state.isEditing.value) return
		const value = state.draft.value.trim()
		if (value !== props.modelValue) emit('update:modelValue', value)
		emit('save', value)
		await finish()
	}

	async function cancel(): Promise<void> {
		if (!state.isEditing.value) return
		emit('cancel')
		await finish()
	}

	return { edit, save, cancel }
}

export function useBaseInplace(props: InplaceProps, emit: BaseInplaceEmits) {
	const state: InplaceState = {
		isEditing: ref(false),
		draft: ref(''),
		displayRef: ref(null),
		inputRef: ref(null),
		isControlDisabled: useFormDisabled(() => props.isDisabled),
	}
	const actions = useInplaceActions(props, emit, state)

	function handleKeydown(event: KeyboardEvent): void {
		if (isImeKeydown(event)) return
		if (event.key === 'Enter') {
			event.preventDefault()
			void actions.save()
		} else if (event.key === 'Escape') {
			event.preventDefault()
			void actions.cancel()
		}
	}

	return {
		...useStandardBaseComponent('base-inplace', props, ['root', 'display', 'field']),
		ui: useUi(props, 'base-inplace'),
		...state,
		hintId: `${useId()}-hint`,
		actions,
		edit: actions.edit,
		handleKeydown,
		handleBlur: () => void (props.isSaveOnBlur ? actions.save() : actions.cancel()),
	}
}

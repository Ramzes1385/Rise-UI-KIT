/** Composable: логика BaseInplace — просмотр и правка на месте, сохранение и отмена */
import { nextTick, ref, useId } from 'vue'
import { useFormDisabled } from '@composables/useFormContext'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseInplaceEmits, InplaceProps, InplaceState } from '../types/BaseInplace.types'

function useInplaceActions(props: InplaceProps, emit: BaseInplaceEmits, state: InplaceState) {
	/** Режим правки: поле с текущим текстом, фокус и выделение в нём */
	async function edit(): Promise<void> {
		if (state.isControlDisabled.value) return
		state.draft.value = props.modelValue
		state.isEditing.value = true
		await nextTick()
		state.inputRef.value?.focus()
		state.inputRef.value?.inputRef?.select()
	}

	/** Конец правки: фокус возвращается на кнопку просмотра */
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

/**
 * Текст, который редактируется на месте: кнопка просмотра, по клику — поле. Enter сохраняет, Escape отменяет,
 * выход из поля — сохраняет или отменяет по `isSaveOnBlur`.
 */
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
		if (event.key === 'Enter') {
			event.preventDefault()
			void actions.save()
		} else if (event.key === 'Escape') {
			// preventDefault: Escape отменяет правку и не закрывает окно вокруг
			event.preventDefault()
			void actions.cancel()
		}
	}

	return {
		...useStandardBaseComponent('base-inplace', props, ['root', 'display', 'field']),
		...state,
		hintId: `${useId()}-hint`,
		actions,
		edit: actions.edit,
		handleKeydown,
		handleBlur: () => void (props.isSaveOnBlur ? actions.save() : actions.cancel()),
	}
}

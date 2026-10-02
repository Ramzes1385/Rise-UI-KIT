import type { ComputedRef, InjectionKey } from 'vue'
/** Composable: контекст формы (блокировка, ошибки схемы) и поля (подпись, описание, ошибка) для контролов кита */
import { computed, inject, onScopeDispose, provide, useId } from 'vue'
import type {
	FieldControlAria,
	FormContext,
	FormFieldContext,
	UseFieldControlOptions,
	UseFieldControlReturn,
} from './types/useFormContext.types'

export const FORM_CONTEXT_KEY: InjectionKey<FormContext> = Symbol.for('rise-ui-kit.form')

/** Ключ контекста BaseFormField (`null` — поля внутри не относятся к обёртке снаружи) */
export const FORM_FIELD_CONTEXT_KEY: InjectionKey<FormFieldContext | null> = Symbol.for('rise-ui-kit.form-field')

/**
 * Отделить служебные поля составного компонента от BaseFormField снаружи: поле ссылки в редакторе, время
 * в календаре, поиск в таблице не должны становиться полем обёртки, в которую положили сам компонент.
 */
export function isolateFormField(): void {
	provide(FORM_FIELD_CONTEXT_KEY, null)
}

/** Контекст ближайшей BaseForm или `null` */
export function useFormContext(): FormContext | null {
	return inject(FORM_CONTEXT_KEY, null)
}

/**
 * Блокировка контрола: собственный `isDisabled` или отключённая (отправляемая) BaseForm вокруг.
 * `fieldset[disabled]` формы блокирует только нативные поля — кастомные контролы (combobox, ползунок,
 * редактор) узнают о блокировке отсюда.
 */
export function useFormDisabled(isDisabled: () => boolean | undefined): ComputedRef<boolean> {
	const form = useFormContext()
	return computed(() => Boolean(isDisabled()) || Boolean(form?.isDisabled.value))
}

/**
 * Контрол внутри BaseFormField: id для подписи обёртки (`for`), `aria-describedby` с её описанием или ошибкой,
 * `aria-invalid` и `aria-required`. Вне обёртки — только собственные состояния контрола.
 */
export function useFieldControl(options: UseFieldControlOptions = {}): UseFieldControlReturn {
	const field = inject(FORM_FIELD_CONTEXT_KEY, null)
	const ownId = useId()
	const id = computed(() => options.id?.() || ownId)
	const unregister = options.hasOwnLabel ? undefined : field?.register(() => id.value, options.isLabelable ?? true)
	if (unregister) onScopeDispose(unregister)
	const isInField = Boolean(unregister)

	const hasError = computed(() => Boolean(options.hasError?.()) || Boolean(field?.hasError.value))

	const aria = computed((): FieldControlAria => {
		const describedBy = [options.describedBy?.(), field?.describedBy.value].filter(Boolean).join(' ')
		return {
			'aria-invalid': hasError.value ? 'true' : undefined,
			'aria-required': options.isRequired?.() || field?.isRequired.value ? 'true' : undefined,
			'aria-describedby': describedBy || undefined,
		}
	})

	const fieldLabelId = computed(() => (isInField && field?.hasLabel.value ? field.labelId : undefined))

	return { id, isInField, fieldLabelId, hasError, aria }
}

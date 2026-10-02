import type { ComputedRef, InjectionKey } from 'vue'
/** Composable: контекст формы (блокировка, ошибки схемы) и поля (подпись, описание, ошибка) для контролов кита */
import { computed, inject, onScopeDispose, provide, shallowRef, toValue, useId, watch } from 'vue'
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

/** Подключение к обёртке, пока у контрола нет своей подписи; подпись появилась — обёртка освобождается */
function useFieldRegistration(field: FormFieldContext | null, getId: () => string, options: UseFieldControlOptions) {
	const hasOwnLabel = computed(() => Boolean(toValue(options.hasOwnLabel)))
	const unregister = shallowRef<(() => void) | undefined>()
	const release = (): void => {
		unregister.value?.()
		unregister.value = undefined
	}
	watch(
		hasOwnLabel,
		isOwn => {
			release()
			if (!isOwn) unregister.value = field?.register(getId, options.isLabelable ?? true)
		},
		{ immediate: true },
	)
	onScopeDispose(release)
	return { hasOwnLabel, isInField: computed(() => Boolean(unregister.value)) }
}

/**
 * Контрол внутри BaseFormField: id для подписи обёртки (`for`), `aria-describedby` с её описанием или ошибкой,
 * `aria-invalid` и `aria-required`. Вне обёртки — только собственные состояния контрола. Контрол со своей подписью
 * (`hasOwnLabel`) обёртку не занимает: она — группа со своим описанием, а контрол берёт из неё только обязательность.
 */
export function useFieldControl(options: UseFieldControlOptions = {}): UseFieldControlReturn {
	const field = inject(FORM_FIELD_CONTEXT_KEY, null)
	const ownId = useId()
	const id = computed(() => options.id?.() || ownId)
	const registration = useFieldRegistration(field, () => id.value, options)
	const fieldState = computed(() => (registration.hasOwnLabel.value ? null : field))

	const hasError = computed(() => Boolean(options.hasError?.()) || Boolean(field?.hasError.value))

	const isInvalid = computed(() => Boolean(options.hasError?.()) || Boolean(fieldState.value?.hasError.value))
	const isRequired = computed(() => Boolean(options.isRequired?.()) || Boolean(field?.isRequired.value))
	const describedBy = computed(() => [options.describedBy?.(), fieldState.value?.describedBy.value].filter(Boolean).join(' '))

	const aria = computed((): FieldControlAria => ({
		'aria-invalid': isInvalid.value ? 'true' : undefined,
		'aria-required': isRequired.value ? 'true' : undefined,
		'aria-describedby': describedBy.value || undefined,
	}))

	const fieldLabelId = computed(() => (registration.isInField.value && field?.hasLabel.value ? field.labelId : undefined))

	return {
		id,
		get isInField() {
			return registration.isInField.value
		},
		fieldLabelId,
		hasError,
		aria,
	}
}

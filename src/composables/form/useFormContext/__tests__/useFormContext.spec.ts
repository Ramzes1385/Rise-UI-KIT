import { mount } from '@vue/test-utils'
import { computed, defineComponent, effectScope, h, nextTick, provide, ref } from 'vue'
import type { FormFieldContext, UseFieldControlOptions, UseFieldControlReturn } from '../types/useFormContext.types'
import {
	FORM_CONTEXT_KEY,
	FORM_FIELD_CONTEXT_KEY,
	isolateFormField,
	useFieldControl,
	useFormContext,
	useFormDisabled,
} from '../useFormContext'

function withProviders<T>(
	use: () => T,
	{ formDisabled, field }: { formDisabled?: ReturnType<typeof ref<boolean>>; field?: FormFieldContext } = {},
): { result: T; unmount: () => void } {
	let result!: T
	const Child = defineComponent({
		setup() {
			result = use()
			return () => null
		},
	})
	const Parent = defineComponent({
		setup() {
			if (formDisabled)
				provide(FORM_CONTEXT_KEY, { isDisabled: computed(() => Boolean(formDisabled.value)), errors: computed(() => ({})) })
			if (field) provide(FORM_FIELD_CONTEXT_KEY, field)
			return () => h(Child)
		},
	})
	const wrapper = mount(Parent)
	return { result, unmount: () => wrapper.unmount() }
}

/** Контекст поля для тестов: запоминает подключённый контрол */
function createField(
	overrides: Partial<FormFieldContext> = {},
): FormFieldContext & { control: { getId: () => string; isLabelable: boolean } | null } {
	const state = {
		control: null as { getId: () => string; isLabelable: boolean } | null,
		labelId: 'field-label',
		hasLabel: computed(() => true),
		describedBy: computed(() => 'field-description' as string | undefined),
		hasError: computed(() => false),
		isRequired: computed(() => false),
		register(getId: () => string, isLabelable: boolean) {
			if (state.control) return undefined
			state.control = { getId, isLabelable }
			return () => {
				state.control = null
			}
		},
		...overrides,
	}
	return state
}

describe('useFormContext', () => {
	it('вне BaseForm контекста нет', () => {
		const { result } = withProviders(() => useFormContext())
		expect(result).toBeNull()
	})

	describe('useFormDisabled', () => {
		it('без формы — собственный isDisabled', () => {
			const own = ref<boolean | undefined>(undefined)
			const { result } = withProviders(() => useFormDisabled(() => own.value))
			expect(result.value).toBe(false)
			own.value = true
			expect(result.value).toBe(true)
		})

		it('отключённая форма блокирует контрол', () => {
			const formDisabled = ref(true)
			const { result } = withProviders(() => useFormDisabled(() => false), { formDisabled })
			expect(result.value).toBe(true)
			formDisabled.value = false
			expect(result.value).toBe(false)
		})
	})

	describe('useFieldControl', () => {
		it('вне BaseFormField: свой id, только собственные состояния', () => {
			const hasError = ref(false)
			const { result } = withProviders(() =>
				useFieldControl({
					describedBy: () => (hasError.value ? 'own-error' : undefined),
					hasError: () => hasError.value,
					isRequired: () => true,
				}),
			)

			expect(result.id.value).toMatch(/^v-/)
			expect(result.isInField).toBe(false)
			expect(result.fieldLabelId.value).toBeUndefined()
			expect(result.aria.value).toEqual({ 'aria-invalid': undefined, 'aria-required': 'true', 'aria-describedby': undefined })
			hasError.value = true
			expect(result.aria.value).toEqual({ 'aria-invalid': 'true', 'aria-required': 'true', 'aria-describedby': 'own-error' })
		})

		it('без настроек — сгенерированный id и пустые состояния', () => {
			const { result } = withProviders(() => useFieldControl())
			expect(result.hasError.value).toBe(false)
			expect(result.aria.value['aria-required']).toBeUndefined()
		})

		it('свой id (inputAttrs.id) заменяет сгенерированный', () => {
			const { result } = withProviders(() => useFieldControl({ id: () => 'email' }))
			expect(result.id.value).toBe('email')
		})

		it('в BaseFormField: подключается нативным полем, берёт описание, ошибку и обязательность обёртки', () => {
			const field = createField({ hasError: computed(() => true), isRequired: computed(() => true) })
			const { result, unmount } = withProviders(() => useFieldControl({ id: () => 'phone', describedBy: () => 'own-hint' }), {
				field,
			})

			expect(result.isInField).toBe(true)
			expect(field.control?.getId()).toBe('phone')
			expect(field.control?.isLabelable).toBe(true)
			expect(result.fieldLabelId.value).toBe('field-label')
			expect(result.hasError.value).toBe(true)
			expect(result.aria.value).toEqual({
				'aria-invalid': 'true',
				'aria-required': 'true',
				'aria-describedby': 'own-hint field-description',
			})

			unmount()
			expect(field.control).toBeNull()
		})

		it('combobox (isLabelable: false) подключается без for; без подписи у обёртки fieldLabelId пуст', () => {
			const field = createField({ hasLabel: computed(() => false) })
			const { result } = withProviders(() => useFieldControl({ isLabelable: false }), { field })

			expect(field.control?.isLabelable).toBe(false)
			expect(result.fieldLabelId.value).toBeUndefined()
		})

		it('hasOwnLabel: контрол со своей подписью не занимает обёртку и не берёт её aria-invalid и описание', () => {
			const field = createField({ hasError: computed(() => true), isRequired: computed(() => true) })
			const { result } = withProviders(() => useFieldControl({ hasOwnLabel: true }), { field })

			expect(field.control).toBeNull()
			expect(result.isInField).toBe(false)
			expect(result.fieldLabelId.value).toBeUndefined()
			expect(result.hasError.value).toBe(true)
			expect(result.aria.value).toEqual({
				'aria-invalid': undefined,
				'aria-required': 'true',
				'aria-describedby': undefined,
			})
		})

		it('hasOwnLabel вне обёртки: только собственные состояния', () => {
			const { result } = withProviders(() => useFieldControl({ hasOwnLabel: true, hasError: () => true }))

			expect(result.isInField).toBe(false)
			expect(result.aria.value).toEqual({ 'aria-invalid': 'true', 'aria-required': undefined, 'aria-describedby': undefined })
		})

		it('hasOwnLabel в обёртке без подписи: обёртка не группа — её ошибку и описание несёт контрол', () => {
			const field = createField({ hasLabel: computed(() => false), hasError: computed(() => true) })
			const { result } = withProviders(() => useFieldControl({ hasOwnLabel: true }), { field })

			expect(field.control).toBeNull()
			expect(result.isInField).toBe(false)
			expect(result.aria.value).toEqual({
				'aria-invalid': 'true',
				'aria-required': undefined,
				'aria-describedby': 'field-description',
			})
		})

		it('hasOwnLabel: решает isGroup обёртки, а не подпись; isGroup реактивен', async () => {
			const isGroup = ref(false)
			const field = createField({ isGroup: computed(() => isGroup.value), hasError: computed(() => true) })
			const { result } = withProviders(() => useFieldControl({ hasOwnLabel: true, describedBy: () => 'own-description' }), { field })

			expect(result.aria.value['aria-invalid']).toBe('true')
			expect(result.aria.value['aria-describedby']).toBe('own-description field-description')

			isGroup.value = true
			await nextTick()
			expect(result.aria.value['aria-invalid']).toBeUndefined()
			expect(result.aria.value['aria-describedby']).toBe('own-description')
			expect(result.hasError.value).toBe(true)
		})

		it('hasOwnLabel: собственные ошибка и описание остаются', () => {
			const field = createField()
			const { result } = withProviders(
				() => useFieldControl({ hasOwnLabel: () => true, hasError: () => true, describedBy: () => 'own-error' }),
				{ field },
			)

			expect(result.aria.value).toEqual({ 'aria-invalid': 'true', 'aria-required': undefined, 'aria-describedby': 'own-error' })
		})

		it('hasOwnLabel реактивен: подпись появилась — обёртка свободна, пропала — контрол подключается снова', async () => {
			const field = createField({ hasError: computed(() => true) })
			const hasOwnLabel = ref(false)
			const { result, unmount } = withProviders(() => useFieldControl({ id: () => 'agree', hasOwnLabel }), { field })

			expect(result.isInField).toBe(true)
			expect(field.control?.getId()).toBe('agree')
			expect(result.aria.value['aria-describedby']).toBe('field-description')

			hasOwnLabel.value = true
			await nextTick()
			expect(field.control).toBeNull()
			expect(result.isInField).toBe(false)
			expect(result.fieldLabelId.value).toBeUndefined()
			expect(result.aria.value).toEqual({ 'aria-invalid': undefined, 'aria-required': undefined, 'aria-describedby': undefined })

			hasOwnLabel.value = false
			await nextTick()
			expect(result.isInField).toBe(true)
			expect(result.fieldLabelId.value).toBe('field-label')

			unmount()
			expect(field.control).toBeNull()
		})

		it('второй контрол в той же обёртке не подключается', () => {
			const field = createField()
			let second!: UseFieldControlReturn
			const Two = defineComponent({
				setup() {
					useFieldControl()
					second = useFieldControl({} as UseFieldControlOptions)
					return () => null
				},
			})
			mount(
				defineComponent({
					setup() {
						provide(FORM_FIELD_CONTEXT_KEY, field)
						return () => h(Two)
					},
				}),
			)

			expect(second.isInField).toBe(false)
			expect(second.fieldLabelId.value).toBeUndefined()
		})

		it('isolateFormField: служебные поля составного компонента не становятся полем обёртки снаружи', () => {
			const field = createField()
			let inner!: UseFieldControlReturn
			const Inner = defineComponent({
				setup() {
					inner = useFieldControl()
					return () => null
				},
			})
			const Composite = defineComponent({
				setup() {
					isolateFormField()
					return () => h(Inner)
				},
			})
			mount(
				defineComponent({
					setup() {
						provide(FORM_FIELD_CONTEXT_KEY, field)
						return () => h(Composite)
					},
				}),
			)

			expect(inner.isInField).toBe(false)
			expect(field.control).toBeNull()
		})

		it('отключение при закрытии scope — вне компонента тоже', () => {
			const field = createField()
			const scope = effectScope()
			const Probe = defineComponent({
				setup() {
					scope.run(() => useFieldControl())
					return () => null
				},
			})
			mount(
				defineComponent({
					setup() {
						provide(FORM_FIELD_CONTEXT_KEY, field)
						return () => h(Probe)
					},
				}),
			)

			expect(field.control).not.toBeNull()
			scope.stop()
			expect(field.control).toBeNull()
		})
	})
})

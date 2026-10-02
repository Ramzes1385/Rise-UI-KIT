import '@testing-library/jest-dom/vitest'
import { nextTick, reactive, ref } from 'vue'
import { BaseForm } from '@components/BaseForm'
import BaseCardInput from '../ui/BaseCardInput.vue'
import { defineCardBrand } from '@utils/form/cardUtils'
import { BaseFormField } from '@components/BaseFormField'
import type { StandardSchemaV1 } from '@utils/form/formUtils'
import { field, fillValidCard, typeInto } from './cardInputHelpers'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { BaseCardInputExpose, BaseCardInputProps, CardInputValue } from '../types/BaseCardInput.types'

const YEAR = new Date().getFullYear()
const FUTURE_EXPIRY = `12${String(YEAR + 4).slice(2)}`
const PAST_EXPIRY = `01${String(YEAR - 1).slice(2)}`
const FAR_EXPIRY = `01${String(YEAR + 21).slice(2)}`

function renderWithRef(props: BaseCardInputProps = {}) {
	const card = ref<BaseCardInputExpose | null>(null)
	const onUpdate = vi.fn()
	const onComplete = vi.fn()
	const utils = render({
		components: { BaseCardInput },
		setup: () => ({ card, props, onUpdate, onComplete }),
		template: '<BaseCardInput ref="card" v-bind="props" @update:model-value="onUpdate" @complete="onComplete" />',
	})
	return { ...utils, card, onUpdate, onComplete }
}

describe('BaseCardInput integration', () => {
	describe('ошибки полей', () => {
		it('ошибка показывается после ухода из непустого поля, а не во время ввода', async () => {
			const { container } = render(BaseCardInput)
			const number = field(container, 'number')
			await typeInto(number, '4242424242424241')
			expect(screen.queryByText('Проверьте номер карты')).not.toBeInTheDocument()

			await fireEvent.blur(number)
			expect(number).toHaveAccessibleDescription('Проверьте номер карты')
			expect(number).toHaveAttribute('aria-invalid', 'true')

			await typeInto(number, '4242424242424242')
			expect(screen.queryByText('Проверьте номер карты')).not.toBeInTheDocument()
		})

		it('пустое поле после ухода — без ошибки; с isRequired — «Обязательное поле»', async () => {
			const first = render(BaseCardInput)
			await fireEvent.blur(field(first.container, 'number'))
			expect(screen.queryByText('Обязательное поле')).not.toBeInTheDocument()
			first.unmount()

			const { container } = render(BaseCardInput, { props: { isRequired: true } })
			await fireEvent.blur(field(container, 'number'))
			expect(field(container, 'number')).toHaveAccessibleDescription('Обязательное поле')
		})

		it('срок: не разбирается, истёк, дальше 20 лет', async () => {
			const { container } = render(BaseCardInput)
			const expiry = field(container, 'expiry')
			await fireEvent.blur(expiry)

			await typeInto(expiry, '13')
			expect(expiry).toHaveAccessibleDescription('Укажите срок в виде ММ/ГГ')
			await typeInto(expiry, '1330')
			expect(expiry).toHaveAccessibleDescription('Укажите срок в виде ММ/ГГ')
			await typeInto(expiry, PAST_EXPIRY)
			expect(expiry).toHaveAccessibleDescription('Срок действия карты истёк')
			await typeInto(expiry, FAR_EXPIRY)
			expect(expiry).toHaveAccessibleDescription('Укажите срок в виде ММ/ГГ')
			await typeInto(expiry, FUTURE_EXPIRY)
			expect(expiry).not.toHaveAttribute('aria-invalid')
		})

		it('код: длина по марке; имя: только латиница', async () => {
			const { container } = render(BaseCardInput)
			await typeInto(field(container, 'number'), '378282246310005')
			const code = field(container, 'code')
			await typeInto(code, '123')
			await fireEvent.blur(code)
			expect(code).toHaveAccessibleDescription('Код — 4 цифры с оборота карты')

			const holder = field(container, 'holder')
			await typeInto(holder, 'иван')
			await fireEvent.blur(holder)
			expect(holder).toHaveAccessibleDescription('Имя латиницей, как на карте')
			await typeInto(holder, 'IVAN1')
			expect(holder).toHaveAccessibleDescription('Имя латиницей, как на карте')
			await typeInto(holder, "ANNA-MARIE O'NEIL")
			expect(holder).not.toHaveAttribute('aria-invalid')
		})

		it('validate() показывает ошибки всех полей, в том числе пустых', async () => {
			const { card } = renderWithRef()
			expect(card.value!.validate()).toBe(false)
			await nextTick()
			expect(screen.getAllByText('Обязательное поле')).toHaveLength(4)
		})
	})

	describe('brands', () => {
		it('марка не из brands — «Карты … не принимаются», сильнее ошибки номера', async () => {
			const { container } = render(BaseCardInput, { props: { brands: ['mir', 'visa', 'mastercard'] } })
			const number = field(container, 'number')
			await typeInto(number, '3782')
			await fireEvent.blur(number)
			expect(number).toHaveAccessibleDescription('Карты American Express не принимаются')
			await typeInto(number, '2200000000000004')
			expect(number).not.toHaveAttribute('aria-invalid')
			expect(screen.getByRole('img', { name: 'Марка карты: Мир' })).toBeInTheDocument()
		})

		it('RuPay в диапазоне 65 — только через brands', async () => {
			const discover = render(BaseCardInput)
			await typeInto(field(discover.container, 'number'), '6500')
			expect(screen.getByRole('img', { name: 'Марка карты: Discover' })).toBeInTheDocument()
			discover.unmount()

			const { container } = render(BaseCardInput, { props: { brands: ['rupay'] } })
			await typeInto(field(container, 'number'), '6500')
			const brand = screen.getByRole('img', { name: 'Марка карты: RuPay' })
			expect(brand.querySelector('.base-card-input__brand-name')).toHaveTextContent('RuPay')
		})

		it('своя марка приложения (defineCardBrand) распознаётся и принимается', async () => {
			const local = defineCardBrand({ id: 'local', name: 'Local Pay', prefixes: ['77'], code: { name: 'CVL', length: 3 } })
			const { container } = render(BaseCardInput, { props: { brands: [local] } })
			const number = field(container, 'number')
			await typeInto(number, '7700000000000008')
			await fireEvent.blur(number)
			expect(screen.getByRole('img', { name: 'Марка карты: Local Pay' })).toBeInTheDocument()
			expect(screen.getByRole('textbox', { name: 'Код CVL' })).toBeInTheDocument()
			expect(number).not.toHaveAttribute('aria-invalid')
		})
	})

	describe('v-model и complete', () => {
		it('сводка без номера и кода; complete — один раз при переходе к заполненной карте', async () => {
			const { container, emitted } = render(BaseCardInput)
			await fillValidCard(container)
			const values = emitted()['update:modelValue'] as [CardInputValue][]
			expect(values.at(-1)![0]).toEqual({
				brand: 'visa',
				last4: '4242',
				expiry: { month: 12, year: YEAR + 4 },
				holder: 'IVAN IVANOV',
				isComplete: true,
			})
			expect(JSON.stringify(values)).not.toContain('4242424242424242')
			expect(JSON.stringify(values)).not.toContain('"123"')
			expect(emitted().complete).toHaveLength(1)

			await typeInto(field(container, 'holder'), 'PETR PETROV')
			expect(emitted().complete).toHaveLength(1)
			await typeInto(field(container, 'code'), '12')
			expect((emitted()['update:modelValue'] as [CardInputValue][]).at(-1)![0].isComplete).toBe(false)
			await typeInto(field(container, 'code'), '123')
			expect(emitted().complete).toHaveLength(2)
		})

		it('неполный номер и срок — last4 пуст, expiry null, марка уже есть', async () => {
			const { container, emitted } = render(BaseCardInput)
			await typeInto(field(container, 'number'), '4242 4242')
			await typeInto(field(container, 'expiry'), '12')
			expect((emitted()['update:modelValue'] as [CardInputValue][]).at(-1)![0]).toEqual({
				brand: 'visa',
				last4: '',
				expiry: null,
				holder: '',
				isComplete: false,
			})
		})

		it('hasHolder: false — карта заполнена без имени, holder пуст', async () => {
			const { container, emitted } = render(BaseCardInput, { props: { hasHolder: false } })
			await fillValidCard(container)
			const value = (emitted()['update:modelValue'] as [CardInputValue][]).at(-1)![0]
			expect(value.holder).toBe('')
			expect(value.isComplete).toBe(true)
			expect(emitted().complete).toHaveLength(1)
		})

		it('начальный modelValue.holder заполняет имя; modelValue: null — очистка полей', async () => {
			const initial: CardInputValue = { brand: null, last4: '', expiry: null, holder: 'IVAN IVANOV', isComplete: false }
			const { container, rerender } = render(BaseCardInput, { props: { modelValue: initial } })
			expect(field(container, 'holder').value).toBe('IVAN IVANOV')
			await typeInto(field(container, 'number'), '4242')

			await rerender({ modelValue: null })
			expect(field(container, 'number').value).toBe('')
			expect(field(container, 'holder').value).toBe('')
			expect(screen.queryByRole('img')).not.toBeInTheDocument()
		})

		it('v-model в родителе получает сводку', async () => {
			const model = ref<CardInputValue | null>(null)
			const { container } = render({
				components: { BaseCardInput },
				setup: () => ({ model }),
				template: '<BaseCardInput v-model="model" />',
			})
			await fillValidCard(container)
			expect(model.value?.isComplete).toBe(true)
			expect(model.value?.last4).toBe('4242')
		})
	})

	describe('методы', () => {
		it('getCardData: null, пока карта не заполнена; затем номер цифрами, срок, код, имя и марка', async () => {
			const { container, card } = renderWithRef()
			expect(card.value!.getCardData()).toBeNull()
			await fillValidCard(container)
			expect(card.value!.getCardData()).toEqual({
				number: '4242424242424242',
				expiry: { month: 12, year: YEAR + 4 },
				code: '123',
				holder: 'IVAN IVANOV',
				brand: expect.objectContaining({ id: 'visa' }),
			})
		})

		it('tokenize: без адаптера — ошибка, с неполной картой — ошибка, с полной — результат адаптера', async () => {
			const bare = renderWithRef()
			await fillValidCard(bare.container)
			await expect(bare.card.value!.tokenize()).rejects.toThrow('не задан tokenize')
			bare.unmount()

			const tokenize = vi.fn().mockResolvedValue('token-1')
			const { container, card } = renderWithRef({ tokenize })
			await expect(card.value!.tokenize()).rejects.toThrow('заполнены не полностью')
			expect(tokenize).not.toHaveBeenCalled()
			await fillValidCard(container)
			await expect(card.value!.tokenize()).resolves.toBe('token-1')
			expect(tokenize).toHaveBeenCalledWith(expect.objectContaining({ number: '4242424242424242', code: '123' }))
		})

		it('validate() с заполненной картой — true; reset() очищает поля и ошибки', async () => {
			const { container, card } = renderWithRef()
			await typeInto(field(container, 'number'), '4242')
			card.value!.validate()
			await nextTick()
			expect(screen.getByText('Проверьте номер карты')).toBeInTheDocument()

			card.value!.reset()
			await nextTick()
			expect(field(container, 'number').value).toBe('')
			expect(screen.queryByText('Проверьте номер карты')).not.toBeInTheDocument()
			expect(screen.queryByText('Обязательное поле')).not.toBeInTheDocument()

			await fillValidCard(container)
			expect(card.value!.validate()).toBe(true)
		})

		it('focus(field) — поле; focus() — первое с ошибкой, всё верно — номер', async () => {
			const { container, card } = renderWithRef()
			card.value!.focus('code')
			expect(field(container, 'code')).toHaveFocus()
			card.value!.focus()
			expect(field(container, 'number')).toHaveFocus()

			await typeInto(field(container, 'number'), '4242424242424242')
			card.value!.focus()
			expect(field(container, 'expiry')).toHaveFocus()

			await fillValidCard(container)
			card.value!.focus()
			expect(field(container, 'number')).toHaveFocus()
		})
		it('focus() поля, которого нет, и после размонтирования — ничего не делает', async () => {
			const { card, unmount } = renderWithRef({ hasHolder: false })
			const api = card.value!
			api.focus('holder')
			expect(document.body).toHaveFocus()
			unmount()
			expect(() => api.focus('number')).not.toThrow()
		})
	})

	describe('безопасность', () => {
		it('ни у одного поля нет name; нет записей в localStorage и sessionStorage и вывода в консоль', async () => {
			const storage = [
				vi.spyOn(Storage.prototype, 'setItem'),
				vi.spyOn(Storage.prototype, 'getItem'),
				vi.spyOn(Storage.prototype, 'removeItem'),
			]
			const output = (['log', 'info', 'warn', 'error', 'debug'] as const).map(method => vi.spyOn(console, method))
			try {
				const tokenize = vi.fn().mockResolvedValue('token')
				const { container, card } = renderWithRef({ tokenize })
				await fillValidCard(container)
				await fireEvent.blur(field(container, 'holder'))
				card.value!.validate()
				await card.value!.tokenize()
				card.value!.reset()

				expect(container.querySelectorAll('input[name]')).toHaveLength(0)
				for (const spy of [...storage, ...output]) expect(spy).not.toHaveBeenCalled()
				expect(localStorage).toHaveLength(0)
				expect(sessionStorage).toHaveLength(0)
			} finally {
				for (const spy of [...storage, ...output]) spy.mockRestore()
			}
		})
	})

	describe('BaseFormField и BaseForm', () => {
		it('в BaseFormField группа названа подписью обёртки, legend нет, поля — со своими подписями', async () => {
			const { container } = render({
				components: { BaseCardInput, BaseFormField },
				template: `
					<BaseFormField label="Карта для оплаты" description="Без комиссии">
						<BaseCardInput />
					</BaseFormField>
				`,
			})
			await nextTick()
			const group = screen.getByRole('group', { name: 'Карта для оплаты' })
			expect(group).toHaveAccessibleDescription('Без комиссии')
			expect(container.querySelector('legend')).not.toBeInTheDocument()
			expect(screen.getByRole('textbox', { name: 'Номер карты' })).not.toHaveAttribute('aria-describedby')
		})

		it('ошибка обёртки — aria-invalid на fieldset', async () => {
			render({
				components: { BaseCardInput, BaseFormField },
				template: '<BaseFormField label="Карта" error="Карта отклонена"><BaseCardInput /></BaseFormField>',
			})
			await nextTick()
			const group = screen.getByRole('group', { name: 'Карта' })
			expect(group).toHaveAttribute('aria-invalid', 'true')
			expect(group).toHaveAccessibleDescription('Карта отклонена')
		})

		it('в отключённой BaseForm поля отключены', () => {
			const { container } = render({
				components: { BaseCardInput, BaseForm },
				template: '<BaseForm is-disabled><BaseCardInput /></BaseForm>',
			})
			expect(screen.getByRole('group')).toBeDisabled()
			for (const input of container.querySelectorAll('input')) expect(input).toBeDisabled()
		})

		it('схема BaseForm проверяет сводку: ошибка обёртки, затем submit с заполненной картой', async () => {
			const schema: StandardSchemaV1 = {
				'~standard': {
					version: 1,
					vendor: 'test',
					validate: value => {
						const card = (value as { card: CardInputValue | null }).card
						return card?.isComplete ? { value } : { issues: [{ message: 'Введите данные карты', path: ['card'] }] }
					},
				},
			}
			const state = reactive<{ card: CardInputValue | null }>({ card: null })
			const onSubmit = vi.fn()
			const { container } = render({
				components: { BaseCardInput, BaseForm, BaseFormField },
				setup: () => ({ schema, state, onSubmit }),
				template: `
					<BaseForm :schema="schema" :state="state" @submit="onSubmit">
						<BaseFormField label="Карта" name="card"><BaseCardInput v-model="state.card" /></BaseFormField>
						<button type="submit">Оплатить</button>
					</BaseForm>
				`,
			})

			await fireEvent.click(screen.getByRole('button', { name: 'Оплатить' }))
			expect(await screen.findByText('Введите данные карты')).toBeInTheDocument()
			expect(screen.getByRole('group', { name: 'Карта' })).toHaveAttribute('aria-invalid', 'true')
			expect(onSubmit).not.toHaveBeenCalled()

			await fillValidCard(container)
			await waitFor(() => expect(screen.queryByText('Введите данные карты')).not.toBeInTheDocument())
			await fireEvent.click(screen.getByRole('button', { name: 'Оплатить' }))
			await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
			expect(JSON.stringify(onSubmit.mock.calls[0])).not.toContain('4242424242424242')
		})
	})
})

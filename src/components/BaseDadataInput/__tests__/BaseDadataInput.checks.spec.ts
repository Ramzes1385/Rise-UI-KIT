import '@testing-library/jest-dom/vitest'
import { UI_TEXT } from '@/locales/messages'
import BaseDadataInput from '../ui/BaseDadataInput.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { DadataSource, DadataSuggestion } from '@utils/data/dadataUtils'

const STREET: DadataSuggestion = { value: 'г Москва, ул Тверская', data: { city: 'Москва', street: 'Тверская' } }
const HOUSE: DadataSuggestion = { value: 'г Москва, ул Тверская, д 7', data: { city: 'Москва', street: 'Тверская', house: '7' } }
const FLAT: DadataSuggestion = {
	value: 'г Москва, ул Тверская, д 7, кв 1',
	data: { city: 'Москва', street: 'Тверская', house: '7', flat: '1' },
}
const NO_STREET: DadataSuggestion = { value: 'г Зеленоград, д 1', data: { city: 'Зеленоград', house: '1' } }
const SETTLEMENT: DadataSuggestion = { value: 'Московская обл, деревня Горки', data: { region: 'Московская', settlement: 'Горки' } }
const REGION: DadataSuggestion = { value: 'Московская обл', data: { region: 'Московская' } }

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

function sourceOf(items: DadataSuggestion[]) {
	return vi.fn<DadataSource>(async () => items)
}

function setup(props: Record<string, unknown>) {
	const result = render(BaseDadataInput, { props: { label: 'Поле', debounce: 0, ...props } })
	return { ...result, field: screen.getByRole('combobox', { name: 'Поле' }) }
}

async function type(field: HTMLElement, text: string): Promise<void> {
	await fireEvent.update(field, text)
	await tick()
}

async function choose(field: HTMLElement, index = 0): Promise<void> {
	if (!screen.queryAllByRole('option').length) await fireEvent.keyDown(field, { key: 'ArrowDown' })
	await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(index))
	await fireEvent.click(screen.getAllByRole('option')[index])
	await tick()
}

describe('BaseDadataInput: подсказка и проверки', () => {
	it('suggestion: выбор — объект, правка текста — null', async () => {
		const { field, emitted } = setup({ source: sourceOf([HOUSE]) })
		await type(field, 'тверская')
		await choose(field)
		expect(emitted('update:suggestion')).toEqual([[HOUSE]])
		expect(emitted('validate')).toEqual([[true]])

		await type(field, 'г Москва, ул Тверская, д 8')
		expect(emitted('update:suggestion').at(-1)).toEqual([null])
	})

	it('suggestion: текст, равный подсказке, выбирается при уходе из поля', async () => {
		const { field, emitted } = setup({ source: sourceOf([HOUSE]) })
		await type(field, 'г москва, ул тверская, д 7')
		await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
		await fireEvent.blur(field)
		expect(emitted('update:suggestion')).toEqual([[HOUSE]])
		expect(emitted('update:modelValue').at(-1)).toEqual([HOUSE.value])
		expect(emitted('validate').at(-1)).toEqual([true])
	})

	it('suggestion из пропса: тот же текст её не сбрасывает; null из пропса — выбор снова шлёт подсказку', async () => {
		const { field, emitted, rerender } = setup({ source: sourceOf([HOUSE]), suggestion: HOUSE, modelValue: HOUSE.value })
		await type(field, HOUSE.value)
		expect(emitted('update:suggestion')).toBeUndefined()
		await rerender({ suggestion: undefined })
		await choose(field)
		expect(emitted('update:suggestion')).toEqual([[HOUSE]])
	})

	it('isStrict: свой текст остаётся, ошибка после ухода, validate(false); выбор — true', async () => {
		const { field, emitted } = setup({ source: sourceOf([HOUSE]), isStrict: true })
		await type(field, 'своя улица')
		expect(screen.queryByText('Выберите вариант из списка')).toBeNull()
		await fireEvent.blur(field)
		expect(field).toHaveValue('своя улица')
		expect(emitted('update:modelValue').at(-1)).toEqual(['своя улица'])
		expect(emitted('update:suggestion')).toBeUndefined()
		expect(emitted('validate').at(-1)).toEqual([false])
		expect(screen.getByText('Выберите вариант из списка')).toBeInTheDocument()
		expect(field).toHaveAttribute('aria-invalid', 'true')

		await type(field, 'тверская')
		expect(screen.queryByText('Выберите вариант из списка')).toBeNull()
		await choose(field)
		expect(emitted('validate').at(-1)).toEqual([true])
	})

	it('без isStrict свой текст подтверждён: validate(true), ошибки нет', async () => {
		const { field, emitted } = setup({ source: sourceOf([]) })
		await type(field, 'свой адрес')
		await fireEvent.blur(field)
		expect(emitted('validate')).toEqual([[true]])
		expect(field).not.toHaveAttribute('aria-invalid', 'true')
	})

	it('precision="house": улица не подтверждает — текст с пробелом и новый поиск; дом — подтверждает', async () => {
		const source = sourceOf([STREET, HOUSE])
		const { field, emitted } = setup({ source, precision: 'house' })
		await type(field, 'тверская')
		await choose(field, 0)
		expect(emitted('update:modelValue').at(-1)).toEqual(['г Москва, ул Тверская '])
		expect(emitted('update:suggestion')).toBeUndefined()
		expect(emitted('select')).toBeUndefined()
		await waitFor(() => expect(source).toHaveBeenLastCalledWith('г Москва, ул Тверская ', expect.anything()))
		expect(field).toHaveValue('г Москва, ул Тверская ')

		await fireEvent.blur(field)
		expect(screen.getByText('Укажите дом')).toBeInTheDocument()
		expect(emitted('validate').at(-1)).toEqual([false])

		await type(field, 'г Москва, ул Тверская 7')
		await choose(field, 1)
		expect(emitted('update:suggestion').at(-1)).toEqual([HOUSE])
		expect(emitted('validate').at(-1)).toEqual([true])
	})

	it('precision: квартира, улица (дом без улицы), город (населённый пункт)', async () => {
		const flat = setup({ source: sourceOf([HOUSE, FLAT]), precision: 'flat' })
		await type(flat.field, 'тверская')
		await choose(flat.field, 0)
		expect(flat.emitted('update:suggestion')).toBeUndefined()
		await choose(flat.field, 1)
		expect(flat.emitted('update:suggestion')).toEqual([[FLAT]])
		flat.unmount()

		const street = setup({ source: sourceOf([NO_STREET]), precision: 'street' })
		await type(street.field, 'зеленоград')
		await choose(street.field)
		expect(street.emitted('update:suggestion')).toEqual([[NO_STREET]])
		street.unmount()

		const city = setup({ source: sourceOf([REGION, SETTLEMENT]), precision: 'city' })
		await type(city.field, 'горки')
		await choose(city.field, 0)
		expect(city.emitted('update:suggestion')).toBeUndefined()
		await choose(city.field, 1)
		expect(city.emitted('update:suggestion')).toEqual([[SETTLEMENT]])
	})

	it('precision: свой текст и подсказка ниже уровня из пропса — ошибка уровня', async () => {
		const { field, emitted, rerender } = setup({ source: sourceOf([]), precision: 'flat', modelValue: 'улица' })
		await type(field, 'моя улица')
		await fireEvent.blur(field)
		expect(screen.getByText('Укажите квартиру')).toBeInTheDocument()
		await rerender({ suggestion: STREET, precision: 'street', modelValue: STREET.value })
		await fireEvent.blur(field)
		expect(emitted('validate').at(-1)).toEqual([true])
		await rerender({ precision: 'city', suggestion: REGION, modelValue: REGION.value })
		await fireEvent.blur(field)
		expect(screen.getByText('Укажите город или населённый пункт')).toBeInTheDocument()
	})

	it('precision не действует вне адреса', async () => {
		const { field, emitted } = setup({ kind: 'fio', source: sourceOf([{ value: 'Иванов' }]), precision: 'house' })
		await type(field, 'иванов')
		await choose(field)
		expect(emitted('update:suggestion')).toEqual([[{ value: 'Иванов' }]])
	})

	it('party: верный ИНН — запрос уходит, неверный — запроса нет, строка ошибки в панели', async () => {
		const source = sourceOf([])
		const { field, emitted } = setup({ kind: 'party', source })
		await type(field, '7707083893')
		await waitFor(() => expect(source).toHaveBeenCalledTimes(1))

		await type(field, '7707083894')
		expect(source).toHaveBeenCalledTimes(1)
		await waitFor(() => expect(document.querySelector('.base-autocomplete__empty')).toHaveTextContent('Неверное контрольное число ИНН'))
		await fireEvent.blur(field)
		expect(emitted('validate').at(-1)).toEqual([false])
		expect(screen.getAllByText('Неверное контрольное число ИНН').length).toBeGreaterThan(0)
	})

	it('party: ОГРН из 13 и 15 цифр; 11 цифр — обычный поиск', async () => {
		const source = sourceOf([])
		const { field } = setup({ kind: 'party', source })
		await type(field, '1027700132195')
		await waitFor(() => expect(source).toHaveBeenCalledTimes(1))
		await type(field, '1027700132196')
		await type(field, '304500116000157')
		await waitFor(() => expect(source).toHaveBeenCalledTimes(2))
		await type(field, '304500116000158')
		await waitFor(() =>
			expect(document.querySelector('.base-autocomplete__empty')).toHaveTextContent('Неверное контрольное число ОГРН'),
		)
		await type(field, '77070838931')
		await waitFor(() => expect(source).toHaveBeenCalledTimes(3))
	})

	it('bank: БИК 044525225 — запрос; 123456789 — без запроса, неверный формат', async () => {
		const source = sourceOf([])
		const { field } = setup({ kind: 'bank', source })
		await type(field, '044525225')
		await waitFor(() => expect(source).toHaveBeenCalledTimes(1))
		await type(field, '123456789')
		expect(source).toHaveBeenCalledTimes(1)
		await waitFor(() => expect(document.querySelector('.base-autocomplete__empty')).toHaveTextContent('Неверный формат БИК'))
		expect(document.querySelector('.base-autocomplete__empty')).not.toHaveTextContent(UI_TEXT.LOADING)
	})

	it('email: «a@b» — ошибка после ухода, не во время набора; «a@b.ru» — нет', async () => {
		const { field, emitted } = setup({ kind: 'email', source: sourceOf([]) })
		await type(field, 'a@b')
		expect(screen.queryByText('Неверный адрес почты')).toBeNull()
		await fireEvent.blur(field)
		expect(screen.getByText('Неверный адрес почты')).toBeInTheDocument()
		expect(emitted('validate').at(-1)).toEqual([false])

		await fireEvent.focus(field)
		await type(field, 'a@b.ru')
		await fireEvent.blur(field)
		expect(screen.queryByText('Неверный адрес почты')).toBeNull()
		expect(emitted('validate').at(-1)).toEqual([true])
	})

	it('внешний error важнее встроенного', async () => {
		const { field } = setup({ kind: 'email', source: sourceOf([]), error: 'Почта занята' })
		await type(field, 'a@b')
		await fireEvent.blur(field)
		expect(screen.getByText('Почта занята')).toBeInTheDocument()
		expect(screen.queryByText('Неверный адрес почты')).toBeNull()
	})

	it('isRequired: пусто после ухода — false и «Обязательное поле»; без isRequired — null', async () => {
		const required = setup({ source: sourceOf([]), isRequired: true })
		await fireEvent.blur(required.field)
		expect(required.emitted('validate')).toEqual([[false]])
		expect(screen.getByText(UI_TEXT.REQUIRED_FIELD)).toBeInTheDocument()
		required.unmount()

		const optional = setup({ source: sourceOf([]) })
		await fireEvent.blur(optional.field)
		expect(optional.emitted('validate')).toEqual([[null]])
	})
})

describe('BaseDadataInput: правка и очистка', () => {
	it('после правки тот же вариант выбирается снова; Escape и уход из поля очищают значение', async () => {
		const { field, emitted } = setup({ source: sourceOf([HOUSE]) })
		await type(field, 'тверская')
		await choose(field)
		await type(field, 'тверская 7')
		await choose(field)
		expect(emitted('update:suggestion')).toEqual([[HOUSE], [null], [HOUSE]])
		expect(emitted('select')).toHaveLength(2)

		await type(field, 'тве')
		await fireEvent.keyDown(field, { key: 'Escape' })
		await fireEvent.keyDown(field, { key: 'Escape' })
		expect(field).toHaveValue('')
		await fireEvent.blur(field)
		expect(emitted('update:modelValue').at(-1)).toEqual([''])
		expect(emitted('update:suggestion').at(-1)).toEqual([null])
		expect(emitted('validate').at(-1)).toEqual([null])
	})
})

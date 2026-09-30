import '@testing-library/jest-dom/vitest'
import BaseDadataInput from '../ui/BaseDadataInput.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { DadataSource, DadataSuggestion } from '@utils/data/dadataUtils'

const PARTY: DadataSuggestion = {
	value: 'ООО "ЯНДЕКС"',
	unrestrictedValue: 'ООО "ЯНДЕКС"',
	data: { inn: '7736207543', kpp: '770401001', ogrn: '1027700229193', address: { value: 'г Москва, ул Льва Толстого, д 16' } },
}

const BANK: DadataSuggestion = { value: 'ПАО Сбербанк', data: { bic: '044525225', correspondent_account: '30101810400000000225' } }

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

function sourceOf(items: DadataSuggestion[]) {
	return vi.fn<DadataSource>(async () => items)
}

describe('BaseDadataInput', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('организация: ИНН и адрес во второй строке, выбор — select с реквизитами', async () => {
		const source = sourceOf([PARTY])
		const { emitted } = render(BaseDadataInput, { props: { kind: 'party', label: 'Организация', source, debounce: 0 } })
		const field = screen.getByRole('combobox', { name: 'Организация' })

		await fireEvent.update(field, 'яндекс')
		await tick()
		await waitFor(() => expect(screen.getByRole('option')).toHaveTextContent('ИНН 7736207543 · г Москва, ул Льва Толстого, д 16'))
		await fireEvent.keyDown(field, { key: 'ArrowDown' })
		await fireEvent.keyDown(field, { key: 'Enter' })

		expect(emitted('update:modelValue').at(-1)).toEqual(['ООО "ЯНДЕКС"'])
		expect(emitted('select')).toEqual([[PARTY, { inn: '7736207543', kpp: '770401001', ogrn: '1027700229193' }]])
	})

	it('банк: БИК во второй строке; без адреса — только БИК', async () => {
		render(BaseDadataInput, { props: { kind: 'bank', label: 'Банк', source: sourceOf([BANK]), debounce: 0 } })
		await fireEvent.update(screen.getByRole('combobox', { name: 'Банк' }), 'сбер')
		await tick()
		await waitFor(() => expect(screen.getByRole('option')).toHaveTextContent('БИК 044525225'))
		expect(screen.getByRole('option')).not.toHaveTextContent('·')
	})

	it('адрес: полный адрес, если отличается; ФИО и почта — без второй строки', async () => {
		const address = { value: 'г Москва, ул Тверская, д 7', unrestrictedValue: '125009, г Москва, ул Тверская, д 7' }
		const same = { value: 'г Казань', unrestrictedValue: 'г Казань' }
		const { rerender } = render(BaseDadataInput, { props: { label: 'Адрес', source: sourceOf([address, same]), debounce: 0 } })
		await fireEvent.update(screen.getByRole('combobox', { name: 'Адрес' }), 'тверская')
		await tick()
		await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2))
		expect(screen.getAllByRole('option')[0]).toHaveTextContent('125009, г Москва')
		expect(document.querySelectorAll('.base-autocomplete__option-description')).toHaveLength(1)

		await rerender({ kind: 'fio', source: sourceOf([{ value: 'Иванов Иван' }]) })
		await fireEvent.update(screen.getByRole('combobox', { name: 'Адрес' }), 'иванов')
		await tick()
		await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
		expect(document.querySelector('.base-autocomplete__option-description')).toBeNull()
	})

	it('без подписи имя поля — вид подсказок; у почты inputmode email', () => {
		render(BaseDadataInput, { props: { kind: 'email', source: sourceOf([]) } })
		const field = screen.getByRole('combobox', { name: 'Электронная почта' })
		expect(field).toHaveAttribute('inputmode', 'email')
		expect(field).toHaveAttribute('autocomplete', 'off')
	})

	it('без source — запрос к DaData с ключом, count и params', async () => {
		const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ suggestions: [] }) }))
		vi.stubGlobal('fetch', fetchMock)
		render(BaseDadataInput, {
			props: { kind: 'party', label: 'Организация', token: 'KEY', count: 3, params: { status: ['ACTIVE'] }, debounce: 0 },
		})
		await fireEvent.update(screen.getByRole('combobox', { name: 'Организация' }), 'сбер')
		await tick()

		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(url).toBe('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party')
		expect(init.headers).toMatchObject({ Authorization: 'Token KEY' })
		expect(JSON.parse(init.body as string)).toEqual({ query: 'сбер', count: 3, status: ['ACTIVE'] })
	})

	it('свой текст без подсказки — только v-model; внешнее значение — в поле', async () => {
		const { emitted, rerender } = render(BaseDadataInput, { props: { label: 'Организация', source: sourceOf([]), debounce: 0 } })
		const field = screen.getByRole('combobox', { name: 'Организация' })
		await fireEvent.update(field, 'Рога и копыта')
		await fireEvent.blur(field)
		expect(emitted('update:modelValue').at(-1)).toEqual(['Рога и копыта'])
		expect(emitted('select')).toBeUndefined()

		await rerender({ modelValue: 'ООО "ЯНДЕКС"' })
		expect(field).toHaveValue('ООО "ЯНДЕКС"')
		await rerender({ modelValue: undefined })
		expect(field).toHaveValue('')
	})
})

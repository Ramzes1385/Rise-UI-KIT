import '@testing-library/jest-dom/vitest'
import BaseAddressInput from '../ui/BaseAddressInput.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { AddressSource, AddressSuggestion } from '../types/BaseAddressInput.types'

const SUGGESTIONS: AddressSuggestion[] = [
	{ value: 'г Москва, ул Тверская, д 7', unrestrictedValue: '125009, г Москва, ул Тверская, д 7', data: { postal: '125009' } },
	{ value: 'г Москва, ул Тверская, д 13' },
]

function deferredSource() {
	const calls: {
		query: string
		signal: AbortSignal
		resolve: (value: AddressSuggestion[]) => void
		reject: (reason: unknown) => void
	}[] = []
	const source: AddressSource = (query, { signal }) =>
		new Promise((resolve, reject) => {
			calls.push({ query, signal, resolve, reject })
		})
	return { source: vi.fn(source), calls }
}

const field = () => screen.getByRole('combobox', { name: 'Адрес' })

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

describe('BaseAddressInput', () => {
	it('короткий запрос не уходит; после паузы — подсказки с полным адресом; выбор — событие select', async () => {
		const { source, calls } = deferredSource()
		const { emitted } = render(BaseAddressInput, { props: { label: 'Адрес', source, debounce: 0 } })

		await fireEvent.update(field(), 'Тв')
		await tick()
		expect(source).not.toHaveBeenCalled()
		await fireEvent.update(field(), 'Тверская')
		await tick()
		expect(calls[0].query).toBe('Тверская')
		calls[0].resolve(SUGGESTIONS)
		await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2))
		expect(screen.getByRole('option', { name: /д 7/ })).toHaveTextContent('125009, г Москва, ул Тверская, д 7')
		await fireEvent.keyDown(field(), { key: 'ArrowDown' })
		await fireEvent.keyDown(field(), { key: 'Enter' })
		expect(emitted('update:modelValue').at(-1)).toEqual(['г Москва, ул Тверская, д 7'])
		expect(emitted('select')).toEqual([[SUGGESTIONS[0]]])
	})

	it('новый запрос отменяет прежний: устаревший ответ и ошибка сервиса не ломают список', async () => {
		const { source, calls } = deferredSource()
		render(BaseAddressInput, { props: { label: 'Адрес', source, debounce: 0, minChars: 2 } })

		await fireEvent.update(field(), 'Мо')
		await tick()
		await fireEvent.update(field(), 'Моск')
		await tick()
		expect(calls[0].signal.aborted).toBe(true)
		calls[0].resolve(SUGGESTIONS)
		calls[0].reject(new Error('поздно'))
		calls[1].reject(new Error('503'))
		await tick()
		expect(screen.queryAllByRole('option', { name: /Тверская/ })).toHaveLength(0)
		await fireEvent.update(field(), 'М')
		await tick()
		expect(calls).toHaveLength(2)
	})

	it('свой текст без выбора — v-model без select; v-model снаружи; is-disabled', async () => {
		const { source } = deferredSource()
		const { emitted, rerender } = render(BaseAddressInput, { props: { label: 'Адрес', source, modelValue: 'г Казань' } })

		expect(field()).toHaveValue('г Казань')
		await fireEvent.update(field(), 'г Казань, ул Баумана, д 44')
		await fireEvent.blur(field())
		expect(emitted('update:modelValue').at(-1)).toEqual(['г Казань, ул Баумана, д 44'])
		expect(emitted('select')).toBeUndefined()
		await rerender({ modelValue: 'г Сочи' })
		expect(field()).toHaveValue('г Сочи')
		await rerender({ modelValue: undefined, isDisabled: true })
		expect(field()).toBeDisabled()
		expect(field()).toHaveValue('')
	})

	it('размонтирование отменяет ожидающий запрос', async () => {
		const { source, calls } = deferredSource()
		const { unmount } = render(BaseAddressInput, { props: { label: 'Адрес', source, debounce: 0, customClass: { root: 'r' } } })

		expect(document.querySelector('.base-address-input')).toHaveClass('r')
		await fireEvent.update(field(), 'Невский')
		await tick()
		unmount()
		expect(calls[0].signal.aborted).toBe(true)
	})
})

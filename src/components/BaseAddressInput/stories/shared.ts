import type { AddressSource, AddressSuggestion } from '../types/BaseAddressInput.types'

const ADDRESSES: AddressSuggestion[] = [
	'г Москва, ул Тверская, д 7',
	'г Москва, ул Тверская, д 13',
	'г Москва, Тверской б-р, д 26',
	'г Москва, ул Новый Арбат, д 21',
	'г Санкт-Петербург, Невский пр-кт, д 28',
	'г Санкт-Петербург, ул Тверская, д 12',
	'г Казань, ул Баумана, д 44',
	'г Новосибирск, Красный пр-кт, д 25',
].map((value, index) => ({ value, unrestrictedValue: `${101000 + index * 1111}, ${value}`, data: { index } }))

export const DEMO_DELAY = 300

export const demoSource: AddressSource = (query, { signal }) =>
	new Promise((resolve, reject) => {
		const words = query.toLowerCase().split(/\s+/).filter(Boolean)
		const timer = setTimeout(
			() => resolve(ADDRESSES.filter(item => words.every(word => item.value.toLowerCase().includes(word)))),
			DEMO_DELAY,
		)
		signal.addEventListener('abort', () => {
			clearTimeout(timer)
			reject(new DOMException('Aborted', 'AbortError'))
		})
	})

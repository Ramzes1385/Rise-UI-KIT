import type { DadataKind, DadataSource, DadataSuggestion } from '@utils/data/dadataUtils'

const PARTIES: DadataSuggestion[] = [
	{
		value: 'ПАО СБЕРБАНК',
		unrestrictedValue: 'ПАО СБЕРБАНК',
		data: { inn: '7707083893', kpp: '773601001', ogrn: '1027700132195', address: { value: 'г Москва, ул Вавилова, д 19' } },
	},
	{
		value: 'ООО "ЯНДЕКС"',
		unrestrictedValue: 'ООО "ЯНДЕКС"',
		data: { inn: '7736207543', kpp: '770401001', ogrn: '1027700229193', address: { value: 'г Москва, ул Льва Толстого, д 16' } },
	},
	{
		value: 'АО "ТБАНК"',
		unrestrictedValue: 'АО "ТБАНК"',
		data: {
			inn: '7710140679',
			kpp: '771301001',
			ogrn: '1027739642281',
			address: { value: 'г Москва, ул 2-я Хуторская, д 38А, стр 26' },
		},
	},
	{
		value: 'ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ "САНКТ-ПЕТЕРБУРГСКИЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ"',
		unrestrictedValue: 'СПБГУ',
		data: {
			inn: '7801002274',
			kpp: '780101001',
			ogrn: '1037800006089',
			address: { value: 'г Санкт-Петербург, Университетская наб, д 7-9' },
		},
	},
]

const BANKS: DadataSuggestion[] = [
	{
		value: 'ПАО Сбербанк',
		data: { bic: '044525225', correspondent_account: '30101810400000000225', address: { value: 'г Москва, ул Вавилова, д 19' } },
	},
	{
		value: 'Банк ВТБ (ПАО)',
		data: { bic: '044525187', correspondent_account: '30101810700000000187', address: { value: 'г Москва, Пресненская наб, д 12' } },
	},
	{
		value: 'АО «ТБанк»',
		data: { bic: '044525974', correspondent_account: '30101810145250000974', address: { value: 'г Москва, ул 2-я Хуторская, д 38А' } },
	},
]

const ADDRESSES: DadataSuggestion[] = [
	'г Москва, ул Тверская, д 7',
	'г Москва, ул Тверская, д 13',
	'г Санкт-Петербург, Невский пр-кт, д 28',
	'г Казань, ул Баумана, д 44',
].map((value, index) => ({ value, unrestrictedValue: `${125009 + index * 1111}, ${value}` }))

const NAMES: DadataSuggestion[] = ['Иванов Иван Иванович', 'Иванова Анна Сергеевна', 'Петров Пётр Петрович', 'Смирнова Мария'].map(
	value => ({
		value,
	}),
)

const EMAILS: DadataSuggestion[] = ['ivan@mail.ru', 'ivan@yandex.ru', 'ivan@gmail.com', 'ivan@rambler.ru'].map(value => ({ value }))

const FIXTURES: Record<DadataKind, DadataSuggestion[]> = { party: PARTIES, bank: BANKS, address: ADDRESSES, fio: NAMES, email: EMAILS }

export const DEMO_DELAY = 300

function matches(item: DadataSuggestion, query: string): boolean {
	const haystack = [item.value, item.unrestrictedValue, ...Object.values(item.data ?? {})].join(' ').toLowerCase()
	const words = query
		.toLowerCase()
		.split(/[\s@]+/)
		.filter(Boolean)
	return words.every(word => haystack.includes(word))
}

export function demoSource(kind: DadataKind, delay = DEMO_DELAY): DadataSource {
	return (query, { signal }) =>
		new Promise((resolve, reject) => {
			const timer = setTimeout(() => resolve(FIXTURES[kind].filter(item => matches(item, query))), delay)
			signal.addEventListener('abort', () => {
				clearTimeout(timer)
				reject(new DOMException('Aborted', 'AbortError'))
			})
		})
}

export const pendingSource: DadataSource = () => new Promise(() => undefined)

export const emptySource: DadataSource = async () => []

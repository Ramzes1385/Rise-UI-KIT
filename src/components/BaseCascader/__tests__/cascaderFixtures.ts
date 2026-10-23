import type { BaseCascaderNode } from '../types/BaseCascader.types'

export const REGIONS: BaseCascaderNode[] = [
	{
		id: 'ru',
		label: 'Россия',
		children: [
			{
				id: 'msk',
				label: 'Москва',
				children: [
					{ id: 'tverskoy', label: 'Тверской' },
					{ id: 'arbat', label: 'Арбат', isDisabled: true },
					{ id: 'khamovniki', label: 'Хамовники', description: 'Центр' },
				],
			},
			{ id: 'spb', label: 'Санкт-Петербург', children: [{ id: 'nevsky', label: 'Невский' }] },
		],
	},
	{ id: 'kz', label: 'Казахстан', icon: 'globe', children: [{ id: 'almaty', label: 'Алматы' }] },
	{ id: 'by', label: 'Беларусь', isDisabled: true, children: [{ id: 'minsk', label: 'Минск' }] },
	{ id: 'am', label: 'Армения' },
]

export function deferred<T>() {
	let resolve!: (value: T) => void
	let reject!: (reason: unknown) => void
	const promise = new Promise<T>((done, fail) => {
		resolve = done
		reject = fail
	})
	return { promise, resolve, reject }
}

export const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

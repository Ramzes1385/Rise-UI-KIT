import { describe, expect, it, vi } from 'vitest'

vi.mock('@/locales/messages', () => ({ UI_MODELS_3D: { CELL: '{title} / {key}' } }))

const { modelCellLabel, modelKindTitle, modelTitle } = await import('../../../models/modelTitles')

describe('подписи моделей: в словаре языка нет строк', () => {
	it('название встроенной модели без перевода — ключ, вид — как есть', () => {
		expect(modelTitle('cart')).toBe('cart')
		expect(modelTitle('x', { preset: 'bank' })).toBe('x')
		expect(modelKindTitle('client')).toBe('client')
	})

	it('подпись ячейки берёт шаблон словаря', () => {
		expect(modelCellLabel('Заказы', 'cart')).toBe('Заказы / cart')
	})
})

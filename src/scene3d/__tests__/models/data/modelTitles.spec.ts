import { en } from '@/locales/en'
import { UI_MODELS_3D } from '@/locales/messages'
import { afterEach, describe, expect, it } from 'vitest'
import { registerLocale, setLocale } from '@/locales/state'
import { MODEL3D_PRESET_IDS } from '../../../types/model3d.types'
import { modelCellLabel, modelKindTitle, modelTitle } from '../../../models/modelTitles'

afterEach(() => setLocale('ru'))

describe('словарь UI_MODELS_3D', () => {
	const dictionary = UI_MODELS_3D as unknown as Record<string, string>

	it('есть название каждой встроенной модели и каждого вида', () => {
		MODEL3D_PRESET_IDS.forEach(id => expect(dictionary[`MODEL_${id.toUpperCase()}`]).toBeTruthy())
		;['CLIENT', 'GATEWAY', 'SERVICE', 'STORE', 'QUEUE', 'EXTERNAL', 'ACTOR'].forEach(kind =>
			expect(dictionary[`KIND_${kind}`]).toBeTruthy(),
		)
	})

	it('названия из артборда FlowModels3D', () => {
		expect(dictionary.MODEL_LAPTOP).toBe('Веб-клиент')
		expect(dictionary.MODEL_GATEWAY).toBe('API-шлюз')
		expect(dictionary.MODEL_RAM).toBe('Кеш в памяти')
		expect(dictionary.MODEL_CLOUD).toBe('Внешняя система')
	})
})

describe('modelTitle', () => {
	it('своё title сильнее всего', () => {
		expect(modelTitle('db', { preset: 'db', title: 'Моя БД' })).toBe('Моя БД')
	})

	it('встроенная модель — из словаря текущего языка', () => {
		expect(modelTitle('cart')).toBe('Заказы')
		expect(modelTitle('x', { preset: 'bank' })).toBe('Банк')
		expect(modelTitle('x', { create: () => ({ object: null as never }) })).toBe('x')
	})

	it('смена языка меняет название', () => {
		registerLocale(en)
		setLocale('en')
		expect(modelTitle('cart')).not.toBe('Заказы')
	})

	it('своя модель без title — ключ', () => {
		expect(modelTitle('terminal-pro', { url: 'a.glb' })).toBe('terminal-pro')
		expect(modelTitle('ghost')).toBe('ghost')
		expect(modelTitle('x', { preset: 'ghost' })).toBe('x')
	})
})

describe('modelKindTitle и modelCellLabel', () => {
	it('вид: название, неизвестный — как есть', () => {
		expect(modelKindTitle('client')).toBe('Клиент')
		expect(modelKindTitle('store')).toBe('Хранилище')
		expect(modelKindTitle('weird')).toBe('weird')
	})

	it('подпись ячейки для скринридера', () => {
		expect(modelCellLabel('Заказы', 'cart')).toBe('Заказы, модель cart')
	})
})

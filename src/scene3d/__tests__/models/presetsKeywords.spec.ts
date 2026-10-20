import { describe, expect, it } from 'vitest'
import { MODEL3D_ANIMATIONS, MODEL3D_PRESET_IDS } from '../../types/model3d.types'
import { collectPresetWordGroups, matchQuality, normalizeText, pickByWords, tokenize } from '../../models/keywords'
import { MODEL3D_KIND_FALLBACK, MODEL3D_PRESETS, fallbackForKind, isModel3DPreset, presetsOfSet } from '../../models/presets'

const pick = (text: string, sets: Parameters<typeof collectPresetWordGroups>[0] = ['service']) =>
	pickByWords(text, collectPresetWordGroups(sets))

describe('presets: таблица встроенных моделей', () => {
	it('в таблице все id, у каждого известная анимация и значок', () => {
		expect(Object.keys(MODEL3D_PRESETS).sort()).toEqual([...MODEL3D_PRESET_IDS].sort())
		MODEL3D_PRESET_IDS.forEach(id => {
			expect(MODEL3D_ANIMATIONS).toContain(MODEL3D_PRESETS[id].animation)
			expect(MODEL3D_PRESETS[id].icon).toBeTruthy()
		})
	})

	it('isModel3DPreset: id таблицы — да, чужое и прототипные имена — нет', () => {
		expect(isModel3DPreset('db')).toBe(true)
		expect(isModel3DPreset('nope')).toBe(false)
		expect(isModel3DPreset('constructor')).toBe(false)
		expect(isModel3DPreset('toString')).toBe(false)
	})

	it('presetsOfSet: наборы в порядке таблицы', () => {
		expect(presetsOfSet('service')).toHaveLength(24)
		expect(presetsOfSet('service')[0]).toBe('laptop')
		expect(presetsOfSet('base')).toEqual(['server', 'shape'])
		expect(presetsOfSet('learning')).toEqual(['window', 'code', 'gear', 'layers', 'flask', 'rocket', 'book', 'shield', 'flag'])
	})

	it('fallbackForKind: известные виды, неизвестный и undefined — server', () => {
		Object.entries(MODEL3D_KIND_FALLBACK).forEach(([kind, id]) => expect(fallbackForKind(kind)).toBe(id))
		expect(fallbackForKind('client')).toBe('laptop')
		expect(fallbackForKind('store')).toBe('db')
		expect(fallbackForKind('unknown-kind')).toBe('server')
		expect(fallbackForKind(undefined)).toBe('server')
	})
})

describe('keywords: нормализация и разбор', () => {
	it('normalizeText: регистр и ё = е', () => {
		expect(normalizeText('ПлатЁж ЁЖ')).toBe('платеж еж')
	})

	it('tokenize: только буквы и цифры', () => {
		expect(tokenize('Redis-кеш, S3_bucket (v2)!')).toEqual(['redis', 'кеш', 's3', 'bucket', 'v2'])
		expect(tokenize('  ')).toEqual([])
	})
})

describe('keywords: matchQuality', () => {
	const text = 'postgresql mypostgres rapid main apiary основы веба'
	const tokens = tokenize(text)
	const quality = (word: string) => matchQuality(tokens, normalizeText(text), word)

	it('целое слово — 3, начало — 2, подстрока от 4 знаков — 1, нет — 0', () => {
		expect(matchQuality(['redis'], 'redis', 'Redis')).toBe(3)
		expect(quality('postgres')).toBe(2)
		expect(quality('stgres')).toBe(1)
		expect(quality('kafka')).toBe(0)
	})

	it('слово короче 3 знаков — только целым', () => {
		expect(matchQuality(['ai'], 'ai', 'ai')).toBe(3)
		expect(quality('ai')).toBe(0)
		expect(quality('бд')).toBe(0)
	})

	it('слово из 3 знаков ищется в начале слова, но не внутри', () => {
		expect(quality('api')).toBe(2)
		expect(quality('rap')).toBe(2)
		expect(quality('pid')).toBe(0)
	})

	it('слово с пробелом — по тексту целиком', () => {
		expect(quality('основы веб')).toBe(2)
		expect(quality('основы css')).toBe(0)
	})

	it('слово нормализуется: регистр и ё', () => {
		expect(matchQuality(['платеж'], 'платеж', 'ПЛАТЁЖ')).toBe(3)
	})
})

describe('keywords: pickByWords', () => {
	it('лучшее совпадение: целое слово раньше начала слова', () => {
		const groups = [
			{ id: 'start', words: ['pay'], rank: 2 },
			{ id: 'whole', words: ['payments'], rank: 2 },
		]
		expect(pickByWords('payments api', groups)).toBe('whole')
		expect(pickByWords('paymentsx', groups)).toBe('start')
	})

	it('равенство — меньший rank, затем порядок групп', () => {
		const same = (rank: number, id: string) => ({ id, words: ['redis'], rank })
		expect(pickByWords('redis', [same(2, 'builtin'), same(1, 'app'), same(0, 'own')])).toBe('own')
		expect(pickByWords('redis', [same(1, 'first'), same(1, 'second')])).toBe('first')
		expect(pickByWords('redis', [same(0, 'first'), same(2, 'late')])).toBe('first')
	})

	it('слабее уже найденного не заменяет', () => {
		const groups = [
			{ id: 'whole', words: ['redis'], rank: 2 },
			{ id: 'part', words: ['redi'], rank: 0 },
		]
		expect(pickByWords('redis', groups)).toBe('whole')
	})

	it('нет совпадений — null', () => {
		expect(pickByWords('что-то совсем другое', collectPresetWordGroups(['service']))).toBeNull()
		expect(pickByWords('redis', [{ id: 'x', words: [], rank: 0 }])).toBeNull()
		expect(pickByWords('redis', [])).toBeNull()
	})

	it('регистр и ё не важны', () => {
		expect(pick('ПЛАТЁЖНЫЙ сервис')).toBe('terminal')
		expect(pick('платежный сервис')).toBe('terminal')
		expect(pickByWords('Елка', [{ id: 'tree', words: ['ёлка'], rank: 0 }])).toBe('tree')
	})

	it('ru и en слова сервисов', () => {
		expect(pick('Веб-клиент')).toBe('laptop')
		expect(pick('Уведомления')).toBe('bell')
		expect(pick('Склад')).toBe('rack')
		expect(pick('Заказы')).toBe('cart')
		expect(pick('Search index')).toBe('search')
		expect(pick('Mobile app')).toBe('phone')
	})

	it('бренды', () => {
		expect(pick('Redis')).toBe('ram')
		expect(pick('Postgres')).toBe('db')
		expect(pick('PostgreSQL primary')).toBe('db')
		expect(pick('Kafka')).toBe('conveyor')
		expect(pick('Grafana')).toBe('monitor')
	})

	it('метки узла учитываются как часть текста', () => {
		expect(pick('Хранилище cache')).toBe('ram')
	})

	it('learning: слова набора', () => {
		const learn = (text: string) => pick(text, ['learning'])
		expect(learn('Основы веба')).toBe('window')
		expect(learn('HTML')).toBe('window')
		expect(learn('CSS')).toBe('window')
		expect(learn('JavaScript')).toBe('code')
		expect(learn('DevOps')).toBe('gear')
		expect(learn('Инструменты')).toBe('gear')
		expect(learn('Vue')).toBe('layers')
		expect(learn('React')).toBe('layers')
		expect(learn('QA')).toBe('flask')
		expect(learn('Тестирование')).toBe('flask')
		expect(learn('Деплой')).toBe('rocket')
		expect(learn('Теория')).toBe('book')
		expect(learn('Security')).toBe('shield')
		expect(learn('Безопасность')).toBe('shield')
		expect(learn('Финиш')).toBe('flag')
		expect(learn('Цель')).toBe('flag')
	})

	it('слова другого набора не подбираются', () => {
		expect(pick('Redis', ['learning'])).toBeNull()
		expect(pick('HTML', ['service'])).toBeNull()
	})
})

describe('keywords: collectPresetWordGroups', () => {
	it('группы наборов в порядке таблицы с rank 2', () => {
		const groups = collectPresetWordGroups(['service'])
		expect(groups.map(group => group.id)).toEqual(presetsOfSet('service'))
		expect(groups.every(group => group.rank === 2 && group.words.length > 0)).toBe(true)
	})

	it('у моделей без слов (server, shape) список пуст', () => {
		const groups = collectPresetWordGroups(['base'])
		expect(groups).toEqual([
			{ id: 'server', words: [], rank: 2 },
			{ id: 'shape', words: [], rank: 2 },
		])
	})

	it('несколько наборов склеиваются по порядку', () => {
		expect(collectPresetWordGroups(['learning', 'base']).map(group => group.id)[0]).toBe('window')
		expect(collectPresetWordGroups([])).toEqual([])
	})
})

import { nextEmojiIndex } from '../../model/emojiNavigation'
import { buildSections, loadEmojiData, parseEmojiData, searchEmojis } from '../../model/emojiData'

describe('данные эмодзи', () => {
	it('parseEmojiData: раздел, эмодзи с последовательностями, название с пробелами', () => {
		expect(parseEmojiData('0😀 широко улыбается|71️⃣ клавиша: 1|6👨‍👩‍👧 семья: мужчина, женщина, девочка')).toEqual([
			{ category: 'smileys', emoji: '😀', label: 'широко улыбается' },
			{ category: 'symbols', emoji: '1️⃣', label: 'клавиша: 1' },
			{ category: 'objects', emoji: '👨‍👩‍👧', label: 'семья: мужчина, женщина, девочка' },
		])
	})

	it('встроенный набор: русский для ru, английский для остальных; загрузка одна на язык', async () => {
		const ru = await loadEmojiData('ru')
		expect(ru.length).toBeGreaterThan(1500)
		expect(ru[0]).toEqual({ category: 'smileys', emoji: '😀', label: 'широко улыбается' })
		expect(await loadEmojiData('en')).toBe(await loadEmojiData('de'))
		expect(loadEmojiData('ru')).toBe(loadEmojiData('ru'))
	})

	it('searchEmojis и buildSections', async () => {
		const items = await loadEmojiData('ru')
		expect(searchEmojis(items, 'кот').length).toBeGreaterThan(3)
		const sections = buildSections(items, ['🐱'], '')
		expect(sections.map(section => section.id)).toEqual([
			'recent',
			'smileys',
			'people',
			'nature',
			'food',
			'travel',
			'activities',
			'objects',
			'symbols',
		])
		expect(sections[1].offset).toBe(1)
		expect(buildSections(items, [], 'ничего такого нет')).toEqual([])
	})
})

describe('навигация по сетке', () => {
	const layout = { lengths: [3, 5, 2], columns: 4 }

	it('влево, вправо, Home и End — по порядку, в пределах сетки', () => {
		expect(nextEmojiIndex('ArrowRight', 0, layout)).toBe(1)
		expect(nextEmojiIndex('ArrowRight', 9, layout)).toBe(9)
		expect(nextEmojiIndex('ArrowLeft', 0, layout)).toBe(0)
		expect(nextEmojiIndex('Home', 6, layout)).toBe(0)
		expect(nextEmojiIndex('End', 0, layout)).toBe(9)
		expect(nextEmojiIndex('Tab', 0, layout)).toBeNull()
		expect(nextEmojiIndex('ArrowDown', 0, { lengths: [], columns: 4 })).toBeNull()
	})

	it('вниз и вверх — по столбцу, между разделами — в тот же столбец или крайний', () => {
		expect(nextEmojiIndex('ArrowDown', 1, layout)).toBe(4)
		expect(nextEmojiIndex('ArrowDown', 3, layout)).toBe(7)
		expect(nextEmojiIndex('ArrowDown', 5, layout)).toBe(7)
		expect(nextEmojiIndex('ArrowDown', 7, layout)).toBe(8)
		expect(nextEmojiIndex('ArrowDown', 6, layout)).toBe(7)
		expect(nextEmojiIndex('ArrowDown', 9, layout)).toBe(9)
		expect(nextEmojiIndex('ArrowUp', 7, layout)).toBe(3)
		expect(nextEmojiIndex('ArrowUp', 4, layout)).toBe(1)
		expect(nextEmojiIndex('ArrowUp', 6, layout)).toBe(2)
		expect(nextEmojiIndex('ArrowUp', 9, layout)).toBe(7)
		expect(nextEmojiIndex('ArrowUp', 1, layout)).toBe(1)
	})
})

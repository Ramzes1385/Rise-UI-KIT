import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { setLocale } from '@/locales/state'
import { render } from '@testing-library/vue'
import { loadEmojiData } from '../../model/emojiData'
import BaseEmojiPicker from '../../ui/BaseEmojiPicker.vue'
import type { EmojiPickerItem } from '../../types/BaseEmojiPicker.types'

vi.mock('../../model/emojiData', async importOriginal => ({
	...(await importOriginal<typeof import('../../model/emojiData')>()),
	loadEmojiData: vi.fn(),
}))

const SMILE: EmojiPickerItem = { emoji: '😀', label: 'широко улыбается', category: 'smileys' }
const WAVE: EmojiPickerItem = { emoji: '👋', label: 'waving hand', category: 'people' }

const flush = () => new Promise(resolve => setTimeout(resolve))

function deferLoading() {
	const resolvers = new Map<string, (items: EmojiPickerItem[]) => void>()
	vi.mocked(loadEmojiData).mockImplementation(locale => new Promise(resolve => resolvers.set(locale, resolve)))
	return (locale: string, items: EmojiPickerItem[]) => resolvers.get(locale)?.(items)
}

describe('BaseEmojiPicker: загрузка встроенного набора', () => {
	afterEach(() => setLocale('ru'))

	it('набор прежнего языка, пришедший позже, не заменяет набор текущего', async () => {
		const resolve = deferLoading()
		const { container } = render(BaseEmojiPicker)
		const button = (label: string) => container.querySelector(`button[aria-label="${label}"]`)

		setLocale('en')
		await nextTick()
		resolve('en', [WAVE])
		await flush()
		resolve('ru', [SMILE])
		await flush()

		expect(button('waving hand')).toBeInTheDocument()
		expect(button('широко улыбается')).not.toBeInTheDocument()
		expect(container.querySelector('.base-emoji-picker')).not.toHaveAttribute('aria-busy')
	})

	it('набор из emojis важнее встроенного, который загрузился позже', async () => {
		const resolve = deferLoading()
		const { container, rerender } = render(BaseEmojiPicker)

		await rerender({ emojis: [WAVE] })
		resolve('ru', [SMILE])
		await flush()

		expect(container.querySelectorAll('.base-emoji-picker__emoji')).toHaveLength(1)
		expect(container.querySelector('button[aria-label="waving hand"]')).toBeInTheDocument()
	})
})

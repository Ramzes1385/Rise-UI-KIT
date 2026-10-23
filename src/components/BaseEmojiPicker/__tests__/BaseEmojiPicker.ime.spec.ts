import '@testing-library/jest-dom/vitest'
import BaseEmojiPicker from '../ui/BaseEmojiPicker.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { EmojiPickerItem } from '../types/BaseEmojiPicker.types'

const EMOJIS: EmojiPickerItem[] = [
	{ emoji: '🐱', label: '猫の顔', category: 'nature' },
	{ emoji: '😀', label: 'にっこり笑う', category: 'smileys' },
]

describe('BaseEmojiPicker: ввод через IME', () => {
	it.each([
		['Chrome и Firefox: isComposing', { isComposing: true }],
		['Safari: keyCode 229', { keyCode: 229 }],
	] as const)('%s: Enter в поиске подтверждает слово и не выбирает первый эмодзи', async (_name, init) => {
		const { emitted } = render(BaseEmojiPicker, { props: { emojis: EMOJIS } })
		const search = screen.getByRole('searchbox')

		await fireEvent.compositionStart(search)
		await fireEvent.update(search, 'neko')
		await fireEvent.keyDown(search, { key: 'Enter', ...init })
		expect(emitted().select).toBeUndefined()

		await fireEvent.compositionEnd(search)
		await fireEvent.update(search, '猫')
		await fireEvent.keyDown(search, { key: 'Enter', keyCode: 13 })
		expect(emitted().select).toHaveLength(1)
	})
})

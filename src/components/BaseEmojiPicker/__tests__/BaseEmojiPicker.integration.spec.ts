import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseEmojiPicker from '../ui/BaseEmojiPicker.vue'
import type { EmojiPickerItem } from '../types/BaseEmojiPicker.types'

const EMOJIS: EmojiPickerItem[] = [
	{ emoji: '😀', label: 'широко улыбается', category: 'smileys' },
	{ emoji: '🐱', label: 'морда кошки', category: 'nature' },
	{ emoji: '🐈', label: 'кошка', category: 'nature' },
]

describe('BaseEmojiPicker integration', () => {
	it('поиск, стрелка вниз в сетку, стрелка вправо и Enter выбирают эмодзи', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseEmojiPicker, { props: { emojis: EMOJIS } })

		await user.tab()
		expect(screen.getByRole('searchbox', { name: 'Поиск эмодзи' })).toHaveFocus()
		await user.keyboard('кош{ArrowDown}')
		expect(screen.getByRole('button', { name: 'морда кошки' })).toHaveFocus()
		await user.keyboard('{ArrowRight}{Enter}')
		expect(emitted('select')).toEqual([[EMOJIS[2]]])
		expect(emitted('update:recent')).toEqual([[['🐈']]])
	})
})

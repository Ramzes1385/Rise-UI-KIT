import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseEmojiPicker from '../ui/BaseEmojiPicker.vue'
import type { EmojiPickerItem } from '../types/BaseEmojiPicker.types'

const EMOJIS: EmojiPickerItem[] = [
	{ emoji: '😀', label: 'широко улыбается', category: 'smileys' },
	{ emoji: '👋', label: 'машет рукой', category: 'people' },
]

const PARTS = ['search', 'input', 'nav', 'tab', 'grid', 'heading', 'emoji', 'preview'] as const

const part = (container: Element, name: string) => container.querySelector(`.base-emoji-picker__${name}`)

describe('BaseEmojiPicker: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseEmojiPicker, { props: { emojis: EMOJIS } })

		expect(container.querySelector('.base-emoji-picker')).toHaveAttribute('class', 'base-emoji-picker')
		for (const name of PARTS.filter(item => item !== 'search' && item !== 'input')) {
			expect(part(container, name)).toHaveAttribute('class', `base-emoji-picker__${name}`)
		}
		expect(part(container, 'search')).toHaveClass('base-emoji-picker__search', 'base-input')
		expect(part(container, 'input')).toHaveAttribute('class', 'base-input__field base-emoji-picker__input')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries(['root', ...PARTS].map(name => [name, `u-${name}`]))
		const { container } = render(BaseEmojiPicker, {
			props: {
				emojis: EMOJIS,
				variant: 'soft',
				isDisabled: true,
				customClass: { root: 'own-root', search: 'own-search', grid: 'own-grid' },
				ui,
			},
		})

		expect(container.querySelector('.base-emoji-picker')).toHaveClass(
			'base-emoji-picker',
			'u-root',
			'base-emoji-picker--soft',
			'base-emoji-picker--disabled',
			'own-root',
		)
		for (const name of PARTS) expect(part(container, name)).toHaveClass(`base-emoji-picker__${name}`, `u-${name}`)
		expect(part(container, 'search')).toHaveClass('own-search')
		expect(part(container, 'grid')).toHaveClass('own-grid')
	})

	it('классы из defaults.BaseEmojiPicker.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseEmojiPicker, {
			props: { emojis: EMOJIS, ui: { emoji: 'own-emoji' } },
			global: {
				plugins: [createUiKitPlugin({ defaults: { BaseEmojiPicker: { ui: { root: 'app-root', emoji: 'app-emoji' } } } })],
			},
		})

		expect(container.querySelector('.base-emoji-picker')).toHaveClass('app-root')
		expect(part(container, 'emoji')).toHaveAttribute('class', 'base-emoji-picker__emoji app-emoji own-emoji')
	})
})

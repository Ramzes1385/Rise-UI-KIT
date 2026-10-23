import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseMention from '../ui/BaseMention.vue'
import { fireEvent, render } from '@testing-library/vue'
import { MENTION_PARTS } from '../types/BaseMention.types'
import type { MentionOption } from '../types/BaseMention.types'

const TEAM: MentionOption[] = [
	{ value: 'anna', label: 'Анна', description: 'Дизайн', avatar: '/anna.png' },
	{ value: 'ivan', label: 'Иван' },
]

const ui = Object.fromEntries([['root', 'u-root'], ...MENTION_PARTS.map(part => [part, `u-${part}`])])

async function typeAt(field: HTMLTextAreaElement, value: string): Promise<void> {
	await fireEvent.update(field, value)
	field.setSelectionRange(value.length, value.length)
	await fireEvent.keyUp(field, { key: value.at(-1) })
}

describe('BaseMention: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита', async () => {
		const { container } = render(BaseMention, { props: { options: TEAM, label: 'Текст', error: 'Ошибка', variant: 'soft', ui } })
		const root = container.querySelector('.base-mention')!

		await typeAt(container.querySelector('textarea')!, '@')
		expect(root).toHaveClass('u-root', 'base-mention--soft', 'base-mention--error')
		for (const part of MENTION_PARTS.filter(part => part !== 'empty')) {
			expect(root.querySelector(`.base-mention__${part}`), part).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-mention__avatar')).toHaveClass('u-avatar')

		await typeAt(container.querySelector('textarea')!, '@нет')
		expect(root.querySelector('.base-mention__empty')).toHaveClass('u-empty')
	})

	it('без ui — только класс кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseMention, {
			props: { label: 'Текст', ui: { control: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseMention: { ui: { control: 'app', field: 'app-field' } } } })] },
		})

		expect(container.querySelector('.base-mention__label')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-mention__field')).toHaveAttribute('class', 'base-mention__field app-field')
		expect(container.querySelector('.base-mention__control')).toHaveAttribute('class', 'base-mention__control app own')
	})
})

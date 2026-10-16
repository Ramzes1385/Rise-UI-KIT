import '@testing-library/jest-dom/vitest'
import BaseMention from '../ui/BaseMention.vue'
import type { MentionOption } from '../types/BaseMention.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const TEAM: MentionOption[] = [
	{ value: 'tanaka', label: '田中さん' },
	{ value: 'li', label: '李明' },
]

describe('BaseMention: ввод через IME', () => {
	it('Safari: стрелки и Enter с keyCode 229 остаются IME, список упоминаний не перехватывает их', async () => {
		render(BaseMention, { props: { options: TEAM, label: 'Текст' } })
		const field = screen.getByRole('textbox') as HTMLTextAreaElement
		field.focus()
		await fireEvent.update(field, '@')
		field.setSelectionRange(1, 1)
		await fireEvent.keyUp(field, { key: '@' })
		const press = (key: string, keyCode: number): boolean =>
			field.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode, cancelable: true, bubbles: true }))

		expect(screen.getAllByRole('option')).toHaveLength(2)
		expect(press('Enter', 229)).toBe(true)
		expect(press('ArrowDown', 229)).toBe(true)
		expect(press('ArrowDown', 40)).toBe(false)
	})
})

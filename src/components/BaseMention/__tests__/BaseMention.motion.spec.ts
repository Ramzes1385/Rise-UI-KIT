import '@testing-library/jest-dom/vitest'
import BaseMention from '../ui/BaseMention.vue'
import type { MentionOption } from '../types/BaseMention.types'
import { fireEvent, render, waitFor } from '@testing-library/vue'

const TEAM: MentionOption[] = [{ value: 'anna', label: 'Анна' }]

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

async function openPopup() {
	const view = render(BaseMention, { props: { options: TEAM }, global: { stubs: { transition: false } } })
	const field = view.container.querySelector('textarea')!
	await fireEvent.update(field, '@')
	field.setSelectionRange(1, 1)
	await fireEvent.keyUp(field, { key: '@' })
	return { ...view, field, popup: () => view.container.querySelector('.base-mention__popup') }
}

describe('BaseMention: движение попапа', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('обычный режим: попап появляется и уходит переходом base-mention-popup, ссылка aria-controls снимается сразу', async () => {
		stubReducedMotion(false)
		const { field, popup } = await openPopup()

		expect(popup()).toHaveClass('base-mention-popup-enter-active')
		expect(field).toHaveAttribute('aria-controls')

		await fireEvent.keyDown(field, { key: 'Escape' })
		expect(popup()).toHaveClass('base-mention-popup-leave-active')
		expect(field).not.toHaveAttribute('aria-controls')
		expect(field).not.toHaveAttribute('aria-activedescendant')
		await waitFor(() => expect(popup()).toBeNull())
	})

	it.each([
		['prefers-reduced-motion: reduce', () => stubReducedMotion(true)],
		[
			'пресет none',
			() => {
				stubReducedMotion(false)
				document.documentElement.setAttribute('data-rise-motion', 'none')
			},
		],
	])('%s — попап появляется и исчезает сразу, без классов перехода', async (_, setup) => {
		setup()
		const { field, popup } = await openPopup()

		expect(popup()).not.toHaveClass('base-mention-popup-enter-active')
		await fireEvent.keyDown(field, { key: 'Escape' })
		expect(popup()).toBeNull()
		expect(field).not.toHaveAttribute('aria-controls')
	})
})

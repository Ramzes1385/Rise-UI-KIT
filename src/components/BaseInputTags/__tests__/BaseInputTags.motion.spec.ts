import '@testing-library/jest-dom/vitest'
import BaseInputTags from '../ui/BaseInputTags.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const STUBS = { transition: false, 'transition-group': false }

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function renderTags(modelValue: string[], props: Record<string, unknown> = {}) {
	const view = render(BaseInputTags, {
		props: {
			modelValue,
			ariaLabel: 'Навыки',
			...props,
			'onUpdate:modelValue': (value: string[]) => view.rerender({ modelValue: value }),
		},
		global: { stubs: STUBS },
	})
	const tags = () => [...view.container.querySelectorAll<HTMLElement>('.base-input-tags__tag')]
	return { ...view, tags }
}

describe('BaseInputTags: движение', () => {
	beforeEach(() => stubReducedMotion(false))

	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('удалённый тег уходит с анимацией: на время ухода закреплён на своём месте', async () => {
		const { tags } = renderTags(['Vue', 'Vite', 'Pinia'])

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить Vite' }))
		const leaving = tags().find(tag => tag.textContent?.includes('Vite'))!

		expect(tags()).toHaveLength(3)
		expect(leaving).toHaveClass('base-input-tags-tag-leave-active')
		expect(leaving.style.left).toBe('0px')
		expect(leaving.style.top).toBe('0px')
		expect(leaving.style.width).toBe('0px')
	})

	it('новый тег появляется с анимацией, соседи не пересоздаются', async () => {
		const { tags, rerender } = renderTags(['Vue'])
		const [first] = tags()

		await rerender({ modelValue: ['Vue', 'Vite'] })

		expect(tags()[0]).toBe(first)
		expect(tags()[1]).toHaveClass('base-input-tags-tag-enter-active')
	})

	it('повторяющиеся теги получают разные ключи', () => {
		const { tags } = renderTags(['Vue', 'Vue'], { isUnique: false })

		expect(tags()).toHaveLength(2)
	})

	it('prefers-reduced-motion: reduce — тег уходит и появляется сразу', async () => {
		stubReducedMotion(true)
		const { tags, rerender } = renderTags(['Vue', 'Vite'])

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить Vue' }))
		expect(tags().map(tag => tag.textContent)).toEqual(['Vite'])

		await rerender({ modelValue: ['Vite', 'Pinia'] })
		expect(tags()[1].className).toBe('base-input-tags__tag')
	})

	it('пресет none — сразу конечное состояние', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { tags } = renderTags(['Vue', 'Vite'])

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить Vite' }))
		expect(tags().map(tag => tag.textContent)).toEqual(['Vue'])
	})
})

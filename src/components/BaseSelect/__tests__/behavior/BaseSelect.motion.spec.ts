import '@testing-library/jest-dom/vitest'
import BaseSelect from '../../ui/BaseSelect.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseSelectOption } from '../../types/BaseSelect.types'

const OPTIONS: BaseSelectOption[] = [
	{ value: 'drama', label: 'Драма' },
	{ value: 'comedy', label: 'Комедия' },
	{ value: 'fantasy', label: 'Фэнтези' },
]

const STUBS = { transition: false, 'transition-group': false }

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function renderSelect(modelValue: string | string[], isMultiple = true) {
	const view: ReturnType<typeof render> = render(BaseSelect, {
		props: {
			modelValue,
			options: OPTIONS,
			isMultiple,
			ariaLabel: 'Жанры',
			'onUpdate:modelValue': (value: string | number | (string | number)[]): Promise<void> => view.rerender({ modelValue: value }),
		},
		global: { stubs: STUBS },
	})
	const tags = () => [...view.container.querySelectorAll<HTMLElement>('.base-select__tag')]
	return { ...view, tags }
}

describe('BaseSelect: движение', () => {
	beforeEach(() => stubReducedMotion(false))

	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
		document.body.innerHTML = ''
	})

	it('снятая метка уходит с анимацией и на время ухода закреплена на своём месте', async () => {
		const { tags } = renderSelect(['drama', 'comedy', 'fantasy'])

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить Комедия' }))
		const leaving = tags().find(tag => tag.textContent?.includes('Комедия'))!

		expect(tags()).toHaveLength(3)
		expect(leaving).toHaveClass('base-select-tag-leave-active')
		expect(leaving.style.left).toBe('0px')
		expect(leaving.style.top).toBe('0px')
		expect(leaving.style.width).toBe('0px')
	})

	it('новая метка появляется с анимацией, соседи не пересоздаются; последняя — уходит, плейсхолдер сразу', async () => {
		const { tags, rerender, container } = renderSelect(['drama'])
		const [first] = tags()

		await rerender({ modelValue: ['drama', 'fantasy'] })
		expect(tags()[0]).toBe(first)
		expect(tags()[1]).toHaveClass('base-select-tag-enter-active')

		await rerender({ modelValue: [] })
		expect(container.querySelector('.base-select__placeholder')).toBeInTheDocument()
	})

	it('галочка выбранного пункта появляется плавно', async () => {
		renderSelect([])

		await fireEvent.click(screen.getByRole('combobox'))
		await fireEvent.click(screen.getByRole('option', { name: 'Драма' }))

		expect(document.body.querySelector('.base-select__checkbox .base-icon')).toHaveClass('base-select-check-enter-active')
	})

	it('prefers-reduced-motion: reduce — метки и галочка сразу в конечном состоянии', async () => {
		stubReducedMotion(true)
		const { tags } = renderSelect(['drama', 'comedy'])

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить Драма' }))
		expect(tags().map(tag => tag.textContent?.trim())).toEqual(['Комедия'])

		await fireEvent.click(screen.getByRole('combobox'))
		await fireEvent.click(screen.getByRole('option', { name: 'Фэнтези' }))
		expect(tags()[1]).not.toHaveClass('base-select-tag-enter-active')
		expect(document.body.querySelector('.base-select__checkbox .base-icon')).not.toHaveClass('base-select-check-enter-active')
	})

	it('одиночный выбор: галочка у нового значения появляется плавно, в пресете none — сразу', async () => {
		const { rerender } = renderSelect('drama', false)
		await fireEvent.click(screen.getByRole('combobox'))
		await rerender({ modelValue: 'comedy' })
		const check = (name: string) => screen.getByRole('option', { name }).querySelector('.base-select__check')
		expect(check('Комедия')).toHaveClass('base-select-check-enter-active')
		expect(check('Драма')).toHaveClass('base-select-check-leave-active')

		document.documentElement.setAttribute('data-rise-motion', 'none')
		await rerender({ modelValue: 'fantasy' })
		expect(check('Фэнтези')).not.toHaveClass('base-select-check-enter-active')
	})
})

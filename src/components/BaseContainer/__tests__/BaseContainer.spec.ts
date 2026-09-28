import '@testing-library/jest-dom/vitest'
import BaseContainer from '../ui/BaseContainer.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseContainer unit', () => {
	it('рендерит содержимое в div шириной xl', () => {
		const { container } = render(BaseContainer, { slots: { default: 'Содержимое' } })
		const root = container.querySelector('.base-container') as HTMLElement
		expect(screen.getByText('Содержимое')).toBeInTheDocument()
		expect(root.tagName).toBe('DIV')
		expect(root).toHaveClass('base-container--xl')
	})

	it('size и tag задают ширину и тег', () => {
		const { container } = render(BaseContainer, { props: { size: 'sm', tag: 'section' } })
		const root = container.querySelector('.base-container') as HTMLElement
		expect(root.tagName).toBe('SECTION')
		expect(root).toHaveClass('base-container--sm')
	})

	it('пишет --size-scale и добавляет customClass', () => {
		const { container } = render(BaseContainer, { props: { sizeScale: 125, customClass: { root: 'my-root' } } })
		const root = container.querySelector('.base-container') as HTMLElement
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(root).toHaveClass('my-root')
	})
})

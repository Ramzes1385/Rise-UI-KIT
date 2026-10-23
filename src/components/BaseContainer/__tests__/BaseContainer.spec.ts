import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
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

	it('ui добавляет классы к корню после классов кита', () => {
		const { container } = render(BaseContainer, { props: { ui: { root: 'own-root' } } })
		expect(container.firstElementChild).toHaveAttribute('class', 'base-container own-root base-container--xl')
	})

	it('классы из defaults.BaseContainer.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseContainer, {
			props: { ui: { root: 'own-root' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseContainer: { ui: { root: 'app-root' } } } })] },
		})
		expect(container.firstElementChild).toHaveClass('base-container', 'app-root', 'own-root')
	})
})

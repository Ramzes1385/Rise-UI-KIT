import '@testing-library/jest-dom/vitest'
import BaseGrid from '../ui/BaseGrid.vue'
import { createUiKitPlugin } from '@/plugin'
import BaseGridItem from '../ui/BaseGridItem.vue'
import { render, screen } from '@testing-library/vue'

function rootOf(container: Element): HTMLElement {
	return container.firstElementChild as HTMLElement
}

describe('BaseGrid unit', () => {
	it('рендерит слот в div с 12 колонками и отступом md', () => {
		const { container } = render(BaseGrid, { slots: { default: 'Сетка' } })
		const root = rootOf(container)
		expect(screen.getByText('Сетка')).toBeInTheDocument()
		expect(root.tagName).toBe('DIV')
		expect(root).toHaveClass('base-grid', 'base-grid--gap-md')
		expect(root.style.getPropertyValue('--base-grid-cols-base')).toBe('12')
		expect(root.className).not.toContain('row-gap')
	})

	it('число cols пишет переменную base', () => {
		const { container } = render(BaseGrid, { props: { cols: 3 } })
		expect(rootOf(container).style.getPropertyValue('--base-grid-cols-base')).toBe('3')
	})

	it('объект cols пишет переменные по шагам', () => {
		const { container } = render(BaseGrid, { props: { cols: { base: 1, md: 2, xl: 4 } } })
		const root = rootOf(container)
		expect(root.style.getPropertyValue('--base-grid-cols-base')).toBe('1')
		expect(root.style.getPropertyValue('--base-grid-cols-sm')).toBe('')
		expect(root.style.getPropertyValue('--base-grid-cols-md')).toBe('2')
		expect(root.style.getPropertyValue('--base-grid-cols-xl')).toBe('4')
	})

	it('gap и rowGap задают классы', () => {
		const { container } = render(BaseGrid, { props: { gap: 'xs', rowGap: 'xl' } })
		expect(rootOf(container)).toHaveClass('base-grid--gap-xs', 'base-grid--row-gap-xl')
	})

	it('tag, sizeScale, customClass и ui', () => {
		const { container } = render(BaseGrid, {
			props: { tag: 'ul', sizeScale: 125, customClass: { root: 'my-root' }, ui: { root: 'own-root' } },
		})
		const root = rootOf(container)
		expect(root.tagName).toBe('UL')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(root).toHaveClass('my-root', 'own-root')
	})

	it('defaults.BaseGrid плагина применяются', () => {
		const { container } = render(BaseGrid, {
			global: { plugins: [createUiKitPlugin({ defaults: { BaseGrid: { cols: 6, gap: 'lg' } } })] },
		})
		const root = rootOf(container)
		expect(root).toHaveClass('base-grid--gap-lg')
		expect(root.style.getPropertyValue('--base-grid-cols-base')).toBe('6')
	})
})

describe('BaseGridItem unit', () => {
	it('без пропсов нет ни одной переменной, тег div', () => {
		const { container } = render(BaseGridItem, { slots: { default: 'Ячейка' } })
		const root = rootOf(container)
		expect(screen.getByText('Ячейка')).toBeInTheDocument()
		expect(root.tagName).toBe('DIV')
		expect(root).toHaveClass('base-grid-item')
		expect(root.getAttribute('style')).toBeNull()
	})

	it('span, offset и order пишут переменные base', () => {
		const { container } = render(BaseGridItem, { props: { span: 4, offset: 2, order: 3, tag: 'li' } })
		const root = rootOf(container)
		expect(root.tagName).toBe('LI')
		expect(root.style.getPropertyValue('--base-grid-item-column-base')).toBe('3 / span 4')
		expect(root.style.getPropertyValue('--base-grid-item-order-base')).toBe('3')
	})

	it('full и объекты по шагам', () => {
		const { container } = render(BaseGridItem, {
			props: { span: { base: 'full', lg: 4 }, offset: { lg: 2 }, order: { md: -1 } },
		})
		const root = rootOf(container)
		expect(root.style.getPropertyValue('--base-grid-item-column-base')).toBe('1 / -1')
		expect(root.style.getPropertyValue('--base-grid-item-column-lg')).toBe('3 / span 4')
		expect(root.style.getPropertyValue('--base-grid-item-order-md')).toBe('-1')
	})

	it('ui и defaults.BaseGridItem плагина', () => {
		const { container } = render(BaseGridItem, {
			props: { ui: { root: 'own-root' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseGridItem: { tag: 'section' } } })] },
		})
		const root = rootOf(container)
		expect(root.tagName).toBe('SECTION')
		expect(root).toHaveClass('base-grid-item', 'own-root')
	})
})

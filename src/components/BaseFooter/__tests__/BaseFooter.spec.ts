import '@testing-library/jest-dom/vitest'
import BaseFooter from '../ui/BaseFooter.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseFooter unit', () => {
	it('рендерит <footer> с тремя зонами', () => {
		const { container } = render(BaseFooter, { slots: { start: '© 2026 Rise', default: 'Ссылки', end: 'Соцсети' } })
		expect(screen.getByRole('contentinfo')).toBeInTheDocument()
		expect(container.querySelector('.base-footer__start')).toHaveTextContent('© 2026 Rise')
		expect(container.querySelector('.base-footer__center')).toHaveTextContent('Ссылки')
		expect(container.querySelector('.base-footer__end')).toHaveTextContent('Соцсети')
		expect(container.querySelector('.base-footer__inner')).toHaveClass('base-container--full')
	})

	it('пустые зоны не рендерятся', () => {
		const { container } = render(BaseFooter, { slots: { default: 'Ссылки' } })
		expect(container.querySelector('.base-footer__start')).not.toBeInTheDocument()
		expect(container.querySelector('.base-footer__end')).not.toBeInTheDocument()
	})

	it('containerSize, вариант и customClass', () => {
		const { container } = render(BaseFooter, { props: { containerSize: 'lg', variant: 'soft', customClass: { inner: 'my-inner' } } })
		expect(container.querySelector('.base-footer')).toHaveClass('base-footer--soft')
		expect(container.querySelector('.base-footer__inner')).toHaveClass('base-container--lg', 'my-inner')
	})
})

const COLUMNS = [
	{
		title: 'Продукт',
		links: [
			{ label: 'Цены', href: '#pricing' },
			{ label: 'Обновления', to: '/changelog' },
		],
	},
	{ title: 'Компания', links: [{ label: 'О нас', href: '#about' }] },
]

describe('BaseFooter: раскладки', () => {
	it('columns — навигация на колонку с именем по заголовку', () => {
		const { container } = render(BaseFooter, { props: { columns: COLUMNS }, slots: { start: '© 2026 Rise' } })
		const product = screen.getByRole('navigation', { name: 'Продукт' })
		expect(product.querySelectorAll('li')).toHaveLength(2)
		expect(screen.getByRole('link', { name: 'Цены' })).toHaveAttribute('href', '#pricing')
		expect(screen.getByRole('navigation', { name: 'Компания' })).toBeInTheDocument()
		expect(container.querySelector('.base-footer__about')).not.toBeInTheDocument()
		expect(container.querySelector('.base-footer__inner')).toHaveTextContent('© 2026 Rise')
	})

	it('слот top без нижней строки: нижней строки нет', () => {
		const { container } = render(BaseFooter, { slots: { top: '<p>Rise Studio</p>' } })
		expect(container.querySelector('.base-footer__about')).toHaveTextContent('Rise Studio')
		expect(container.querySelector('.base-footer__columns')).not.toBeInTheDocument()
		expect(container.querySelector('.base-footer__inner')).not.toBeInTheDocument()
	})

	it('без верхней части нижняя строка есть всегда; isCompact — модификатор', () => {
		const { container } = render(BaseFooter, { props: { isCompact: true, columns: [] } })
		expect(container.querySelector('.base-footer__top')).not.toBeInTheDocument()
		expect(container.querySelector('.base-footer__inner')).toBeInTheDocument()
		expect(container.querySelector('.base-footer')).toHaveClass('base-footer--compact')
	})
})

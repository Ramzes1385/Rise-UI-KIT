import '@testing-library/jest-dom/vitest'
import { createSSRApp, h } from 'vue'
import BaseStack from '../ui/BaseStack.vue'
import { createUiKitPlugin } from '@/plugin'
import { renderToString } from 'vue/server-renderer'
import { render, screen } from '@testing-library/vue'

describe('BaseStack unit', () => {
	it('рендерит содержимое слота в div со значениями по умолчанию', () => {
		const { container } = render(BaseStack, { slots: { default: 'Содержимое' } })
		const root = container.querySelector('.base-stack') as HTMLElement
		expect(screen.getByText('Содержимое')).toBeInTheDocument()
		expect(root.tagName).toBe('DIV')
		expect(root).toHaveClass('base-stack--column', 'base-stack--gap-md', 'base-stack--align-stretch', 'base-stack--justify-start')
		expect(root).not.toHaveClass('base-stack--wrap')
		expect(root).not.toHaveClass('base-stack--inline')
	})

	it('direction, gap, align и justify задают классы', () => {
		const { container } = render(BaseStack, {
			props: { direction: 'row-reverse', gap: 'xl', align: 'baseline', justify: 'evenly' },
		})
		expect(container.firstElementChild).toHaveClass(
			'base-stack--row-reverse',
			'base-stack--gap-xl',
			'base-stack--align-baseline',
			'base-stack--justify-evenly',
		)
	})

	it('isWrap и isInline добавляют модификаторы', () => {
		const { container } = render(BaseStack, { props: { isWrap: true, isInline: true } })
		expect(container.firstElementChild).toHaveClass('base-stack--wrap', 'base-stack--inline')
	})

	it('tag меняет тег корня', () => {
		const { container } = render(BaseStack, { props: { tag: 'section' } })
		expect(container.firstElementChild?.tagName).toBe('SECTION')
	})

	it('пишет --size-scale при sizeScale не равном 100 и не пишет при 100', () => {
		const scaled = render(BaseStack, { props: { sizeScale: 125 } })
		expect((scaled.container.firstElementChild as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
		const plain = render(BaseStack)
		expect((plain.container.firstElementChild as HTMLElement).style.getPropertyValue('--size-scale')).toBe('')
	})

	it('customClass.root и ui.root добавляют классы', () => {
		const { container } = render(BaseStack, { props: { customClass: { root: 'my-root' }, ui: { root: 'own-root' } } })
		expect(container.firstElementChild).toHaveClass('base-stack', 'my-root', 'own-root')
	})

	it('значения из defaults.BaseStack плагина применяются, ui склеивается с экземпляром', () => {
		const { container } = render(BaseStack, {
			props: { ui: { root: 'own-root' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseStack: { gap: 'lg', ui: { root: 'app-root' } } } })] },
		})
		expect(container.firstElementChild).toHaveClass('base-stack--gap-lg', 'app-root', 'own-root')
	})

	it('рендерится на сервере без ошибок', async () => {
		const html = await renderToString(createSSRApp({ render: () => h(BaseStack, null, { default: () => 'SSR' }) }))
		expect(html).toContain('base-stack')
		expect(html).toContain('SSR')
	})
})

import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseEditor from '../ui/BaseEditor.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }

const UI = {
	root: 'u-root',
	toolbar: 'u-toolbar',
	group: 'u-group',
	btn: 'u-btn',
	content: 'u-content',
	code: 'u-code',
	'context-menu': 'u-menu',
}

describe('BaseEditor: проп ui', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('без ui — только классы кита', () => {
		const { container } = render(BaseEditor, { global: { stubs } })

		const root = container.querySelector('.base-editor') as HTMLElement
		expect(root.className.split(' ').every(name => name.startsWith('base-editor'))).toBe(true)
		expect(container.querySelector('.base-editor__toolbar')).toHaveAttribute('class', 'base-editor__toolbar')
		expect(container.querySelector('.base-editor__group')).toHaveAttribute('class', 'base-editor__group')
		expect(container.querySelector('.base-editor__content')).toHaveAttribute(
			'class',
			'base-editor__content base-editor__content--empty',
		)
		expect(container.querySelector('label.base-editor__btn')).toHaveAttribute('class', 'base-editor__btn base-editor__btn--file')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const { container } = render(BaseEditor, {
			props: {
				modelValue: '<p><img src="data:," alt="Схема"></p>',
				variant: 'soft',
				customClass: { root: 'own-root', toolbar: 'own-toolbar', btn: 'own-btn', content: 'own-content' },
				ui: UI,
			},
			global: { stubs },
		})

		expect(container.querySelector('.base-editor')).toHaveClass('base-editor', 'u-root', 'base-editor--soft', 'own-root')
		expect(container.querySelector('.base-editor__toolbar')).toHaveClass('u-toolbar', 'own-toolbar')
		expect(container.querySelector('.base-editor__group')).toHaveClass('u-group')
		expect(screen.getByRole('button', { name: 'Жирный' })).toHaveClass('base-editor__btn', 'u-btn', 'own-btn')
		expect(container.querySelector('label.base-editor__btn')).toHaveClass('base-editor__btn--file', 'u-btn', 'own-btn')
		expect(container.querySelector('.base-editor__content')).toHaveClass('u-content', 'own-content')

		await fireEvent.contextMenu(container.querySelector('.base-editor__content img') as HTMLImageElement)
		expect(await screen.findByRole('dialog', { name: 'Размер медиа' })).toHaveClass('base-editor__context-menu', 'u-menu')
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		expect(container.querySelector('.base-editor__code')).toHaveClass('base-textarea', 'u-code')
	})

	it('классы из defaults.BaseEditor.ui плагина склеиваются с классами экземпляра, в том числе в тулбаре', () => {
		const { container } = render(BaseEditor, {
			props: { ui: { toolbar: 'own-toolbar', content: 'own-content' } },
			global: {
				stubs,
				plugins: [
					createUiKitPlugin({
						defaults: { BaseEditor: { ui: { root: 'app-root', toolbar: 'app-toolbar', content: 'app-content' } } },
					}),
				],
			},
		})

		expect(container.querySelector('.base-editor')).toHaveClass('app-root')
		expect(container.querySelector('.base-editor__toolbar')).toHaveAttribute('class', 'base-editor__toolbar app-toolbar own-toolbar')
		expect(container.querySelector('.base-editor__content')).toHaveClass('base-editor__content', 'app-content', 'own-content')
	})

	it('новые классы ui применяются без перемонтирования', async () => {
		const { container, rerender } = render(BaseEditor, { props: { ui: { toolbar: 'first' } }, global: { stubs } })

		await rerender({ ui: { toolbar: 'second' } })

		expect(container.querySelector('.base-editor__toolbar')).toHaveAttribute('class', 'base-editor__toolbar second')
	})
})

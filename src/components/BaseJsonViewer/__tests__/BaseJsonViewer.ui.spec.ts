import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseJsonViewer from '../ui/BaseJsonViewer.vue'
import { JSON_VIEWER_PARTS } from '../types/BaseJsonViewer.types'

const VALUE = { id: 1, user: { name: 'Павел' } }

describe('BaseJsonViewer: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseJsonViewer, { props: { value: VALUE, label: 'Данные' } })

		expect(container.querySelector('.base-json-viewer')).toHaveAttribute('class', 'base-json-viewer')
		for (const part of ['toolbar', 'status', 'node', 'key', 'colon'])
			expect(container.querySelector(`.base-json-viewer__${part}`)).toHaveAttribute('class', `base-json-viewer__${part}`)
		expect(container.querySelector('.base-json-viewer__value')).toHaveAttribute(
			'class',
			'base-json-viewer__value base-json-viewer__value--number',
		)
		expect(container.querySelector('.base-json-viewer__tree')).toHaveClass('base-tree')
	})

	it('классы всех частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries(['root', ...JSON_VIEWER_PARTS].map(part => [part, `u-${part}`]))
		const { container } = render(BaseJsonViewer, {
			props: {
				value: VALUE,
				label: 'Данные',
				variant: 'soft',
				customClass: { root: 'own-root', toolbar: 'own-toolbar', tree: 'own-tree' },
				ui,
			},
		})
		const root = container.querySelector('.base-json-viewer')!

		expect(root).toHaveClass('u-root', 'base-json-viewer--soft', 'own-root')
		for (const part of JSON_VIEWER_PARTS) expect(root.querySelector(`.base-json-viewer__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-json-viewer__toolbar')).toHaveClass('own-toolbar')
		expect(root.querySelector('.base-json-viewer__tree')).toHaveClass('base-tree', 'own-tree')
		expect(root.querySelector('.base-json-viewer__value')).toHaveClass('base-json-viewer__value--number')
	})

	it('классы из defaults.BaseJsonViewer.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseJsonViewer, {
			props: { value: VALUE, label: 'Данные', ui: { key: 'own-key' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseJsonViewer: { ui: { root: 'app-root', key: 'app-key' } } } })] },
		})

		expect(container.querySelector('.base-json-viewer')).toHaveClass('base-json-viewer', 'app-root')
		expect(container.querySelector('.base-json-viewer__key')).toHaveAttribute('class', 'base-json-viewer__key app-key own-key')
	})
})

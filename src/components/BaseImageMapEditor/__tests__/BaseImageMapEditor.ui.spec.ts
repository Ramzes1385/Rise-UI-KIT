import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { makeMap, renderEditor } from './utils/editorTestUtils'
import { IMAGE_MAP_EDITOR_PARTS } from '../types/BaseImageMapEditor.types'

const PARTS = IMAGE_MAP_EDITOR_PARTS.filter(part => part !== 'empty' && part !== 'toggle')

describe('BaseImageMapEditor: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass и модификаторы сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...IMAGE_MAP_EDITOR_PARTS.map(part => [part, `u-${part}`])])
		const { container } = renderEditor({
			selected: 'r1',
			error: 'Ошибка',
			ui,
			customClass: { panel: 'own-panel', canvas: 'own-canvas' },
		})
		const root = container.querySelector('.base-image-map-editor')!
		expect(root).toHaveClass('base-image-map-editor', 'u-root', 'base-image-map-editor--error')
		for (const part of PARTS) {
			const elements = root.querySelectorAll(`.base-image-map-editor__${part}`)
			expect(elements.length).toBeGreaterThan(0)
			for (const element of elements) expect(element).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-image-map-editor__panel')).toHaveClass('own-panel')
		expect(root.querySelector('.base-image-map-editor__viewport')).toHaveClass('own-canvas')
		expect(root.querySelector('.base-image-map-editor__stage')).toHaveClass('base-image-map-editor__stage--select')
		expect(root.querySelector('.base-image-map-editor__item--selected')).toHaveClass('u-item')
	})

	it('пустой редактор: класс ui у пустого состояния', () => {
		const { container } = renderEditor({ modelValue: undefined, ui: { empty: 'u-empty' } })
		expect(container.querySelector('.base-image-map-editor__empty')).toHaveClass('u-empty')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = renderEditor(
			{ modelValue: makeMap(), ui: { viewport: 'own' } },
			{
				global: {
					plugins: [
						createUiKitPlugin({
							defaults: { BaseImageMapEditor: { ui: { viewport: 'app', root: 'app-root', item: 'app-item' } } },
						}),
					],
				},
			},
		)
		expect(container.querySelector('.base-image-map-editor')).toHaveClass('app-root')
		expect(container.querySelector('.base-image-map-editor__viewport')).toHaveAttribute(
			'class',
			'base-image-map-editor__viewport app own',
		)
		expect(container.querySelector('.base-image-map-editor__item')).toHaveClass('app-item')
		expect(container.querySelector('.base-image-map-editor__toolbar')).toHaveAttribute('class', 'base-image-map-editor__toolbar')
		expect(container.querySelector('.base-image-map-editor__heading')).toHaveAttribute('class', 'base-image-map-editor__heading')
	})
})

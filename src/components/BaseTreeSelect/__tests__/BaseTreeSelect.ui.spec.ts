import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BaseTreeSelect from '../ui/BaseTreeSelect.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'

const ITEMS: TreeNode[] = [
	{
		id: 'center',
		label: 'Центр',
		children: [
			{ id: 'moscow', label: 'Москва' },
			{ id: 'tula', label: 'Тула' },
		],
	},
	{ id: 'kazan', label: 'Казань', icon: 'star' },
]

const motionGlobal = { stubs: { 'transition-group': false } }

function uiOf(parts: readonly string[]): Record<string, string> {
	return Object.fromEntries([['root', 'u-root'], ...parts.map(part => [part, `u-${part}`])])
}

const inDocument = (part: string): Element | null => document.querySelector(`.base-tree-select__${part}`)

describe('BaseTreeSelect: проп ui', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('классы частей поля и панели (одиночный выбор) добавляются к БЭМ-классам кита', async () => {
		const user = userEvent.setup()
		const parts = ['dropdown', 'label', 'required', 'trigger', 'values', 'value-text', 'arrow', 'error-text']
		const panelParts = ['panel', 'search', 'search-input', 'tree', 'node', 'toggle', 'icon', 'node-label', 'check']
		const ui = uiOf([...parts, ...panelParts])
		const { container } = render(BaseTreeSelect, {
			props: { items: ITEMS, modelValue: 'kazan', label: 'Город', isRequired: true, error: 'Ошибка', isSearchable: true, ui },
		})
		expect(container.querySelector('.base-tree-select')).toHaveClass('base-tree-select', 'u-root')
		for (const part of parts) expect(inDocument(part)).toHaveClass(`base-tree-select__${part}`, `u-${part}`)

		await user.click(screen.getByRole('combobox'))
		for (const part of panelParts) expect(inDocument(part)).toHaveClass(`base-tree-select__${part}`, `u-${part}`)
	})

	it('метки, «+N», флажки и пустое состояние получают классы ui', async () => {
		const user = userEvent.setup()
		const ui = uiOf(['tag', 'tag-text', 'tag-close', 'more', 'checkbox', 'status', 'placeholder'])
		const { rerender } = render(BaseTreeSelect, {
			props: { items: ITEMS, isMultiple: true, modelValue: ['moscow', 'kazan'], maxTagCount: 1, ui },
		})
		for (const part of ['tag', 'tag-text', 'tag-close', 'more']) expect(inDocument(part)).toHaveClass(`u-${part}`)
		await user.click(screen.getByRole('combobox'))
		expect(inDocument('checkbox')).toHaveClass('u-checkbox')
		await user.keyboard('{Escape}')
		await rerender({ items: [], isMultiple: false, modelValue: '', ui })
		expect(inDocument('placeholder')).toHaveClass('u-placeholder')
		await user.click(screen.getByRole('combobox'))
		expect(inDocument('status')).toHaveClass('u-status')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseTreeSelect, {
			props: { items: ITEMS, ui: { trigger: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTreeSelect: { ui: { trigger: 'app', node: 'app-node' } } } })] },
		})
		expect(container.querySelector('.base-tree-select__trigger')).toHaveAttribute('class', 'base-tree-select__trigger app own')
		expect(container.querySelector('.base-tree-select__values')).toHaveAttribute('class', 'base-tree-select__values')
		await user.click(screen.getByRole('combobox'))
		expect(screen.getByRole('treeitem', { name: 'Центр' })).toHaveClass('base-tree-select__node', 'app-node')
	})
})

describe('BaseTreeSelect: движение строк', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('раскрытая ветка: строки детей появляются переходом base-tree-select-row', async () => {
		const user = userEvent.setup()
		render(BaseTreeSelect, { props: { items: ITEMS }, global: motionGlobal })
		await user.click(screen.getByRole('combobox'))
		const center = screen.getByRole('treeitem', { name: 'Центр' })
		expect(center).not.toHaveClass('base-tree-select-row-enter-active')

		await user.keyboard('{ArrowRight}')
		const moscow = screen.getByRole('treeitem', { name: 'Москва' })
		expect(moscow).toHaveClass('base-tree-select-row-enter-active')
		expect(center).toHaveAttribute('aria-expanded', 'true')
	})

	it('свёрнутая ветка: уходящая строка закреплена на месте, без id и скрыта от скринридера, затем удалена', async () => {
		const user = userEvent.setup()
		render(BaseTreeSelect, { props: { items: ITEMS, isDefaultExpandAll: true }, global: motionGlobal })
		await user.click(screen.getByRole('combobox'))
		const tula = screen.getByRole('treeitem', { name: 'Тула' })

		await user.keyboard('{ArrowLeft}')
		expect(tula).toHaveClass('base-tree-select-row-leave-active')
		expect(tula).toHaveAttribute('aria-hidden', 'true')
		expect(tula).not.toHaveAttribute('id')
		expect(tula.style.top).toBe('0px')
		expect(tula.style.width).toBe('0px')
		expect(screen.queryByRole('treeitem', { name: 'Тула' })).not.toBeInTheDocument()
		const kazan = screen.getByRole('treeitem', { name: 'Казань' })
		expect(document.getElementById(kazan.id)).toBe(kazan)
		await waitFor(() => expect(tula).not.toBeInTheDocument())
	})
})

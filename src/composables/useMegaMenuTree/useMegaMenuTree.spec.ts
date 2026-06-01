/**
 * Unit-тесты для useMegaMenuTree.
 * Проверяют реестр раскрытия: открыт только один путь, соседи закрываются.
 */

import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

import { useMegaMenuTree, useMegaMenuTreeProvider } from './useMegaMenuTree'
import type { MegaMenuTree } from './useMegaMenuTree.types'

function withTree(): MegaMenuTree {
	let tree!: MegaMenuTree
	mount({
		setup() {
			tree = useMegaMenuTreeProvider()
			return () => null
		},
	})
	return tree
}

describe('useMegaMenuTree', () => {
	it('по умолчанию ничего не открыто, корневой путь считается открытым', () => {
		const tree = withTree()
		expect(tree.activePath.value).toBe('')
		expect(tree.isPathOpen('Каталог')).toBe(false)
		expect(tree.isPathOpen('')).toBe(true)
	})

	it('open делает путь активным', () => {
		const tree = withTree()
		tree.open('Каталог')
		expect(tree.isPathOpen('Каталог')).toBe(true)
	})

	it('открытие соседа закрывает предыдущий узел того же уровня', () => {
		const tree = withTree()
		tree.open('Каталог')
		tree.open('Услуги')
		expect(tree.isPathOpen('Каталог')).toBe(false)
		expect(tree.isPathOpen('Услуги')).toBe(true)
	})

	it('родитель на активном пути остаётся открытым при раскрытии ребёнка', () => {
		const tree = withTree()
		tree.open('Каталог/Ворота')
		expect(tree.isPathOpen('Каталог')).toBe(true)
		expect(tree.isPathOpen('Каталог/Ворота')).toBe(true)
	})

	it('не считает открытым узел с похожим, но не совпадающим префиксом', () => {
		const tree = withTree()
		tree.open('Каталог/Ворота')
		expect(tree.isPathOpen('Катал')).toBe(false)
	})

	it('close возвращает активный путь к родителю', () => {
		const tree = withTree()
		tree.open('Каталог/Ворота')
		tree.close('Каталог/Ворота')
		expect(tree.isPathOpen('Каталог/Ворота')).toBe(false)
		expect(tree.isPathOpen('Каталог')).toBe(true)
	})

	it('close корневого узла очищает активный путь', () => {
		const tree = withTree()
		tree.open('Каталог')
		tree.close('Каталог')
		expect(tree.activePath.value).toBe('')
	})

	it('useMegaMenuTree без провайдера возвращает автономный реестр', () => {
		let tree!: MegaMenuTree
		const Child = defineComponent({
			setup() {
				tree = useMegaMenuTree()
				return () => null
			},
		})
		mount(Child)

		tree.open('A/child')
		expect(tree.isPathOpen('A/child')).toBe(true)
		tree.open('B')
		expect(tree.isPathOpen('A/child')).toBe(false)
		tree.close('B')
		expect(tree.isPathOpen('B')).toBe(false)
		expect(tree.activePath.value).toBe('')
	})

	it('узлы получают общий реестр через inject от провайдера', () => {
		let childTree!: MegaMenuTree
		const Child = defineComponent({
			setup() {
				childTree = useMegaMenuTree()
				return () => null
			},
		})
		const Parent = defineComponent({
			setup() {
				const provided = useMegaMenuTreeProvider()
				provided.open('Каталог')
				return () => h(Child)
			},
		})
		mount(Parent)

		expect(childTree.isPathOpen('Каталог')).toBe(true)
	})
})

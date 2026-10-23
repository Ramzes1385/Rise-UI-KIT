/** Слоты в Docs Storybook: разбор интерфейса слотов и шаблона (build/plugins/slotDocs.ts). */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createSlotDocsPlugin, readComponentSlots } from '../plugins/slotDocs'

const TYPES = `
export interface BaseCommonSlots {
	/** Подвал */
	footer?: () => unknown
}

export interface BaseXSlots extends BaseCommonSlots {
	/** Содержимое */
	default?: () => unknown
	/** Своя ячейка дня */
	'date-popover'?: (props: {
		/** Дата */
		date: Date
		close: () => void
	}) => unknown
	/** Своя ячейка колонки по её ключу */
	[name: \`cell-\${string}\`]: ((props: { value: unknown }) => unknown) | undefined
	empty?: () => unknown
}
`

const COMPONENT = `
<template>
	<div>
		<slot />
		<slot name="date-popover" :date="date" :close="close" />
		<slot v-for="column in columns" :key="column.key" :name="\`cell-\${column.key}\`" :value="column.value" />
		<slot name="cell-total" />
		<slot name="extra" />
	</div>
</template>

<script setup lang="ts">
defineSlots<BaseXSlots>()
</script>
`

describe('слоты в Docs Storybook', () => {
	let dir = ''
	let file = ''

	beforeAll(() => {
		dir = mkdtempSync(join(tmpdir(), 'slot-docs-'))
		mkdirSync(join(dir, 'BaseX', 'ui'), { recursive: true })
		mkdirSync(join(dir, 'BaseX', 'types'), { recursive: true })
		writeFileSync(join(dir, 'BaseX', 'types', 'BaseX.types.ts'), TYPES)
		file = join(dir, 'BaseX', 'ui', 'BaseX.vue')
		writeFileSync(file, COMPONENT)
	})

	afterAll(() => rmSync(dir, { recursive: true, force: true }))

	it('описания из JSDoc: ключи в кавычках, extends, привязки слота с типами и шаблон имён', () => {
		const result = readComponentSlots(file, COMPONENT)
		expect(result.interfaceName).toBe('BaseXSlots')
		expect(result.found).toBe(true)
		expect(result.slots.map(slot => [slot.name, slot.description])).toEqual([
			['default', 'Содержимое'],
			['date-popover', 'Своя ячейка дня'],
			['empty', ''],
			['footer', 'Подвал'],
			['extra', ''],
		])
		expect(result.slots[1].bindings).toEqual([
			{ name: 'date', title: 'binding', description: 'Дата', type: { name: 'Date' } },
			{ name: 'close', title: 'binding', description: undefined, type: { name: '() => void' } },
		])
		expect(result.patterns).toEqual([
			{
				name: 'cell-{key}',
				description: 'Своя ячейка колонки по её ключу',
				bindings: undefined,
			},
		])
	})

	it('слот шаблона без объявления — в undeclared; имя по шаблону и динамический слот с шаблоном имён — нет', () => {
		const result = readComponentSlots(file, COMPONENT)
		expect(result.undeclared).toEqual(['extra'])
		expect(result.dynamic).toEqual([])
		expect(result.hasDynamic).toBe(true)
	})

	it('без defineSlots все слоты шаблона — без объявления, динамический без шаблона имён — в dynamic', () => {
		const source = '<template><slot /><slot :name="item.slot" /></template>\n<script setup lang="ts">\n</script>'
		const result = readComponentSlots(file, source)
		expect(result.interfaceName).toBeNull()
		expect(result.undeclared).toEqual(['default'])
		expect(result.dynamic).toEqual(['item.slot'])
	})

	it('интерфейс с параметром типа (defineSlots<BaseXSlots<T>>) тоже находится', () => {
		const result = readComponentSlots(file, COMPONENT.replace('defineSlots<BaseXSlots>()', 'defineSlots<BaseXSlots<T>>()'))
		expect(result.interfaceName).toBe('BaseXSlots')
		expect(result.found).toBe(true)
	})

	it('плагин после docgen заменяет __docgenInfo.slots компонента кита', () => {
		const plugin = createSlotDocsPlugin()
		const transform = plugin.transform as (code: string, id: string) => { code: string } | undefined
		const id = join(dir, 'src', 'components', 'BaseX', 'ui', 'BaseX.vue')
		mkdirSync(join(dir, 'src', 'components', 'BaseX', 'ui'), { recursive: true })
		mkdirSync(join(dir, 'src', 'components', 'BaseX', 'types'), { recursive: true })
		writeFileSync(join(dir, 'src', 'components', 'BaseX', 'types', 'BaseX.types.ts'), TYPES)
		writeFileSync(id, COMPONENT)
		const code = 'const _sfc_main = {};_sfc_main.__docgenInfo = { slots: [] };'
		const result = transform(code, id)
		expect(result?.code).toContain('_sfc_main.__docgenInfo.slots = [{"name":"default","description":"Содержимое"}')
		expect(result?.code).toContain('{"name":"cell-{key}","description":"Своя ячейка колонки по её ключу"}')
		expect(transform(code, `${id}?vue&type=style`)).toBeUndefined()
		expect(transform('const _sfc_main = {}', id)).toBeUndefined()
	})
})

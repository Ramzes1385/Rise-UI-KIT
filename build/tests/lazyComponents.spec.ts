import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { LAZY_COMPONENTS } from '../../src/plugin/registry/lazy'
import { LAZY_COMPONENT_NAMES } from '../../src/plugin/registry/lazyNames'

const BUILD_CONFIG = resolve(import.meta.dirname, '../config/build.lib.ts')

describe('ленивые компоненты плагина', () => {
	it('реестр содержит ровно компоненты из общего списка имён', () => {
		expect(Object.keys(LAZY_COMPONENTS).sort()).toEqual([...LAZY_COMPONENT_NAMES].sort())
	})

	it('конфигурация сборки пакета берёт чанки из того же списка и не держит своего', () => {
		const source = readFileSync(BUILD_CONFIG, 'utf8')
		expect(source).toContain("from '../../src/plugin/registry/lazyNames'")
		expect(source).toContain('LAZY_COMPONENT_NAMES.map(')
		expect(source).not.toMatch(/'Base(?:Calendar|Chat|DatePicker|Editor|FileUpload|Table)'/)
	})
})

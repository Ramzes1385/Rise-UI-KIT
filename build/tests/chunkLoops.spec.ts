/**
 * Защита сборки пакета от петель между чанками (решение subpaths-leak, 20.10): ленивый чанк статически импортирует общий код
 * из чанка своего компонента, а компонент вызывает этот чанк по `import()`. Тогда приложение без компонентов получает в сборке
 * все ленивые чанки. Тест читает готовую `dist/` (`npm run build`) и не зависит от конкретных компонентов.
 */

import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'

const DIST = resolve(import.meta.dirname, '../../dist')

/** Статические `import "./x.js"`, `import {…} from "./x.js"`, `export … from "./x.js"`; `import(...)` сюда не попадает */
const STATIC_IMPORT = /\b(?:import|export)\s*(?:[^"';()]*?\bfrom\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g
const DYNAMIC_IMPORT = /\bimport\(\s*["'](\.{1,2}\/[^"']+\.js)["']\s*\)/g

function listJs(dir: string): string[] {
	return readdirSync(dir).flatMap(name => {
		const path = join(dir, name)
		if (statSync(path).isDirectory()) return listJs(path)
		return name.endsWith('.js') ? [path] : []
	})
}

function targets(source: string, pattern: RegExp, file: string): string[] {
	return [...source.matchAll(pattern)].map(match => resolve(dirname(file), match[1]))
}

/** Рёбра `import()` → цель, у которой среди статических импортов (в том числе вложенных) есть вызывающий чанк */
function findChunkLoops(dist: string): string[] {
	const files = listJs(dist)
	const sources = new Map(files.map(file => [file, readFileSync(file, 'utf8')]))
	const statics = new Map<string, string[]>()
	const staticsOf = (file: string) => {
		let list = statics.get(file)
		if (!list) {
			list = sources.has(file) ? targets(sources.get(file)!, STATIC_IMPORT, file) : []
			statics.set(file, list)
		}
		return list
	}
	const reaches = (from: string, goal: string) => {
		const seen = new Set<string>()
		const stack = [from]
		while (stack.length) {
			const file = stack.pop()!
			if (seen.has(file)) continue
			seen.add(file)
			if (file === goal) return true
			stack.push(...staticsOf(file))
		}
		return false
	}
	const loops: string[] = []
	for (const [caller, source] of sources) {
		for (const target of new Set(targets(source, DYNAMIC_IMPORT, caller))) {
			if (target === caller || staticsOf(target).some(next => reaches(next, caller))) {
				loops.push(`${relative(dist, caller)} → import() → ${relative(dist, target)}`)
			}
		}
	}
	return loops.sort()
}

/**
 * Петли, найденные при заведении теста (20.10) и пока не устранённые в коде кита; имена чанков без хеша. Список только сокращается:
 * новая петля роняет тест, а устранённая роняет его, пока строку не уберут отсюда.
 * - `BaseFlowMap → FlowDetails`: панель деталей (ленивая) берёт из чанка `BaseFlowMap` общие функции карты;
 * - `useCryptoPro → plugin`: `plugin` статически импортирует `useCryptoPro`, а тот вызывает `plugin` по `import()`.
 */
const KNOWN_LOOPS = ['chunks/BaseFlowMap → import() → chunks/FlowDetails', 'chunks/useCryptoPro → import() → chunks/plugin']

const withoutHash = (edge: string) => edge.replace(/-[\w-]{8}\.js/g, '')

describe.skipIf(!existsSync(join(DIST, 'components/BaseRoadmap/index.js')))('dist: петли между чанками', () => {
	it('чанк по import() не импортирует статически чанк того, кто его вызывает', () => {
		const loops = findChunkLoops(DIST).map(withoutHash)
		expect(loops.filter(edge => !KNOWN_LOOPS.includes(edge))).toEqual([])
		expect(
			KNOWN_LOOPS.filter(edge => !loops.includes(edge)),
			'петля устранена — уберите её из KNOWN_LOOPS',
		).toEqual([])
	})

	it('поиск находит петлю: цель вызывается по import() и статически тянет вызывающего', () => {
		const dir = mkdtempSync(join(tmpdir(), 'chunk-loops-'))
		try {
			writeFileSync(join(dir, 'component.js'), 'import{a}from"./shared.js";export const b=()=>import("./lazy.js");')
			writeFileSync(join(dir, 'lazy.js'), 'import{x}from"./shared.js";export{y}from"./component.js";')
			writeFileSync(join(dir, 'shared.js'), 'export const a=1;')
			expect(findChunkLoops(dir)).toEqual(['component.js → import() → lazy.js'])
			writeFileSync(join(dir, 'lazy.js'), 'import{x}from"./shared.js";export const y=2;')
			expect(findChunkLoops(dir)).toEqual([])
		} finally {
			rmSync(dir, { recursive: true, force: true })
		}
	})
})

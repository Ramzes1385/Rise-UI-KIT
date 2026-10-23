import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { servicesIcon } from '../servicesIcon'
import { MODEL3D_PRESETS } from '@/scene3d/models/presets'

describe('servicesIcon', () => {
	it('значок по словам названия', () => {
		expect(servicesIcon({ label: 'Redis' })).toBe(MODEL3D_PRESETS.ram.icon)
		expect(servicesIcon({ label: 'Платёжный сервис' })).toBe(MODEL3D_PRESETS.terminal.icon)
	})

	it('слова меток набора service', () => {
		expect(servicesIcon({ label: 'Хранилище', tags: ['kafka'] })).toBe(MODEL3D_PRESETS.conveyor.icon)
	})

	it('слова других наборов не считаются', () => {
		expect(servicesIcon({ label: 'HTML', kind: 'store' })).toBe(MODEL3D_PRESETS.db.icon)
	})

	it('вид с именем из прототипа объекта не падает: значок server', () => {
		expect(servicesIcon({ kind: 'constructor' })).toBe(MODEL3D_PRESETS.server.icon)
		expect(servicesIcon({ kind: 'toString' })).toBe(MODEL3D_PRESETS.server.icon)
	})

	it('нет слов — значок вида', () => {
		expect(servicesIcon({ label: 'Что-то', kind: 'queue' })).toBe(MODEL3D_PRESETS.conveyor.icon)
		expect(servicesIcon({ kind: 'client' })).toBe(MODEL3D_PRESETS.laptop.icon)
	})

	it('внешний узел — cloud, неизвестный или не заданный вид — server', () => {
		expect(servicesIcon({ label: 'Что-то', isExternal: true, kind: 'store' })).toBe(MODEL3D_PRESETS.cloud.icon)
		expect(servicesIcon({ label: 'Что-то', kind: 'weird' })).toBe(MODEL3D_PRESETS.server.icon)
		expect(servicesIcon({})).toBe(MODEL3D_PRESETS.server.icon)
	})

	it('слова побеждают вид и внешность', () => {
		expect(servicesIcon({ label: 'Grafana', kind: 'client', isExternal: true })).toBe(MODEL3D_PRESETS.monitor.icon)
	})

	it('файл импортирует только presets и keywords (без three)', () => {
		const source = readFileSync(resolve(process.cwd(), 'src/components/BaseFlowMap/model/notations/services/servicesIcon.ts'), 'utf8')
		const imports = [...source.matchAll(/from '([^']+)'/g)].map(match => match[1])
		expect(imports.sort()).toEqual(['@/scene3d/models/keywords', '@/scene3d/models/presets'])
	})

	it('presets.ts и keywords.ts не тянут three', () => {
		;['presets', 'keywords'].forEach(file => {
			const source = readFileSync(resolve(process.cwd(), `src/scene3d/models/${file}.ts`), 'utf8')
			const imports = [...source.matchAll(/from '([^']+)'/g)].map(match => match[1])
			expect(imports.some(path => path === 'three' || path.startsWith('three/'))).toBe(false)
		})
	})
})

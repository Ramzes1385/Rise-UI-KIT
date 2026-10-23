import { node } from '../modelsTestKit'
import { describe, expect, it, vi } from 'vitest'
import type { Model3DDefinitions } from '../../../types/model3d.types'
import type { Model3DSelection } from '../../../types/internal/model3dInternal.types'
import type { Model3DResolveOptions } from '../../../types/internal/model3dRuntime.types'
import { collectWordGroups, findDefinition, resolveModel } from '../../../models/runtime/modelResolve'

function setup(extra: { component?: Model3DDefinitions; app?: Model3DDefinitions } & Partial<Model3DResolveOptions> = {}) {
	const warn = vi.fn()
	const { component = {}, app = {}, ...rest } = extra
	const options: Model3DResolveOptions = { lookup: { component, app }, fallback: 'server', sets: ['service'], warn, ...rest }
	const resolve = (selection: Partial<Model3DSelection> & { title?: string; tags?: string[] } = {}) => {
		const { title = 'Сущность', tags, ...rest2 } = selection
		return resolveModel({ node: node('n', title, { tags }), ...rest2 }, options)
	}
	return { warn, resolve, options }
}

describe('findDefinition и collectWordGroups', () => {
	it('ключ: модели компонента, затем приложения, затем встроенная', () => {
		const component = { x: { preset: 'db' } }
		const app = { x: { preset: 'bank' }, y: { preset: 'cart' } }
		expect(findDefinition('x', { component, app })).toBe(component.x)
		expect(findDefinition('y', { component, app })).toBe(app.y)
		expect(findDefinition('cloud', { component, app })).toEqual({ preset: 'cloud' })
		expect(findDefinition('nope', { component, app })).toBeNull()
		expect(findDefinition('constructor', { component, app })).toBeNull()
	})

	it('группы слов: свои (rank 0), приложения (1), встроенные (2); без words — пусто', () => {
		const groups = collectWordGroups({ component: { a: { preset: 'db', words: ['alpha'] } }, app: { b: { preset: 'db' } } }, [
			'learning',
		])
		expect(groups.slice(0, 2)).toEqual([
			{ id: 'a', words: ['alpha'], rank: 0 },
			{ id: 'b', words: [], rank: 1 },
		])
		expect(groups[2]).toMatchObject({ id: 'window', rank: 2 })
	})
})

describe('порядок выбора модели (6.2)', () => {
	it('1. model3d.url — GLB, остальное не смотрится', () => {
		const { resolve, warn } = setup()
		expect(resolve({ model3d: { url: 'a.glb', model: 'db' }, kindModel: 'bank' })).toEqual({
			key: 'a.glb',
			definition: { url: 'a.glb' },
			source: 'url',
		})
		expect(warn).not.toHaveBeenCalled()
	})

	it('2. model3d.model: ключ компонента → приложения → встроенная', () => {
		const component = { k: { preset: 'db' } }
		const app = { k: { preset: 'bank' }, only: { preset: 'cart' } }
		const { resolve } = setup({ component, app })
		expect(resolve({ model3d: { model: 'k' } })).toMatchObject({ definition: { preset: 'db' }, source: 'node' })
		expect(resolve({ model3d: { model: 'only' } }).definition).toEqual({ preset: 'cart' })
		expect(resolve({ model3d: { model: 'bell' } })).toMatchObject({ key: 'bell', definition: { preset: 'bell' }, source: 'node' })
	})

	it('2. неизвестный ключ — warn и выбор идёт дальше', () => {
		const { resolve, warn } = setup()
		const result = resolve({ model3d: { model: 'ghost' }, kindModel: 'cloud' })
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('ghost')
		expect(result).toMatchObject({ key: 'cloud', source: 'kind' })
	})

	it('имена из прототипа: kindFallback — server; model3d.model — warn и server', () => {
		const { resolve, warn } = setup()
		;['constructor', 'toString', '__proto__'].forEach(name => {
			expect(resolve({ kindModel: 'auto', kindFallback: name })).toMatchObject({ key: 'server', source: 'fallback' })
			expect(resolve({ model3d: { model: name }, kindModel: 'auto' })).toMatchObject({ key: 'server', source: 'fallback' })
		})
		expect(warn).toHaveBeenCalledTimes(3)
	})

	it('пустой ключ в model3d пропускается без warn', () => {
		const { resolve, warn } = setup()
		expect(resolve({ model3d: { model: '' }, kindModel: 'db' }).source).toBe('kind')
		expect(warn).not.toHaveBeenCalled()
	})

	it('3. modelResolver: ключ; null и undefined — дальше; неизвестный — warn и дальше', () => {
		const answers: Array<string | null | undefined> = ['bank', null, undefined, 'ghost']
		const modelResolver = vi.fn((_node: unknown) => answers.shift())
		const { resolve, warn } = setup({ modelResolver })
		expect(resolve()).toMatchObject({ key: 'bank', source: 'resolver' })
		expect(resolve({ kindModel: 'db' }).source).toBe('kind')
		expect(resolve({ kindModel: 'db' }).source).toBe('kind')
		expect(warn).not.toHaveBeenCalled()
		expect(resolve({ kindModel: 'db' }).source).toBe('kind')
		expect(warn).toHaveBeenCalledTimes(1)
		expect(modelResolver.mock.calls[0][0]).toMatchObject({ id: 'n' })
	})

	it('model3d.model сильнее modelResolver', () => {
		const { resolve } = setup({ modelResolver: () => 'bank' })
		expect(resolve({ model3d: { model: 'db' } }).key).toBe('db')
	})

	it('4. kindModel: id сильнее слов; неизвестный — warn и слова', () => {
		const { resolve, warn } = setup()
		expect(resolve({ title: 'Redis', kindModel: 'bank' })).toMatchObject({ key: 'bank', source: 'kind' })
		expect(resolve({ title: 'Redis', kindModel: 'ghost' })).toMatchObject({ key: 'ram', source: 'words' })
		expect(warn).toHaveBeenCalledTimes(1)
	})

	it('4. kindModel не задан — shape', () => {
		const { resolve } = setup()
		expect(resolve({ title: 'Redis' })).toEqual({ key: 'shape', definition: { preset: 'shape' }, source: 'shape' })
	})

	it('4. kindModel auto: слова названия, затем метки', () => {
		const { resolve } = setup()
		expect(resolve({ title: 'Redis', kindModel: 'auto' })).toMatchObject({ key: 'ram', source: 'words' })
		expect(resolve({ title: 'Хранилище', tags: ['kafka'], kindModel: 'auto' })).toMatchObject({ key: 'conveyor' })
	})

	it('слова: свои модели компонента раньше приложения раньше встроенных', () => {
		const component = { mine: { preset: 'cart', words: ['redis'] } }
		const app = { theirs: { preset: 'cart', words: ['redis'] } }
		expect(setup({ component, app }).resolve({ title: 'Redis', kindModel: 'auto' }).key).toBe('mine')
		expect(setup({ app }).resolve({ title: 'Redis', kindModel: 'auto' }).key).toBe('theirs')
		expect(setup().resolve({ title: 'Redis', kindModel: 'auto' }).key).toBe('ram')
	})

	it('слова: набор wordSets', () => {
		const { resolve } = setup({ sets: ['learning'] })
		expect(resolve({ title: 'Deploy', kindModel: 'auto' })).toMatchObject({ key: 'rocket', source: 'words' })
		expect(resolve({ title: 'Redis', kindModel: 'auto' }).source).toBe('fallback')
	})

	it('5. запасная: isExternal → cloud, иначе kindFallback', () => {
		const { resolve } = setup()
		expect(resolve({ kindModel: 'auto', isExternal: true, kindFallback: 'db' })).toMatchObject({ key: 'cloud', source: 'fallback' })
		expect(resolve({ kindModel: 'auto', kindFallback: 'db' })).toMatchObject({ key: 'db', source: 'fallback' })
	})

	it('5. запасная: нет вида или неизвестный вид — запасная модель опций', () => {
		const { resolve } = setup({ fallback: 'book' })
		expect(resolve({ kindModel: 'auto' }).key).toBe('book')
		expect(resolve({ kindModel: 'auto', kindFallback: 'ghost' }).key).toBe('book')
	})

	it('5. запасная: по умолчанию server; неизвестная запасная — тоже server', () => {
		expect(setup().resolve({ kindModel: 'auto' }).key).toBe('server')
		expect(setup({ fallback: 'ghost' }).resolve({ kindModel: 'auto' })).toMatchObject({
			key: 'server',
			definition: { preset: 'server' },
		})
	})

	it('вид-запасная может быть своей моделью', () => {
		const { resolve } = setup({ component: { custom: { preset: 'bank' } } })
		expect(resolve({ kindModel: 'auto', kindFallback: 'custom' }).definition).toEqual({ preset: 'bank' })
	})
})

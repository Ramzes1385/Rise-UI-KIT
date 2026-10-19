import { vi } from 'vitest'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { mountEdit, editData } from '../fixtures/editFixtures'

function hookFns() {
	return { named: function checkAccess() {}, other: function audit() {} }
}

describe('доска хуков: подписки из пропсов', () => {
	it('функции из пропсов становятся подписками с именами и счётчиком вызовов', async () => {
		const { named, other } = hookFns()
		const { hooks, edit } = mountEdit({ data: editData(), beforeChange: named, beforeDelete: other })
		expect(hooks.list().map(item => [item.name, item.handler, item.calls, item.isEnabled])).toEqual([
			['beforeChange', 'checkAccess', 0, true],
			['beforeDelete', 'audit', 0, true],
		])
		await edit.update('a', { title: 'Z' })
		expect(hooks.list('beforeChange')[0].calls).toBe(1)
	})

	it('подписка из пропса вызывает актуальную функцию, замена пропса переподписывает, удаление снимает', async () => {
		const first = vi.fn()
		const second = vi.fn()
		const { wrapper, hooks, edit } = mountEdit({ data: editData(), beforeChange: first })
		await wrapper.setProps({ beforeChange: second })
		expect(hooks.list()).toHaveLength(1)
		await edit.update('a', { title: 'B' })
		expect(first).not.toHaveBeenCalled()
		expect(second).toHaveBeenCalledOnce()
		await wrapper.setProps({ beforeChange: undefined })
		expect(hooks.list()).toHaveLength(0)
	})

	it('тот же пропс при повторной проверке подписку не пересоздаёт', async () => {
		const fn = vi.fn()
		const { wrapper, hooks } = mountEdit({ data: editData(), beforeChange: fn })
		const before = hooks.list()[0].id
		await wrapper.setProps({ beforeDelete: undefined })
		expect(hooks.list()[0].id).toBe(before)
	})

	it('снятие компонента отписывает пропсовые хуки', () => {
		const { wrapper, hooks } = mountEdit({ data: editData(), beforeChange: vi.fn() })
		wrapper.unmount()
		expect(hooks.list()).toHaveLength(0)
	})
})

describe('доска хуков: итоги вызовов', () => {
	it('revision растёт при подписке, выключении и отписке', () => {
		const { hooks } = mountEdit()
		const start = hooks.revision.value
		const off = hooks.on('beforeChange', () => undefined)
		expect(hooks.revision.value).toBeGreaterThan(start)
		const id = hooks.list()[0].id
		const afterOn = hooks.revision.value
		hooks.setEnabled(id, false)
		expect(hooks.revision.value).toBe(afterOn + 1)
		expect(hooks.list()[0].isEnabled).toBe(false)
		off()
		expect(hooks.list()).toHaveLength(0)
		expect(hooks.revision.value).toBe(afterOn + 2)
	})

	it('разрешение записывается как итог без отказа, resultOf неизвестного id пуст', async () => {
		const { hooks } = mountEdit()
		hooks.on('beforeChange', () => undefined)
		const [item] = hooks.list()
		expect(hooks.resultOf(item.id)).toBeUndefined()
		await hooks.run('beforeChange', { changes: [], command: 'x', data: editData() }, [])
		expect(hooks.resultOf(item.id)).toEqual({ isCancelled: false })
		expect(hooks.resultOf('нет')).toBeUndefined()
	})

	it('отказ beforeChange — причина с именем команды, beforeDelete — удаление', async () => {
		const { hooks } = mountEdit()
		hooks.on('beforeChange', () => false)
		hooks.on('beforeDelete', () => false)
		await hooks.run('beforeChange', { changes: [], command: 'update', data: editData() }, [])
		await hooks.run('beforeDelete', { stages: [], topics: [] }, undefined as never)
		const [change, remove] = hooks.list()
		expect(hooks.resultOf(change.id)).toEqual({ isCancelled: true, reason: 'правка «update» отменена' })
		expect(hooks.resultOf(remove.id)).toEqual({ isCancelled: true, reason: UI_ROADMAP_EDIT.HOOK_REASON_DELETE })
	})

	it('отказ beforeStatusChange называет тему; без контекста и без названия — пусто', async () => {
		const { hooks } = mountEdit()
		hooks.on('beforeStatusChange', () => false)
		const [item] = hooks.list()
		await hooks.run(
			'beforeStatusChange',
			{ topic: { id: 'a', title: 'Ява' }, from: 'available', to: 'done', source: 'user' },
			undefined as never,
		)
		expect(hooks.resultOf(item.id)?.reason).toBe('смена статуса темы «Ява» отменена')
		await hooks.run('beforeStatusChange', {} as never, undefined as never)
		expect(hooks.resultOf(item.id)?.reason).toBe('смена статуса темы «» отменена')
		await hooks.run('beforeStatusChange', undefined as never, undefined as never)
		expect(hooks.resultOf(item.id)?.reason).toBe('смена статуса темы «» отменена')
	})

	it('beforeChange без команды в контексте даёт пустое имя', async () => {
		const { hooks } = mountEdit()
		hooks.on('beforeChange', () => false)
		await hooks.run('beforeChange', {} as never, [])
		expect(hooks.resultOf(hooks.list()[0].id)?.reason).toBe('правка «» отменена')
	})

	it('асинхронный обработчик записывает итог после ответа', async () => {
		const { hooks } = mountEdit()
		hooks.on('beforeDelete', async () => false)
		const [item] = hooks.list()
		const run = hooks.run('beforeDelete', { stages: [], topics: [] }, undefined as never)
		expect(hooks.resultOf(item.id)).toBeUndefined()
		await run
		expect(hooks.resultOf(item.id)?.isCancelled).toBe(true)
	})

	it('исключение обработчика записывается как отказ по ошибке и пробрасывается', async () => {
		const { hooks } = mountEdit()
		hooks.on('beforeChange', () => {
			throw new Error('сбой')
		})
		await expect(hooks.run('beforeChange', { changes: [], command: 'x', data: editData() }, [])).rejects.toThrow('сбой')
		expect(hooks.resultOf(hooks.list()[0].id)).toEqual({ isCancelled: true, reason: UI_ROADMAP_EDIT.HOOK_REASON_ERROR })
	})

	it('отписка стирает итог; анонимная функция даёт пустое имя', async () => {
		const { hooks } = mountEdit()
		const off = hooks.on('beforeChange', () => false)
		const [item] = hooks.list()
		expect(item.handler).toBe('')
		await hooks.run('beforeChange', { changes: [], command: 'x', data: editData() }, [])
		off()
		expect(hooks.resultOf(item.id)).toBeUndefined()
	})

	it('выключенный обработчик не вызывается', async () => {
		const spy = vi.fn()
		const { hooks, edit } = mountEdit({ data: editData(), beforeChange: spy })
		hooks.setEnabled(hooks.list()[0].id, false)
		await edit.update('a', { title: 'Q' })
		expect(spy).not.toHaveBeenCalled()
	})
})

describe('доска хуков: повторная сверка', () => {
	it('смена одного пропса не пересоздаёт подписку соседнего', async () => {
		const keep = vi.fn()
		const { wrapper, hooks } = mountEdit({ data: editData(), beforeChange: keep })
		const before = hooks.list('beforeChange')[0].id
		await wrapper.setProps({ beforeDelete: vi.fn() })
		expect(hooks.list('beforeChange')[0].id).toBe(before)
		expect(hooks.list()).toHaveLength(2)
	})
})

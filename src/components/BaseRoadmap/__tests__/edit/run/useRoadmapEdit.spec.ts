import { vi } from 'vitest'
import { UI_ROADMAP, UI_ROADMAP_EDIT } from '@/locales/messages'
import type { RoadmapChange } from '../../../types/roadmapEdit.types'
import { deferred, editData, mountEdit, topic } from '../fixtures/editFixtures'

afterEach(() => {
	vi.useRealTimers()
	vi.restoreAllMocks()
})

const ids = (data: ReturnType<typeof editData>, stageId: string) =>
	data.stages.find(item => item.id === stageId)?.topics.map(item => item.id)

describe('createRoadmapEdit: команды и история', () => {
	it('правка меняет данные, пишет шаг истории, объявляет подпись и сообщает наружу', async () => {
		const { edit, data, emitted } = mountEdit()
		expect(await edit.addTopic('s3', topic('x', { title: 'Новая' }))).toBe(true)
		expect(ids(data.value, 's3')).toEqual(['x'])
		expect(edit.history.list().map(item => item.label)).toEqual(['Добавлена тема «Новая»'])
		expect(edit.liveText.value).toBe('Добавлена тема «Новая»')
		expect(emitted('update:data')).toHaveLength(1)
		expect(edit.rejection.value).toBeNull()
	})

	it('отказ: плашка с кодом и объявление, данные и история не тронуты', async () => {
		const { edit, data } = mountEdit()
		const before = data.value
		expect(await edit.addStage({ id: 'a', title: 'Дубль', topics: [] })).toBe(false)
		expect(edit.rejection.value?.code).toBe('duplicate')
		expect(edit.liveText.value).toBe(edit.rejection.value?.text)
		expect(data.value).toBe(before)
		expect(edit.history.list()).toEqual([])
		edit.dismissRejection()
		expect(edit.rejection.value).toBeNull()
	})

	it('пустой набор изменений — false без отказа и без шага', async () => {
		const { edit } = mountEdit()
		expect(await edit.update('a', { title: 'Тема a' })).toBe(false)
		expect(edit.rejection.value).toBeNull()
		expect(edit.history.list()).toEqual([])
	})

	it('отключённый роадмап отказывает кодом disabled', async () => {
		const { edit, data } = mountEdit({ data: editData(), isDisabled: true })
		const before = data.value
		expect(await edit.remove(['a'])).toBe(false)
		expect(edit.rejection.value).toEqual({ code: 'disabled', text: UI_ROADMAP_EDIT.REJECT_DISABLED })
		expect(data.value).toBe(before)
	})

	it('повторное объявление того же текста отличается хвостовым пробелом', async () => {
		const { edit } = mountEdit()
		edit.announce('Готово')
		const first = edit.liveText.value
		edit.announce('Готово')
		expect(first).toBe('Готово')
		expect(edit.liveText.value).toBe('Готово ')
		edit.announce('Готово')
		expect(edit.liveText.value).toBe('Готово')
	})

	it('перестановка шлёт reorder для этапа и для темы', async () => {
		const { edit, emitted } = mountEdit()
		await edit.move('s1', { index: 2 })
		await edit.move('a', { stage: 's2', index: 0 })
		expect(emitted('reorder')).toEqual([
			[{ entity: 'stage', id: 's1', from: { stage: null, index: 0 }, to: { stage: null, index: 2 } }],
			[{ entity: 'topic', id: 'a', from: { stage: 's1', index: 0 }, to: { stage: 's2', index: 0 } }],
		])
		expect(edit.history.list()[0].label).toContain('Этап «Этап s1» перемещён')
	})

	it('удаление: подпись для одного и для нескольких, очистка требований тем же шагом', async () => {
		const { edit, data } = mountEdit()
		await edit.remove(['a'])
		expect(data.value.stages[0].topics[0].requires).toBeUndefined()
		expect(edit.history.list()[0].label).toBe('Удалено «Тема a»')
		await edit.remove(['c', 'd'])
		expect(edit.history.list()[1].label).toBe('Удалено элементов: 2')
		expect(edit.history.list()).toHaveLength(2)
	})

	it('связи: добавить и убрать, подписи называют темы', async () => {
		const { edit, data } = mountEdit()
		expect(await edit.addRequirement('c', 'a')).toBe(true)
		expect(data.value.stages[0].topics[2].requires).toEqual(['a'])
		expect(await edit.removeRequirement('c', 'a')).toBe(true)
		expect(edit.history.list().map(item => item.label)).toEqual(['Связь «Тема a» → «Тема c»', 'Связь «Тема a» → «Тема c» убрана'])
		expect(await edit.addRequirement('a', 'b')).toBe(false)
		expect(edit.rejection.value?.code).toBe('cycle')
	})

	it('шаблон: встроенный применяется, неизвестный — invalid; свой шаблон приходит из пропсов', async () => {
		const own = { id: 'mine', title: 'Мой', topic: { title: 'Из шаблона' } }
		const { edit, data } = mountEdit({ data: editData(), templates: [own] })
		expect(edit.templates.value.at(-1)).toEqual(own)
		expect(await edit.insertTemplate('mine', { stage: 's2' })).toBe(true)
		expect(data.value.stages[1].topics.at(-1)?.title).toBe('Из шаблона')
		expect(edit.history.list()[0].label).toBe('Шаблон «Мой»')
		expect(await edit.insertTemplate('нет')).toBe(false)
		expect(edit.rejection.value?.code).toBe('invalid')
	})

	it('importJson: корректный путь заменяет данные одним шагом, ошибка — отказ', async () => {
		const { edit, data } = mountEdit()
		const next = { version: 1, title: 'Новый путь', stages: [{ id: 'n', title: 'N', topics: [] }] }
		expect(await edit.importJson(JSON.stringify(next))).toBe(true)
		expect(data.value).toEqual(next)
		expect(edit.history.list()).toHaveLength(1)
		edit.undo()
		expect(data.value.stages).toHaveLength(3)
		expect(await edit.importJson('{плохо')).toBe(false)
		expect(edit.rejection.value?.text).toBe(UI_ROADMAP_EDIT.REJECT_IMPORT)
	})

	it('viewData показывает черновик перестановки вместо данных', () => {
		const { edit, data } = mountEdit()
		expect(edit.viewData.value).toBe(data.value)
		const draft = { ...data.value, title: 'Черновик' }
		edit.draft.value = draft
		expect(edit.viewData.value).toBe(draft)
	})

	it('find ищет по текущим данным', () => {
		const { edit } = mountEdit()
		expect(edit.find('e')?.topic?.id).toBe('e')
		expect(edit.find('ghost')).toBeNull()
	})
})

describe('createRoadmapEdit: отмена и повтор', () => {
	it('undo и redo возвращают данные, объявляют подпись и сообщают наружу', async () => {
		const { edit, data, emitted } = mountEdit()
		const initial = data.value
		await edit.update('a', { title: 'Другая' })
		expect(edit.undo()).toBe(true)
		expect(data.value).toEqual(initial)
		expect(edit.liveText.value).toBe('Отменено: Изменено «Тема a»')
		expect(edit.redo()).toBe(true)
		expect(data.value.stages[0].topics[0].title).toBe('Другая')
		expect(edit.liveText.value).toBe('Повторено: Изменено «Тема a»')
		expect(emitted('update:data')).toHaveLength(3)
	})

	it('когда отменять нечего — false и тишина', () => {
		const { edit } = mountEdit()
		expect(edit.undo()).toBe(false)
		expect(edit.redo()).toBe(false)
		expect(edit.liveText.value).toBe('')
	})

	it('подряд идущие шаги с одним mergeKey склеиваются в один', async () => {
		vi.useFakeTimers({ toFake: ['Date', 'performance'] })
		const { edit, data } = mountEdit()
		const set = (title: string) =>
			edit.run({
				name: 'update',
				label: 'Название',
				mergeKey: 'title:a',
				build: now =>
					title === now.stages[0].topics[0].title
						? []
						: [
								{
									type: 'update',
									entity: 'topic',
									id: 'a',
									patch: { title },
									previous: { title: now.stages[0].topics[0].title },
								},
							],
			})
		await set('Н')
		await set('На')
		await set('Нас')
		expect(edit.history.list()).toHaveLength(1)
		edit.undo()
		expect(data.value.stages[0].topics[0].title).toBe('Тема a')
	})

	it('transact объединяет несколько правок в один шаг; сбой внутри — false', async () => {
		const { edit, data } = mountEdit()
		expect(
			await edit.transact('Пакет', async () => {
				await edit.update('a', { title: 'A1' })
				await edit.update('b', { title: 'B1' })
			}),
		).toBe(true)
		expect(edit.history.list()).toHaveLength(1)
		expect(edit.history.list()[0].label).toBe('Пакет')
		edit.undo()
		expect(data.value.stages[0].topics.map(item => item.title)).toEqual(['Тема a', 'Тема b', 'Тема c'])
		expect(
			await edit.transact('Сбой', () => {
				throw new Error('нет')
			}),
		).toBe(false)
	})
})

describe('createRoadmapEdit: хуки', () => {
	it('beforeChange получает изменения, имя команды и данные; false отменяет с кодом hook', async () => {
		const spy = vi.fn(() => false)
		const { edit, data } = mountEdit({ data: editData(), beforeChange: spy })
		const before = data.value
		expect(await edit.update('a', { title: 'Z' })).toBe(false)
		expect(spy).toHaveBeenCalledWith(
			expect.objectContaining({ command: 'update', data: before, changes: [expect.objectContaining({ type: 'update' })] }),
		)
		expect(edit.rejection.value).toEqual({ code: 'hook', text: UI_ROADMAP_EDIT.REJECT_HOOK })
		expect(data.value).toBe(before)
		expect(edit.history.list()).toEqual([])
	})

	it('beforeChange может заменить изменения массивом', async () => {
		const replacement: RoadmapChange[] = [
			{ type: 'update', entity: 'topic', id: 'a', patch: { title: 'Подмена' }, previous: { title: 'Тема a' } },
		]
		const { edit, data } = mountEdit({ data: editData(), beforeChange: () => replacement })
		await edit.update('a', { title: 'Z' })
		expect(data.value.stages[0].topics[0].title).toBe('Подмена')
	})

	it('beforeDelete вызывается только при удалении и получает удаляемое; отказ отменяет правку', async () => {
		const spy = vi.fn(() => false)
		const { edit, data } = mountEdit({ data: editData(), beforeDelete: spy })
		expect(await edit.update('a', { title: 'Z' })).toBe(true)
		expect(spy).not.toHaveBeenCalled()
		expect(await edit.remove(['s1'])).toBe(false)
		expect(spy).toHaveBeenCalledWith({ stages: [expect.objectContaining({ id: 's1' })], topics: [] })
		expect(ids(data.value, 's1')).toEqual(['a', 'b', 'c'])
		expect(await edit.remove(['d'])).toBe(false)
		expect(spy).toHaveBeenLastCalledWith({ stages: [], topics: [expect.objectContaining({ id: 'd' })] })
	})

	it('исключение обработчика — отказ hook и предупреждение в консоли', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { edit, data } = mountEdit({
			data: editData(),
			beforeChange: () => {
				throw new Error('сломан')
			},
		})
		const before = data.value
		expect(await edit.update('a', { title: 'Z' })).toBe(false)
		expect(edit.rejection.value?.code).toBe('hook')
		expect(warn).toHaveBeenCalledOnce()
		expect(String(warn.mock.calls[0][0])).toContain('сломан')
		expect(data.value).toBe(before)
	})

	it('в production-сборке предупреждение молчит', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		vi.stubEnv('NODE_ENV', 'production')
		const { edit } = mountEdit({
			data: editData(),
			beforeChange: () => {
				throw new Error('сломан')
			},
		})
		await edit.update('a', { title: 'Z' })
		vi.unstubAllEnvs()
		expect(warn).not.toHaveBeenCalled()
		expect(edit.rejection.value?.code).toBe('hook')
		expect(UI_ROADMAP.HOOK_FAILED).toBeTruthy()
	})

	it('данные изменились, пока хук ждал, — отказ stale', async () => {
		const gate = deferred<undefined>()
		const started = vi.fn()
		const { edit, data } = mountEdit({
			data: editData(),
			beforeChange: () => {
				started()
				return gate.promise
			},
		})
		const pending = edit.update('a', { title: 'Z' })
		await vi.waitFor(() => expect(started).toHaveBeenCalled())
		data.value = { ...data.value, title: 'Кто-то поменял' }
		gate.resolve(undefined)
		expect(await pending).toBe(false)
		expect(edit.rejection.value?.code).toBe('stale')
		expect(data.value.title).toBe('Кто-то поменял')
		expect(data.value.stages[0].topics[0].title).toBe('Тема a')
	})

	it('команды идут строго по очереди, даже если первая ждёт хук', async () => {
		const gate = deferred<undefined>()
		const order: string[] = []
		let calls = 0
		const { edit, data } = mountEdit({
			data: editData(),
			beforeChange: () => {
				calls += 1
				order.push(`hook${calls}`)
				return calls === 1 ? gate.promise : undefined
			},
		})
		const first = edit.update('a', { title: 'Первая' }).then(() => order.push('first'))
		const second = edit.update('b', { title: 'Вторая' }).then(() => order.push('second'))
		await Promise.resolve()
		expect(order).toEqual(['hook1'])
		gate.resolve(undefined)
		await Promise.all([first, second])
		expect(order).toEqual(['hook1', 'first', 'hook2', 'second'])
		expect(data.value.stages[0].topics.map(item => item.title).slice(0, 2)).toEqual(['Первая', 'Вторая'])
	})

	it('applyChanges: имя команды review, подпись шага — переданная, шаг один', async () => {
		const spy = vi.fn()
		const { edit, data } = mountEdit({ data: editData(), beforeChange: spy })
		const changes: RoadmapChange[] = [
			{ type: 'update', entity: 'topic', id: 'a', patch: { title: 'X' }, previous: { title: 'Тема a' } },
			{ type: 'update', entity: 'topic', id: 'b', patch: { title: 'Y' }, previous: { title: 'Тема b' } },
		]
		expect(await edit.applyChanges(changes, 'Принято предложение')).toBe(true)
		expect(spy).toHaveBeenCalledWith(expect.objectContaining({ command: 'review' }))
		expect(edit.history.list()).toEqual([expect.objectContaining({ label: 'Принято предложение' })])
		edit.undo()
		expect(data.value.stages[0].topics.map(item => item.title).slice(0, 2)).toEqual(['Тема a', 'Тема b'])
	})
})

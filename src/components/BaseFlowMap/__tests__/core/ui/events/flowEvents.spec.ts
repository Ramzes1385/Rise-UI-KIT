import { createFlowEvents } from '../../../../model/controller/flowEvents'

describe('createFlowEvents', () => {
	it('без emit и listeners события доходят только до подписчиков', () => {
		const events = createFlowEvents({} as never)
		const handler = vi.fn()
		events.subscribe('ready', handler)
		events.emit('ready', 1 as never)
		expect(handler).toHaveBeenCalledWith(1)
		expect(events.list()).toHaveLength(1)
	})

	it('подписчик, бросивший не Error, даёт предупреждение со строкой', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const events = createFlowEvents({} as never)
		events.subscribe('ready', () => {
			throw 'строка'
		})
		events.emit('ready', 1 as never)
		expect(String(warn.mock.calls[0][0])).toContain('строка')
	})

	it('слушатели, не являющиеся функциями, в привязки не попадают, имя анонимного — пустое', () => {
		const events = createFlowEvents({
			listeners: () => ({
				'node-click': 'не функция',
				ready: (
					() => () =>
						undefined
				)(),
			}),
		} as never)
		const list = events.list()
		expect(list.map(item => item.name)).toEqual(['ready'])
		expect(list[0].handler).toBe('')
	})

	it('выключение: подписки, собственного слушателя и неизвестного id', () => {
		const events = createFlowEvents({ listeners: () => ({ ready: () => undefined }), emit: vi.fn() } as never)
		const off = events.subscribe('ready', vi.fn())
		expect(events.setEnabled('event-sub-1', false)).toBe(true)
		expect(events.setEnabled('event:ready', false)).toBe(true)
		expect(events.setEnabled('нет', false)).toBe(false)
		off()
		off()
		events.note('ready', 'итог')
		expect(events.resultOf('ready')).toBe('итог')
		expect(events.list()[0]).toMatchObject({ isEnabled: false, lastResult: 'итог' })
	})
})

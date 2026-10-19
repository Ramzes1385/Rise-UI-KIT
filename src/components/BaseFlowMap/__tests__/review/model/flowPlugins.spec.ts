import { nextTick } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { createReviewHarness } from '../fixtures/reviewHarness'
import { setupFlowPlugins } from '../../../model/controller/flowPlugins'
import type { FlowMapController, FlowMapPlugin } from '../../../types/api/flowController.types'

const controller = {} as FlowMapController

describe('setupFlowPlugins', () => {
	let warn: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
	})

	afterEach(() => warn.mockRestore())

	const prefixed = (message: string) => `[rise-ui-kit] ${message}`

	it('setup получает контроллер, а отключение вызывает очистку', () => {
		const dispose = vi.fn()
		const setup = vi.fn(() => dispose)
		const off = setupFlowPlugins(controller, [{ name: 'p', setup }])
		expect(setup).toHaveBeenCalledWith(controller)
		off()
		expect(dispose).toHaveBeenCalledTimes(1)
		expect(warn).not.toHaveBeenCalled()
	})

	it('ошибка в setup не ломает остальные плагины и попадает в предупреждение', () => {
		const good = vi.fn(() => vi.fn())
		const off = setupFlowPlugins(controller, [
			{
				name: 'bad',
				setup: () => {
					throw new Error('сломался')
				},
			},
			{ name: 'good', setup: good },
		])
		expect(good).toHaveBeenCalledTimes(1)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn).toHaveBeenCalledWith(prefixed(formatMessage(UI_FLOW_REVIEW.WARN_PLUGIN_FAILED, { name: 'bad', message: 'сломался' })))
		expect(() => off()).not.toThrow()
	})

	it('не-Error в throw попадает в предупреждение строкой', () => {
		setupFlowPlugins(controller, [
			{
				name: 'odd',
				setup: () => {
					throw 'текст'
				},
			},
		])
		expect(warn).toHaveBeenCalledWith(prefixed(formatMessage(UI_FLOW_REVIEW.WARN_PLUGIN_FAILED, { name: 'odd', message: 'текст' })))
	})

	it('повтор имени — предупреждение, действует последний плагин', () => {
		const first = vi.fn(() => vi.fn())
		const second = vi.fn(() => vi.fn())
		const other = vi.fn()
		setupFlowPlugins(controller, [
			{ name: 'same', setup: first },
			{ name: 'other', setup: other },
			{ name: 'same', setup: second },
		])
		expect(first).not.toHaveBeenCalled()
		expect(second).toHaveBeenCalledTimes(1)
		expect(other).toHaveBeenCalledTimes(1)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn).toHaveBeenCalledWith(prefixed(formatMessage(UI_FLOW_REVIEW.WARN_PLUGIN_DUPLICATE, { name: 'same' })))
	})

	it('три плагина с одним именем — два предупреждения', () => {
		const plugins: FlowMapPlugin[] = [{ name: 'x' }, { name: 'x' }, { name: 'x' }]
		setupFlowPlugins(controller, plugins)
		expect(warn).toHaveBeenCalledTimes(2)
	})

	it('отключение срабатывает один раз и в обратном порядке', () => {
		const order: string[] = []
		const make = (name: string): FlowMapPlugin => ({ name, setup: () => () => void order.push(name) })
		const off = setupFlowPlugins(controller, [make('a'), make('b'), make('c')])
		off()
		off()
		expect(order).toEqual(['c', 'b', 'a'])
	})

	it('плагины без setup и без очистки не мешают', () => {
		const off = setupFlowPlugins(controller, [{ name: 'a' }, { name: 'b', setup: () => undefined }])
		expect(() => off()).not.toThrow()
		expect(warn).not.toHaveBeenCalled()
	})

	it('ошибка в очистке одного плагина не мешает остальным: предупреждение и продолжение', () => {
		const order: string[] = []
		const off = setupFlowPlugins(controller, [
			{ name: 'a', setup: () => () => void order.push('a') },
			{
				name: 'b',
				setup: () => () => {
					throw new Error('не отключился')
				},
			},
			{ name: 'c', setup: () => () => void order.push('c') },
		])
		off()
		expect(order).toEqual(['c', 'a'])
		expect(warn).toHaveBeenCalledWith(
			prefixed(formatMessage(UI_FLOW_REVIEW.WARN_PLUGIN_FAILED, { name: 'b', message: 'не отключился' })),
		)
	})
})

describe('плагины в модели', () => {
	it('смена списка отключает прежние, размонтирование отключает текущие в обратном порядке', async () => {
		const order: string[] = []
		const make = (name: string): FlowMapPlugin => ({ name, setup: () => () => void order.push(name) })
		const { props, stop } = createReviewHarness({ plugins: [make('a'), make('b')] })
		props.plugins = [make('c')]
		await nextTick()
		expect(order).toEqual(['b', 'a'])
		stop()
		expect(order).toEqual(['b', 'a', 'c'])
	})

	it('повтор имени в props.plugins предупреждает и действует последний', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const first = vi.fn()
		const last = vi.fn()
		createReviewHarness({
			plugins: [
				{ name: 'dup', setup: first },
				{ name: 'dup', setup: last },
			],
		})
		expect(first).not.toHaveBeenCalled()
		expect(last).toHaveBeenCalledTimes(1)
		expect(warn).toHaveBeenCalledTimes(1)
		warn.mockRestore()
	})
})

import '@testing-library/jest-dom/vitest'
import type { PresentationWrapper } from '../utils/presentation.test-utils'
import MediaSlider from '@components/BaseMediaPlayer/ui/controls/MediaSlider.vue'
import { button, mountPresentation, setVisibility, slidesOf } from '../utils/presentation.test-utils'

type SpeedMenu = { items: Array<{ label: string; isChecked: boolean; onSelect: () => void }> }

const speedMenu = (wrapper: PresentationWrapper): SpeedMenu =>
	((wrapper.vm.$ as unknown as { setupState: unknown }).setupState as { speedMenu: SpeedMenu }).speedMenu

const seekSlider = (wrapper: PresentationWrapper) => wrapper.findAllComponents(MediaSlider)[0]

describe('BasePresentationPlayer — режим strict', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => {
		setVisibility('visible')
		vi.useRealTimers()
	})

	it('меню скорости — только скорости не выше maxRate, Shift+> выше не поднимает', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 4 }), navigation: 'strict', maxRate: 1.25 })
		expect(speedMenu(wrapper).items.map(item => item.label)).toEqual(['0,75×', '1×', '1,25×'])
		const root = wrapper.get('[role="region"]')
		await root.trigger('keydown', { key: '>', code: 'Period', shiftKey: true })
		await root.trigger('keydown', { key: '>', code: 'Period', shiftKey: true })
		await root.trigger('keydown', { key: '>', code: 'Period', shiftKey: true })
		expect(speedMenu(wrapper).items.find(item => item.isChecked)?.label).toBe('1,25×')
		await root.trigger('keydown', { key: '<', code: 'Comma', shiftKey: true })
		expect(speedMenu(wrapper).items.find(item => item.isChecked)?.label).toBe('1×')
	})

	it('maxRate по умолчанию 1: меню из двух пунктов, смена режима снижает скорость', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 4 }) })
		speedMenu(wrapper)
			.items.find(item => item.label === '2×')
			?.onSelect()
		await wrapper.setProps({ navigation: 'strict' })
		expect(speedMenu(wrapper).items.map(item => item.label)).toEqual(['0,75×', '1×'])
		expect(speedMenu(wrapper).items.find(item => item.isChecked)?.label).toBe('1×')
		await wrapper.setProps({ maxRate: 2 })
		expect(speedMenu(wrapper).items.find(item => item.isChecked)?.label).toBe('1×')
		await wrapper.setProps({ maxRate: 0.1 })
		expect(speedMenu(wrapper).items).toEqual([])
		expect(wrapper.find('button[aria-label="Скорость воспроизведения"]').exists()).toBe(false)
	})

	it('перемотка внутри непройденного слайда — не дальше достигнутой позиции', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 10 }), navigation: 'strict' })
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(3000)
		await button(wrapper, 'Пауза').trigger('click')
		seekSlider(wrapper).vm.$emit('update:modelValue', 0.8)
		await vi.advanceTimersByTimeAsync(0)
		expect(seekSlider(wrapper).props('modelValue')).toBeCloseTo(0.3)
		seekSlider(wrapper).vm.$emit('update:modelValue', 0.1)
		await vi.advanceTimersByTimeAsync(0)
		expect(seekSlider(wrapper).props('modelValue')).toBeCloseTo(0.1)
	})

	it('пройденный слайд можно перематывать свободно', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 1 }), navigation: 'strict' })
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(1100)
		await button(wrapper, 'Предыдущий слайд').trigger('click')
		await button(wrapper, 'Пауза').trigger('click')
		seekSlider(wrapper).vm.$emit('update:modelValue', 0.9)
		await vi.advanceTimersByTimeAsync(0)
		expect(seekSlider(wrapper).props('modelValue')).toBeCloseTo(0.9)
	})

	it('скрытие вкладки ставит показ на паузу', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 4 }), navigation: 'strict' })
		await button(wrapper, 'Воспроизвести').trigger('click')
		setVisibility('hidden')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('pause')).toHaveLength(1)
		expect(wrapper.find('button[aria-label="Воспроизвести"]').exists()).toBe(true)
	})

	it('free: скорость не ограничена, скрытая вкладка паузу не ставит, но таймер слайда стоит', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 2 }) })
		expect(speedMenu(wrapper).items).toHaveLength(5)
		await button(wrapper, 'Воспроизвести').trigger('click')
		setVisibility('hidden')
		await vi.advanceTimersByTimeAsync(5000)
		expect(wrapper.emitted('pause')).toBeUndefined()
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		setVisibility('visible')
		await vi.advanceTimersByTimeAsync(2100)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
	})
})

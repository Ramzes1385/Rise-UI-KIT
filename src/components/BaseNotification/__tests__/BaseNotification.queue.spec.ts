import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createUiKitPlugin } from '@/plugin'
import BaseNotification from '../ui/BaseNotification.vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

function items(): HTMLElement[] {
	return Array.from(document.querySelectorAll<HTMLElement>('.base-notification-item'))
}

function titles(): string[] {
	return items().map(item => item.querySelector('.base-notification-item__title')?.textContent?.trim() ?? '')
}

function open(props: Record<string, unknown> = {}) {
	return mount(BaseNotification, { props: { isContained: true, ...props }, attachTo: document.body })
}

afterEach(() => {
	vi.useRealTimers()
	document.body.innerHTML = ''
})

describe('BaseNotification: notificationKey (NTF-4)', () => {
	it('повторный add() с тем же ключом обновляет уведомление на месте и возвращает тот же id', async () => {
		const wrapper = open()
		const first = wrapper.vm.add({ title: 'Загрузка 10%', notificationKey: 'upload', duration: 60000 })
		const second = wrapper.vm.add({ title: 'Загрузка 90%', notificationKey: 'upload', type: 'warning', duration: 60000 })
		await nextTick()

		expect(second).toBe(first)
		expect(titles()).toEqual(['Загрузка 90%'])
		expect(items()[0]).toHaveClass('base-notification-item--warning')
		wrapper.unmount()
	})

	it('разные ключи и уведомления без ключа не склеиваются', async () => {
		const wrapper = open()
		wrapper.vm.add({ title: 'A', notificationKey: 'a', duration: 60000 })
		wrapper.vm.add({ title: 'B', notificationKey: 'b', duration: 60000 })
		wrapper.vm.add({ title: 'C', duration: 60000 })
		wrapper.vm.add({ title: 'D', duration: 60000 })
		await nextTick()

		expect(titles()).toEqual(['D', 'C', 'B', 'A'])
		wrapper.unmount()
	})

	it('обновление перезапускает таймер автозакрытия', async () => {
		vi.useFakeTimers()
		const wrapper = open()
		wrapper.vm.add({ title: 'Сохраняем', notificationKey: 'save', duration: 3000 })
		await vi.advanceTimersByTimeAsync(2000)
		wrapper.vm.add({ title: 'Сохранено', notificationKey: 'save', duration: 3000 })
		await vi.advanceTimersByTimeAsync(2000)

		expect(titles()).toEqual(['Сохранено'])
		await vi.advanceTimersByTimeAsync(1000)
		expect(titles()).toEqual([])
		wrapper.unmount()
	})

	it('декларативное уведомление: смена title обновляет его, смена ключа показывает новое', async () => {
		const wrapper = open({ title: 'Один', notificationKey: 'k1', duration: 60000 })
		await nextTick()
		await wrapper.setProps({ title: 'Один (правка)' })
		expect(titles()).toEqual(['Один (правка)'])

		await wrapper.setProps({ notificationKey: 'k2', title: 'Два' })
		expect(titles()).toEqual(['Два', 'Один (правка)'])
		wrapper.unmount()
	})

	it('декларативное уведомление без ключа: смена description обновляет, после закрытия смена title показывает снова', async () => {
		const wrapper = open({ title: 'Привет', duration: 60000 })
		await nextTick()
		await wrapper.setProps({ description: 'Текст' })
		expect(items()).toHaveLength(1)
		expect(items()[0]).toHaveTextContent('Текст')

		items()[0].querySelector<HTMLElement>('.base-notification-item__close')?.click()
		await nextTick()
		expect(items()).toHaveLength(0)
		await wrapper.setProps({ title: 'Снова' })
		expect(titles()).toEqual(['Снова'])
		wrapper.unmount()
	})

	it('пустой title и управляемый items не создают декларативное уведомление', async () => {
		const wrapper = open({ title: 'Есть', items: [{ id: 1, title: 'Из items' }] })
		await nextTick()
		await wrapper.setProps({ title: '' })
		await wrapper.setProps({ title: 'Другое' })

		expect(titles()).toEqual(['Из items'])
		wrapper.unmount()
	})
})

describe('BaseNotification: поля add() (NTF-6)', () => {
	it('color и sizeScale оформляют только своё уведомление', async () => {
		const wrapper = open({ color: { bg: { base: '#111111' } } })
		wrapper.vm.add({ title: 'Свой', color: { bg: { base: '#ff0000' }, text: { base: '#ffffff' } }, sizeScale: 150, duration: 60000 })
		wrapper.vm.add({ title: 'Общий', duration: 60000 })
		await nextTick()

		const [shared, own] = items()
		expect(own.style.getPropertyValue('--custom-bg')).toBe('#ff0000')
		expect(own.style.getPropertyValue('--custom-text')).toBe('#ffffff')
		expect(own.style.getPropertyValue('--size-scale')).toBe('1.5')
		expect(shared.style.getPropertyValue('--custom-bg')).toBe('#111111')
		expect(shared.style.getPropertyValue('--size-scale')).toBe('')
		wrapper.unmount()
	})

	it('customClass: строка идёт на карточку, объект — по частям', async () => {
		const wrapper = open()
		wrapper.vm.add({ title: 'Строка', customClass: 'my-card', duration: 60000 })
		wrapper.vm.add({ title: 'Части', customClass: { notification: 'my-item', title: 'my-title', root: 'my-root' }, duration: 60000 })
		await nextTick()

		const [parts, text] = items()
		expect(text).toHaveClass('my-card')
		expect(parts).toHaveClass('my-item', 'my-root')
		expect(parts.querySelector('.base-notification-item__title')).toHaveClass('my-title')
		expect(text.querySelector('.base-notification-item__title')).not.toHaveClass('my-title')
		wrapper.unmount()
	})

	it('position из add() выносит уведомление в свою область, остальные остаются на позиции компонента', async () => {
		const wrapper = open({ position: 'top-left' })
		wrapper.vm.add({ title: 'Слева', duration: 60000 })
		wrapper.vm.add({ title: 'Внизу', position: 'bottom-center', duration: 60000 })
		await nextTick()

		const regions = Array.from(document.querySelectorAll('.base-notification'))
		expect(regions).toHaveLength(2)
		const left = document.querySelector('.base-notification--top-left')
		const bottom = document.querySelector('.base-notification--bottom-center')
		expect(left).toHaveTextContent('Слева')
		expect(left).not.toHaveTextContent('Внизу')
		expect(bottom).toHaveTextContent('Внизу')
		wrapper.unmount()
	})

	it('закрытие последнего уведомления области оставляет единственную пустую область на позиции компонента', async () => {
		const wrapper = open({ position: 'top-left' })
		const id = wrapper.vm.add({ title: 'Внизу', position: 'bottom-left', duration: 60000 })
		await nextTick()
		wrapper.vm.remove(id)
		await nextTick()

		const regions = document.querySelectorAll('.base-notification')
		expect(regions).toHaveLength(1)
		expect(regions[0]).toHaveClass('base-notification--top-left')
		wrapper.unmount()
	})

	it('фокус во второй области держит паузу; закрытие уведомления с фокусом снимает её', async () => {
		vi.useFakeTimers()
		const wrapper = open({ position: 'top-left' })
		wrapper.vm.add({ title: 'Слева', duration: 3000 })
		const id = wrapper.vm.add({ title: 'Внизу', position: 'bottom-left', duration: 3000 })
		await nextTick()
		const close = document.querySelector<HTMLElement>('.base-notification--bottom-left .base-notification-item__close')!
		close.focus()
		close.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
		await vi.advanceTimersByTimeAsync(5000)
		expect(items()).toHaveLength(2)

		wrapper.vm.remove(id)
		await vi.advanceTimersByTimeAsync(10)
		await vi.advanceTimersByTimeAsync(3100)
		expect(items()).toHaveLength(0)
		wrapper.unmount()
	})
})

describe('BaseNotification: очередь (NTF-8)', () => {
	it('maxVisible ограничивает видимые на одной позиции, остальные ждут и появляются по мере закрытия', async () => {
		const wrapper = open({ maxVisible: 2 })
		const a = wrapper.vm.add({ title: 'A', duration: 60000 })
		wrapper.vm.add({ title: 'B', duration: 60000 })
		wrapper.vm.add({ title: 'C', duration: 60000 })
		await nextTick()

		expect(titles()).toEqual(['B', 'A'])
		wrapper.vm.remove(a)
		await nextTick()
		expect(titles()).toEqual(['C', 'B'])
		wrapper.unmount()
	})

	it('предел считается отдельно для каждой позиции', async () => {
		const wrapper = open({ maxVisible: 1 })
		wrapper.vm.add({ title: 'A', duration: 60000 })
		wrapper.vm.add({ title: 'B', duration: 60000 })
		wrapper.vm.add({ title: 'C', position: 'bottom-right', duration: 60000 })
		await nextTick()

		expect(titles().sort()).toEqual(['A', 'C'])
		wrapper.unmount()
	})

	it('таймер ожидающего уведомления стартует с появления', async () => {
		vi.useFakeTimers()
		const wrapper = open({ maxVisible: 1 })
		wrapper.vm.add({ title: 'A', duration: 3000 })
		wrapper.vm.add({ title: 'B', duration: 3000 })
		await vi.advanceTimersByTimeAsync(2999)
		expect(titles()).toEqual(['A'])

		await vi.advanceTimersByTimeAsync(1)
		await vi.advanceTimersByTimeAsync(2999)
		expect(titles()).toEqual(['B'])
		await vi.advanceTimersByTimeAsync(1)
		expect(titles()).toEqual([])
		wrapper.unmount()
	})

	it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])('maxVisible=%s — без предела', async value => {
		const wrapper = open({ maxVisible: value })
		for (const title of ['A', 'B', 'C']) wrapper.vm.add({ title, duration: 60000 })
		await nextTick()

		expect(items()).toHaveLength(3)
		wrapper.unmount()
	})

	it('дробный предел округляется вниз, предел действует и на управляемый items', async () => {
		const wrapper = open({
			maxVisible: 1.9,
			items: [
				{ id: 1, title: 'Новое' },
				{ id: 2, title: 'Старое' },
			],
		})
		await nextTick()

		expect(titles()).toEqual(['Старое'])
		wrapper.unmount()
	})

	it('maxVisible можно задать умолчаниями плагина', async () => {
		const wrapper = mount(BaseNotification, {
			props: { isContained: true },
			attachTo: document.body,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseNotification: { maxVisible: 1 } } })] },
		})
		wrapper.vm.add({ title: 'A', duration: 60000 })
		wrapper.vm.add({ title: 'B', duration: 60000 })
		await nextTick()

		expect(titles()).toEqual(['A'])
		wrapper.unmount()
	})
})

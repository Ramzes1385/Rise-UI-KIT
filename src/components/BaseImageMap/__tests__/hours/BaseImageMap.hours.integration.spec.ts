import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { setLocale } from '@/locales/state'
import { UI_IMAGE_MAP } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import BaseImageMap from '../../ui/BaseImageMap.vue'
import type { ImageMapData } from '../../types/imageMapData.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const FRIDAY_18_MSK = Date.parse('2026-10-02T15:00:00Z')

const HOURS_DATA: ImageMapData = {
	timeZone: 'Europe/Moscow',
	layers: [{ id: 'f1', title: 'Этаж', width: 100, height: 100 }],
	filters: [{ id: 'now', title: 'Часы работы', type: 'open-now' }],
	objects: [
		{ id: 'cafe', type: 'point', title: 'Кафе', x: 0.1, y: 0.1, hours: { week: { fri: ['09:00-21:00'], sat: ['10:00-22:00'] } } },
		{
			id: 'bar',
			type: 'point',
			title: 'Бар',
			x: 0.5,
			y: 0.5,
			hours: { timeZone: 'Asia/Yekaterinburg', week: { fri: ['22:00-03:00'] } },
		},
		{ id: 'atm', type: 'point', title: 'Банкомат', x: 0.9, y: 0.9 },
	],
}

const PROPS = { data: HOURS_DATA, now: FRIDAY_18_MSK, hasZoomControls: false, hasFullscreen: false, hasDirectory: true }

function entryOf(container: Element, id: string): HTMLElement {
	return container.querySelector(`[data-image-map-entry="${id}"]`) as HTMLElement
}

function objectOf(container: Element, id: string): HTMLElement {
	return container.querySelector(`.base-image-map__stage [data-image-map-object="${id}"]`) as HTMLElement
}

describe('BaseImageMap — часы работы', () => {
	beforeEach(() => setLocale('ru'))

	it('строки списка показывают состояние, открытые — своим классом', () => {
		const { container } = render(BaseImageMap, { props: PROPS })
		const cafe = entryOf(container, 'cafe').querySelector('.base-image-map__entry-hours')
		expect(cafe).toHaveTextContent('Открыто до 21:00')
		expect(cafe).toHaveClass('base-image-map__entry-hours--open')
		const bar = entryOf(container, 'bar').querySelector('.base-image-map__entry-hours')
		expect(bar).toHaveTextContent('Закрыто, откроется в 22:00')
		expect(bar).not.toHaveClass('base-image-map__entry-hours--open')
		expect(entryOf(container, 'atm').querySelector('.base-image-map__entry-hours')).toBeNull()
	})

	it('подсказка: строка состояния без расписания', async () => {
		const { container } = render(BaseImageMap, { props: PROPS })
		await fireEvent.focusIn(objectOf(container, 'cafe'))
		const tooltip = document.querySelector('.base-image-map__tooltip') as HTMLElement
		expect(within(tooltip).getByText('Открыто до 21:00')).toHaveClass('base-image-map-card__hours--open')
		expect(tooltip.querySelector('.base-image-map-card__schedule')).toBeNull()
	})

	it('окно объекта: состояние и расписание недели, сегодня отмечено', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseImageMap, { props: PROPS })
		await user.click(objectOf(container, 'cafe'))
		const dialog = await screen.findByRole('dialog', { name: 'Кафе' })
		expect(within(dialog).getByText(UI_IMAGE_MAP.HOURS)).toBeInTheDocument()
		const rows = [...dialog.querySelectorAll('.base-image-map-card__schedule-row')]
		expect(rows.map(row => row.textContent)).toEqual([
			'пн' + UI_IMAGE_MAP.DAY_OFF,
			'вт' + UI_IMAGE_MAP.DAY_OFF,
			'ср' + UI_IMAGE_MAP.DAY_OFF,
			'чт' + UI_IMAGE_MAP.DAY_OFF,
			'пт9:00–21:00',
			'сб10:00–22:00',
			'вс' + UI_IMAGE_MAP.DAY_OFF,
		])
		expect(rows[4]).toHaveClass('base-image-map-card__schedule-row--today')
	})

	it('фильтр «Открыто сейчас» прячет закрытые и объекты без часов — в списке и на карте', async () => {
		const user = userEvent.setup()
		const { container, emitted } = render(BaseImageMap, { props: PROPS })
		const toggle = screen.getByRole('switch', { name: UI_IMAGE_MAP.OPEN_NOW })
		expect(within(screen.getByRole('group', { name: UI_IMAGE_MAP.FILTERS })).getByText('Часы работы')).toBeInTheDocument()
		await user.click(toggle)
		expect(emitted()['update:filters']?.[0]).toEqual([{ now: ['open'] }])
		expect(entryOf(container, 'cafe')).not.toBeNull()
		expect(entryOf(container, 'bar')).toBeNull()
		expect(entryOf(container, 'atm')).toBeNull()
		expect(objectOf(container, 'bar')).toBeNull()
	})

	it('v-model:filters с включённым фильтром и смена now', async () => {
		const { container, rerender } = render(BaseImageMap, { props: { ...PROPS, filters: { now: ['open'] } } })
		expect(entryOf(container, 'bar')).toBeNull()
		await rerender({ now: Date.parse('2026-10-02T18:00:00Z') })
		expect(entryOf(container, 'cafe')).toBeNull()
		expect(entryOf(container, 'bar')).toHaveTextContent('Открыто до 3:00')
	})

	it('слоты подсказки, окна и строки получают hours', async () => {
		const user = userEvent.setup()
		const slot = (props: { hours?: { text: string } }) => h('span', { class: 'slot-hours' }, props.hours?.text ?? 'нет')
		const { container } = render(BaseImageMap, {
			props: PROPS,
			slots: { tooltip: slot, popup: slot, 'directory-item': slot },
		})
		expect(entryOf(container, 'atm')).toHaveTextContent('нет')
		expect(entryOf(container, 'cafe')).toHaveTextContent('Открыто до 21:00')
		await fireEvent.focusIn(objectOf(container, 'bar'))
		expect(document.querySelector('.base-image-map__tooltip .slot-hours')).toHaveTextContent('Закрыто, откроется в 22:00')
		await user.click(objectOf(container, 'cafe'))
		const dialog = await screen.findByRole('dialog', { name: 'Кафе' })
		expect(dialog.querySelector('.slot-hours')).toHaveTextContent('Открыто до 21:00')
	})
})

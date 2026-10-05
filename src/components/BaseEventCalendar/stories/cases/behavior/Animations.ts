import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseEventCalendar.stories'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'

const events: CalendarEvent[] = [
	{ id: 'standup', title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00' },
	{ id: 'conference', title: 'Конференция', start: '2026-10-14', end: '2026-10-17', color: 'var(--rise-info)' },
	{ id: 'review', title: 'Ревью', start: '2026-11-05T14:00', end: '2026-11-05T15:00', color: 'var(--rise-warning)' },
	{ id: 'trip', title: 'Командировка', start: '2026-11-17', end: '2026-11-20', color: 'var(--rise-success)' },
	{ id: 'release', title: 'Релиз', start: '2026-12-03T22:00', end: '2026-12-03T23:00', color: 'var(--rise-error)' },
	{ id: 'party', title: 'Праздник', start: '2026-12-25', allDay: true, color: 'var(--rise-warning)' },
]

const steps = [
	{ view: 'month', date: '2026-10-02' },
	{ view: 'month', date: '2026-11-02' },
	{ view: 'month', date: '2026-12-02' },
	{ view: 'month', date: '2026-11-02' },
	{ view: 'list', date: '2026-11-02' },
]

const motion = motionPresetsStory({
	item: `
		<BaseEventCalendar v-bind="args" :events="events" :view="steps[step].view" :date="steps[step].date" style="width: 100%">
			<template #toolbar="{ title }">
				<strong>{{ title }}</strong>
			</template>
		</BaseEventCalendar>
	`,
	components: { BaseEventCalendar, BaseButton },
	imports: ['BaseEventCalendar'],
	state: { step: 0, steps, events },
	action: 'step = (step + 1) % steps.length',
	trigger: 'Следующий шаг',
	omit: ['events', 'view', 'date'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'maxEventsPerDay'] },
		docs: {
			description: {
				story: [
					'Календарь в колонках четырёх пресетов движения; кнопка по кругу листает период вперёд, вперёд, назад, переключает',
					'вид на «Список» и возвращается к месяцу. Новая сетка периода въезжает по направлению на `--rise-motion-distance`',
					'и проявляется за `--rise-duration`, прежняя уходит в обратную сторону и гаснет за `--rise-duration-fast` (вне потока,',
					'скрыта от скринридера и недоступна для фокуса, без `data-*` — перетаскивание и выделение её не видят). Смена вида —',
					'затухание с масштабом от `--rise-motion-scale-from`. События внутри сетки не анимируются: их положение и высота',
					'меняются сразу. Прокрутка шкалы недели и дня при смене периода сохраняется, фокус в сетке переходит на тот же день.',
					'Чтобы календарь поместился в четыре колонки, вид уменьшен (`size-scale` 70, одно событие в дне), панель заменена',
					'заголовком периода через слот `toolbar`. В пресете `none` и при «уменьшить движение» — сразу конечное состояние.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	args: { sizeScale: 70, maxEventsPerDay: 1 },
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const next = canvas.getByRole('button', { name: 'Следующий шаг' })
		const shown = async (name: string) => waitFor(() => expect(canvas.getAllByRole('grid', { name })).toHaveLength(4))
		await userEvent.click(next)
		await shown('Ноябрь 2026 г.')
		await userEvent.click(next)
		await shown('Декабрь 2026 г.')
		await userEvent.click(next)
		await shown('Ноябрь 2026 г.')
		await userEvent.click(next)
		await waitFor(() => expect(canvas.queryAllByRole('grid')).toHaveLength(0))
		await expect(canvas.getAllByRole('list', { name: /5 ноября/ })).toHaveLength(4)
		await userEvent.click(next)
		await shown('Октябрь 2026 г.')
	},
}

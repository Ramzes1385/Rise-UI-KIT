import type meta from '../../BaseCalendar.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCalendar from '../../../ui/BaseCalendar.vue'
import { expect, userEvent, waitFor } from 'storybook/test'
import { STORY_TODAY, motionPresetsStory, storyDate } from '@/stories/helpers'

const PRESETS = 4
const month = STORY_TODAY.getMonth()

const motion = motionPresetsStory({
	item: `
		<BaseCalendar v-bind="args" :initial-month="months[step % months.length]" />
	`,
	components: { BaseButton, BaseCalendar },
	imports: ['BaseCalendar'],
	state: { step: 0, months: [month, month + 1, month + 2, month + 1] },
	action: 'step++',
	trigger: 'Сменить месяц',
	omit: ['initialMonth'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		maxWidth: 1400,
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена периода и вида в колонках четырёх пресетов движения. «Сменить месяц» ведёт календари по кругу',
					'май → июнь → июль → июнь → май, так что видно оба направления: сетка дней уезжает в сторону листания и приезжает',
					'с другой (`transform: translateX` на `--rise-motion-distance` и `opacity`), строка дней недели стоит на месте.',
					'Заголовок месяца переключает вид дни → месяцы → годы — виды сменяются перекрёстным появлением с масштабом',
					'(`--rise-motion-scale-from`); листание лет в видах «месяцы» и «годы» — тот же сдвиг. Появление длится',
					'`--rise-duration` с `--rise-ease-out`, уход — `--rise-duration-fast` с `--rise-ease-in`. Уходящая сетка на время',
					'перехода лежит поверх новой (`position: absolute`, высота календаря не прыгает), скрыта от вспомогательных',
					'технологий (`aria-hidden`, `inert`) и не принимает щелчков. В пресете `none` и при «уменьшить движение» — сразу',
					"конечное состояние. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	args: { modelValue: storyDate(0, 0, 0) },
	render: motion.render,
	play: async ({ canvas, canvasElement }) => {
		const titles = (name: RegExp) => canvas.getAllByRole('button', { name })
		const next = canvas.getByRole('button', { name: 'Сменить месяц' })
		await expect(canvasElement.querySelectorAll('.base-calendar')).toHaveLength(PRESETS)
		await expect(titles(/май 2025/i)).toHaveLength(PRESETS)

		await userEvent.click(next)
		await userEvent.click(next)
		await waitFor(() => expect(titles(/июль 2025/i)).toHaveLength(PRESETS))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-calendar__grid')).toHaveLength(PRESETS))

		next.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(titles(/июнь 2025/i)).toHaveLength(PRESETS))

		for (const title of titles(/июнь 2025/i)) await userEvent.click(title)
		await waitFor(() => expect(canvas.getAllByRole('button', { name: /^июль$/i })).toHaveLength(PRESETS))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-calendar__days')).toHaveLength(0))
	},
}

import { findPanel } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseDatePicker from '../../../ui/BaseDatePicker.vue'
import { expect, waitFor, within, screen } from 'storybook/test'

const motion = motionPresetsStory({
	item: `<BaseDatePicker v-bind="args" :model-value="isLater ? new Date(2025, 5, 16) : new Date(2025, 4, 15)" />`,
	components: { BaseDatePicker, BaseButton },
	imports: ['BaseDatePicker'],
	state: { isLater: false },
	action: 'isLater = !isLater',
	trigger: 'Сменить дату',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { isMultiMonth: false },
	parameters: {
		controls: { include: ['inputVariant', 'calendarVariant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Дейтпикер в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Сменить дату» переключает значение между 15 мая и 16 июня. Откройте панель: она проявляется с лёгким увеличением',
					'(`opacity`, `transform: scale` от `--rise-motion-scale-from`) за `--rise-duration` с кривой `--rise-ease-out`, уходит',
					'за `--rise-duration-fast`. Стрелки месяца и года сдвигают месяц по направлению: вперёд — справа налево, назад — слева',
					'направо (`--rise-motion-distance`); прежний месяц уходит, затем въезжает новый — высота панели меняется один раз.',
					'Панель открывается в слое страницы, поэтому длительности берутся из пресета страницы. Сетку дней рисует BaseCalendar.',
					"Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка",
					'«уменьшить движение» действует всегда: панель и месяц меняются сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить дату' }))
		await waitFor(async () => {
			for (const field of canvas.getAllByLabelText('Дата встречи')) await expect(field).toHaveValue('16.06.2025')
		})

		await userEvent.click(canvas.getAllByRole('button', { name: 'Открыть календарь' })[2])
		const panel = await findPanel()
		const before = panel.querySelector('.date-picker-panel__months')
		await userEvent.click(within(panel).getByRole('button', { name: 'Следующий месяц' }))
		await waitFor(() => expect(panel.querySelectorAll('.date-picker-panel__months')).toHaveLength(1))
		await waitFor(() => expect(panel.querySelector('.date-picker-panel__months')).not.toBe(before))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

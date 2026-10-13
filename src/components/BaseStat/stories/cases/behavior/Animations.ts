import type meta from '../../BaseStat.stories'
import BaseStat from '../../../ui/BaseStat.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const values = [4_820_000, 5_310_000, 5_310_000, 3_960_000]

const changes = [0.12, 0.1, 0.1, -0.25]

const motion = motionPresetsStory({
	item: `
		<BaseStat v-bind="args" :value="values[step]" :change="changes[step]" :is-loading="step === 2" />
	`,
	components: { BaseStat, BaseButton },
	imports: ['BaseStat'],
	steps: ['новое значение', 'загрузка', 'загружено с новым значением'],
	state: { values, changes },
	omit: ['value', 'change', 'isLoading'],
	slots: ['value', 'change', 'isLoading'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'valueFormat', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена значения и загрузка в четырёх пресетах движения. Шаг «новое значение» — число плавно доходит до нового',
					'(`useTween`, длительность `--rise-duration-xslow`, замедление к концу) в том же формате `valueFormat`; цвет',
					'изменения меняется за `--rise-duration-fast`. Скринридер читает только итоговое значение — промежуточные числа',
					'скрыты от него. Шаги «загрузка» и «загружено» — заглушка гаснет, значение проявляется на её месте (`--rise-duration`,',
					'`--rise-ease-out`), строка изменения проявляется без сдвига раскладки.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`:",
					'значение встаёт сразу; системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const shown = () => [...canvasElement.querySelectorAll('.base-stat__content')].map(node => node.textContent?.replace(/\s/g, ' '))

		const next = canvas.getByRole('button', { name: /^(Следующий шаг|Повторить)/ })

		await userEvent.click(next)
		await waitFor(() => expect(shown()).toEqual(Array(4).fill('5,31 млн ₽')))
		await userEvent.click(next)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-stat[aria-busy="true"]')).toHaveLength(4))
		await userEvent.click(next)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-skeleton')).toHaveLength(0))
		await waitFor(() => expect(shown()).toEqual(Array(4).fill('3,96 млн ₽')))
		await expect(next).toHaveAccessibleName('Повторить')
	},
}

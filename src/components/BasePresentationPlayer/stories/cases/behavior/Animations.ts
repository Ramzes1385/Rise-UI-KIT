import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { expect, waitFor, within } from 'storybook/test'
import type meta from '../../BasePresentationPlayer.stories'
import BasePresentationPlayer from '../../../ui/BasePresentationPlayer.vue'

const motion = motionPresetsStory({
	item: `
		<BasePresentationPlayer :key="replay" v-bind="args" />
	`,
	components: { BasePresentationPlayer, BaseButton },
	imports: ['BasePresentationPlayer'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { title: 'Смена слайдов' },
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		maxWidth: 1400,
		controls: { include: ['navigation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Плеер презентации в четырёх пресетах движения. Листайте кнопками «Следующий слайд» и «Предыдущий слайд»:',
					'старый слайд гаснет и уходит в сторону, новый приходит с той стороны, куда листают, — вперёд справа, назад слева',
					'(`opacity` и `transform`, длительность — `--rise-duration` × 1,3, кривая `--rise-ease-emphasized`, сдвиг',
					'`--rise-motion-distance`). Боковая панель «Список слайдов» выезжает за `--rise-duration-slow` × 2,4 и уходит за',
					'`--rise-duration` × 1,2. В пресете `none` и при «уменьшить движение» сдвиг 0, а смена слайда и панели мгновенные.',
					"«Повторить» монтирует плееры заново. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
					'Одинаковые экземпляры для сравнения — регионы с одним именем, поэтому правило axe `landmark-unique` у этой истории выключено.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		const players = await waitFor(() => {
			const found = [...canvasElement.querySelectorAll<HTMLElement>('.base-presentation-player')]
			expect(found).toHaveLength(4)
			return found
		})
		const standard = within(players[2])
		const slides = standard.getByRole('slider', { name: 'Слайды' })

		await userEvent.click(standard.getByRole('button', { name: 'Следующий слайд' }))
		await waitFor(() => expect(slides).toHaveAttribute('aria-valuetext', 'Слайд 2 из 3: Наши ценности'))
		await waitFor(() => expect(standard.getByRole('img', { name: 'Горы в тумане — три ценности компании' })).toBeVisible())

		await userEvent.click(standard.getByRole('button', { name: 'Предыдущий слайд' }))
		await waitFor(() => expect(slides).toHaveAttribute('aria-valuetext', 'Слайд 1 из 3: Кто мы'))
		await waitFor(() => expect(standard.getByRole('img', { name: 'Горы на рассвете — обложка курса' })).toBeVisible())
	},
}

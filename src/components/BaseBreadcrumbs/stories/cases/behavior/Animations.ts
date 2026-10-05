import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseBreadcrumbs from '../../../ui/BaseBreadcrumbs.vue'

const motion = motionPresetsStory({
	item: `
		<BaseBreadcrumbs :key="replay" v-bind="args" :max-items="2" />
	`,
	components: { BaseBreadcrumbs, BaseButton },
	imports: ['BaseBreadcrumbs'],
	omit: ['linkComponent', 'maxItems'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'separator', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Раскрытие свёрнутого пути в четырёх пресетах движения: нажмите «…» в колонке. Раскрытые крошки проявляются',
					'с лёгким масштабом от `--rise-motion-scale-from` за `--rise-duration` на кривой `--rise-ease-out`, видимые крошки',
					'сдвигаются на новое место тем же переходом. Сворачивание — сразу. Фокус остаётся на кнопке «…».',
					'«Повторить» возвращает путь в свёрнутый вид. В `none` и при «уменьшить движение» крошки появляются сразу.',
					"Выключить в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const toggles = canvas.getAllByRole('button', { name: 'Показать ещё 3 раздела' })
		await expect(toggles).toHaveLength(4)
		for (const toggle of toggles) await userEvent.click(toggle)
		await waitFor(() => expect(canvas.getAllByRole('link', { name: 'Каталог' })).toHaveLength(4))
		for (const link of canvas.getAllByRole('link', { name: 'Каталог' })) await waitFor(() => expect(link).toBeVisible())

		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.queryAllByRole('link', { name: 'Каталог' })).toHaveLength(0))
	},
}

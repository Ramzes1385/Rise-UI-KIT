import { BaseIcon } from '@components/BaseIcon'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseToolbar.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseToolbar from '../../../ui/BaseToolbar.vue'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseToolbar v-bind="args">
				<BaseButton variant="ghost" aria-label="Полужирный" :padding="{ x: 6, y: 6 }"><BaseIcon name="bold" /></BaseButton>
				<BaseButton variant="ghost" aria-label="Курсив" :padding="{ x: 6, y: 6 }"><BaseIcon name="italic" /></BaseButton>
				<BaseButton variant="ghost" aria-label="Подчёркнутый" :padding="{ x: 6, y: 6 }"><BaseIcon name="underline" /></BaseButton>
			</BaseToolbar>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseIcon, BaseToolbar },
	imports: ['BaseAnimation', 'BaseIcon', 'BaseToolbar'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'orientation'] },
		docs: {
			description: {
				story: [
					'Своего движения у панели нет — в колонках четырёх пресетов движения она появляется через `BaseAnimation`',
					'(`slide-up`); «Повторить» монтирует её заново. Длительность и сдвиг — токены `--rise-duration*` и `--rise-motion-distance`,',
					"поэтому атрибут `data-rise-motion` меняет движение всей области. Выключить — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByRole('toolbar', { name: 'Форматирование' })).toHaveLength(4))
		for (const toolbar of canvas.getAllByRole('toolbar', { name: 'Форматирование' })) await waitFor(() => expect(toolbar).toBeVisible())
	},
}

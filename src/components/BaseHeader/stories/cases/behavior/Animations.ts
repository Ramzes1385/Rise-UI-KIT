import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseHeader.stories'
import { expect, waitFor } from 'storybook/test'
import BaseHeader from '../../../ui/BaseHeader.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<article>
			<BaseAnimation :key="replay" name="slide-down">
				<BaseHeader v-bind="args" :is-sticky="false">
					<BaseLink href="#orders">Заказы</BaseLink>
				</BaseHeader>
			</BaseAnimation>
		</article>
	`,
	components: { BaseAnimation, BaseButton, BaseHeader, BaseLink },
	imports: ['BaseAnimation', 'BaseHeader', 'BaseLink'],
	slots: [],
	omit: ['isSticky'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isCompact', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'У шапки нет своего движения: ссылки и кнопки внутри меняют цвет при наведении (`--rise-duration-fast`),',
					'меню узкого экрана выезжает панелью BaseDrawer с её движением. Здесь — появление через BaseAnimation (`slide-down`)',
					'в четырёх пресетах: длительность и сдвиг — `--rise-duration`, `--rise-motion-distance`.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByText('Rise CRM')).toHaveLength(4))
		for (const title of canvas.getAllByText('Rise CRM')) await waitFor(() => expect(title).toBeVisible())
	},
}

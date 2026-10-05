import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseFooter.stories'
import { expect, waitFor } from 'storybook/test'
import BaseFooter from '../../../ui/BaseFooter.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<article>
			<BaseAnimation :key="replay" name="fade">
				<BaseFooter v-bind="args">
					<template #start>© 2026 Rise Studio</template>
					<BaseLink href="#help">Помощь</BaseLink>
				</BaseFooter>
			</BaseAnimation>
		</article>
	`,
	components: { BaseAnimation, BaseButton, BaseFooter, BaseLink },
	imports: ['BaseAnimation', 'BaseFooter', 'BaseLink'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isCompact', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Подвал статичен: своего движения у него нет, ссылки внутри меняют цвет при наведении (`--rise-duration-fast`).',
					'Здесь — появление через BaseAnimation (`fade`) в четырёх пресетах движения: длительность — `--rise-duration`.',
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
		await waitFor(() => expect(canvas.getAllByText('© 2026 Rise Studio')).toHaveLength(4))
		for (const text of canvas.getAllByText('© 2026 Rise Studio')) await waitFor(() => expect(text).toBeVisible())
	},
}

import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseCookieConsent.stories'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'

const motion = motionPresetsStory({
	item: `
		<div class="story-frame" style="height: 360px; background: var(--rise-bg-muted)">
			<BaseCookieConsent v-bind="args" v-model:is-open="isOpen" />
		</div>
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Показать или скрыть',
	components: { BaseCookieConsent, BaseButton },
	imports: ['BaseCookieConsent'],
	slots: ['default', 'isOpen'],
	omit: ['default', 'isOpen'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'position'] },
		docs: {
			description: {
				story: [
					'Появление и уход в четырёх пресетах движения: кнопка сверху или любое решение в окне (`v-model:is-open`). Окно выезжает снизу',
					'вместе с изменением прозрачности: смещение и длительность — токены движения `--rise-motion-distance` и `--rise-duration`',
					"(`enter-slide`). В `none` и при «уменьшить движение» — сразу. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('dialog')).toHaveLength(4)
		await userEvent.click(canvas.getAllByRole('button', { name: 'Принять все' })[0])
		await waitFor(() => expect(canvas.queryAllByRole('dialog')).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Показать или скрыть' }))
		await waitFor(() => expect(canvas.getAllByRole('dialog')).toHaveLength(4))
	},
}

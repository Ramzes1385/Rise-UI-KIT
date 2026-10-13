import type meta from '../BaseMarkdown.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import BaseMarkdown from '../../ui/BaseMarkdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseMarkdown v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseMarkdown },
	imports: ['BaseAnimation', 'BaseMarkdown'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { source: '**Готово.** Отчёт — в [журнале](https://example.com), код: `npm run build`.', variant: 'soft' },
	parameters: {
		controls: { include: ['source', 'variant', 'isStreaming'] },
		docs: {
			description: {
				story: [
					'Своего появления у текста нет — в колонках четырёх пресетов движения он появляется через `BaseAnimation` (`slide-up`);',
					'«Повторить» монтирует его заново. Длительность и сдвиг — токены `--rise-duration*` и `--rise-motion-distance`.',
					'Единственная своя анимация — мигающий курсор потокового ответа (`isStreaming` в Controls): период — токен',
					"`--rise-duration-loop`, это декоративная петля, при системной настройке «уменьшить движение», в пресете `none` и при `reducedMotion: 'always'` курсор не мигает.",
					"Выключить появление в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-markdown')).toHaveLength(4))
		for (const block of canvasElement.querySelectorAll('.base-markdown')) await waitFor(() => expect(block).toBeVisible())
	},
}

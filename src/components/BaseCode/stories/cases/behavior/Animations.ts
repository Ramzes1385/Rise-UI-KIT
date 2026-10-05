import type meta from '../../BaseCode.stories'
import BaseCode from '../../../ui/BaseCode.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseCode v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseCode },
	imports: ['BaseAnimation', 'BaseCode'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { code: 'npm run build', language: 'bash' },
	parameters: {
		controls: { include: ['code', 'language', 'variant'] },
		docs: {
			description: {
				story: [
					'Своего движения у блока кода нет — в колонках четырёх пресетов движения он появляется через `BaseAnimation` (`slide-up`);',
					'«Повторить» монтирует его заново. После «Копировать» иконка сменяется на галочку и обратно с масштабом (`enter-pop`).',
					'Длительности и сдвиг — токены `--rise-duration*`, `--rise-ease-spring`, `--rise-motion-distance`, `--rise-motion-scale-from`,',
					"поэтому атрибут `data-rise-motion` меняет движение всей области. Выключить — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-code')).toHaveLength(4))
		for (const code of canvasElement.querySelectorAll('.base-code')) await waitFor(() => expect(code).toBeVisible())
	},
}

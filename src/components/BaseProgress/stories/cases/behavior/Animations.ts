import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseProgress from '../../../ui/BaseProgress.vue'

const motion = motionPresetsStory({
	item: `
		<div class="story-stack">
			<BaseProgress v-bind="args" :value="value" has-label aria-label="Значение" />
			<template v-for="animation in ['striped', 'pulse', 'glow', 'flow']" :key="animation">
				<span class="story-label">{{ animation }}</span>
				<BaseProgress v-bind="args" :value="value" :animation="animation" :aria-label="animation" />
			</template>
			<BaseProgress v-bind="args" :value="value" shape="circle" has-label aria-label="Кольцо" />
		</div>
	`,
	components: { BaseButton, BaseProgress },
	imports: ['BaseProgress'],
	state: { value: 30 },
	action: 'value = value === 30 ? 80 : 30',
	trigger: 'Изменить значение',
	slots: ['default', 'value', 'shape', 'animation', 'hasLabel', 'ariaLabel'],
	omit: ['default', 'value', 'shape', 'animation', 'hasLabel', 'ariaLabel'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['fill', 'sizeScale', 'color'] },
		docs: {
			description: {
				story: [
					'Смена значения в четырёх пресетах движения: заливка полосы открывается `clip-path`, подпись едет `transform`,',
					'число процентов растёт плавно (`--rise-duration`, `--rise-ease`), кольцо — `stroke-dashoffset`. Петли `animation`',
					'(`striped` — полосы, `pulse` — мерцание, `glow` — свечение, `flow` — перелив) и бегущая полоса `isIndeterminate` —',
					'кратные токена `--rise-duration-loop` (1s; пресеты его не обнуляют) и декоративные: при «уменьшить движение» и в пресете `none` замирают.',
					"Выключить переходы в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`:",
					'значение и число встают сразу; системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Изменить значение' }))
		await waitFor(() =>
			expect(canvas.getAllByRole('progressbar').filter(bar => bar.getAttribute('aria-valuenow') === '80')).toHaveLength(24),
		)
		await waitFor(() => expect(canvas.getAllByText('80%')).toHaveLength(8))
		const fill = (preset: string) =>
			canvasElement.querySelector(`[data-rise-motion="${preset}"] .base-progress--striped .base-progress__fill`)!
		await expect(getComputedStyle(fill('none')).animationPlayState).toBe('paused')
		await expect(getComputedStyle(fill('standard')).animationPlayState).toBe('running')
	},
}

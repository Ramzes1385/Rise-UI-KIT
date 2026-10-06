import { BaseApp } from '@components/BaseApp'
import type meta from '../../BaseTour.stories'
import BaseTour from '../../../ui/BaseTour.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const steps = [
	{ title: 'Первый шаг', content: 'Появление слоя и карточки.' },
	{ title: 'Второй шаг', content: 'Карточка перерисовывается при смене шага.' },
]

const presets = [
	['none', 'none — без движения'],
	['subtle', 'subtle — сдержанно'],
	['standard', 'standard — по умолчанию'],
	['expressive', 'expressive — выразительно'],
] as const

const column = ([preset, label]: (typeof presets)[number]): string => `
			<div class="story-motion__preset" data-rise-motion="${preset}">
				<span class="story-label">${label}</span>
				<div class="story-frame" style="height: 260px; contain: layout;">
					<BaseApp teleport-to="#tour-layer-${preset}" :toaster="{ ariaLabel: 'Уведомления ${preset}' }">
						<BaseTour v-bind="args" v-model:is-open="isOpen" :steps="steps" />
						<div id="tour-layer-${preset}" />
					</BaseApp>
				</div>
			</div>`

const template = `
	<div class="story-motion" style="--story-motion-min: 360px;">
		<BaseButton variant="outline" @click="isOpen = !isOpen">Открыть или закрыть</BaseButton>
		<div class="story-motion__presets">${presets.map(column).join('')}
		</div>
	</div>
`

const state = { isOpen: true }

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		controls: { include: ['animation'] },
		docs: {
			description: {
				story: [
					'Появление и уход тура в четырёх пресетах движения: слой с затемнением проявляется, карточка появляется по пропу `animation` —',
					'`scale` (по умолчанию) — масштаб от стороны цели, `fade` — прозрачность, `slide` — сдвиг со стороны цели на `--rise-motion-distance`,',
					'`pop` — масштаб с пружиной (перелёт — в `expressive`), `none` — сразу, и слой тоже. При смене шага карточка уходит и появляется',
					'заново, подсветка перелетает к новой цели (позиция — `transform`). Длительности — токены движения; в `none` и при',
					'«уменьшить движение» — сразу. Тур — на весь экран, поэтому колонки — свои контейнеры слоёв (`<BaseApp teleport-to>`, `contain: layout`).',
					"Для всего приложения — `createUiKitPlugin({ defaults: { BaseTour: { animation: 'fade' } } })`.",
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseApp', 'BaseButton', 'BaseTour'],
				script: `const steps = ${literal(steps)}`,
				state,
				omit: ['isOpen', 'steps', 'step', 'onUpdate:isOpen', 'onUpdate:step', 'onSkip', 'onFinish', 'onClose'],
			}),
		},
	},
	render: args => ({
		components: { BaseApp, BaseButton, BaseTour },
		setup: useStorySetup(args, { state, data: { steps }, slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const tours = () => canvasElement.querySelectorAll('.base-tour')
		await waitFor(() => expect(tours()).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(tours()).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(tours()).toHaveLength(4))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-tour__card')).toHaveLength(4))
	},
}

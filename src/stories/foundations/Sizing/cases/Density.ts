import { expect } from 'storybook/test'
import type meta from '../Sizing.stories'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, staticStorySource, useStorySetup } from '@/stories/helpers'

const STATE = { text: '', compact: '' }

const template = `
	<div class="story-grid" style="--story-grid-min: 280px;">
		<div class="story-frame story-col">
			<span class="story-label">По умолчанию</span>
			<BaseInput v-model="text" placeholder="Поле ввода" />
			<BaseButton>Сохранить</BaseButton>
		</div>
		<div class="story-frame story-col" style="--rise-control-padding-y: 5px; --rise-control-padding-x: 10px;">
			<span class="story-label">--rise-control-padding-y: 5px</span>
			<BaseInput v-model="compact" placeholder="Поле ввода" />
			<BaseButton>Сохранить</BaseButton>
		</div>
	</div>
`

export const Density: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Плотность интерфейса без пропов: токены `--rise-control-padding-y/x`, заданные на контейнере (или на `:root`),',
					'меняют высоту всех контролов внутри. Слева — по умолчанию (36px, `--rise-control-padding-y: 7px`), справа — плотнее: `--rise-control-padding-y: 5px` (32px).',
					'',
					'```css',
					'/* весь интерфейс плотнее: контролы 32px */',
					':root {',
					'  --rise-control-padding-y: 5px;',
					'  --rise-control-padding-x: 10px;',
					'}',
					'```',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: ['BaseButton', 'BaseInput'], state: STATE }),
		},
	},
	render: args => ({
		components: { BaseButton, BaseInput },
		setup: useStorySetup(args, { state: STATE }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [regular, compact] = [...canvasElement.querySelectorAll('.base-button')].map(el =>
			Math.round(el.getBoundingClientRect().height),
		)
		await expect(compact).toBeLessThan(regular)
		if (isStoryBranded()) return
		await expect(regular).toBe(36)
		await expect(compact).toBe(32)
	},
}

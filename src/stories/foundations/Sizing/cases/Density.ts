import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../Sizing.stories'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'

export const Density: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Плотность интерфейса без пропов: токены `--rise-control-padding-y/x`, заданные на контейнере (или на `:root`),',
					'меняют высоту всех контролов внутри. Слева — по умолчанию (32px), справа — `--rise-control-padding-y: 7px` (36px).',
				].join('\n'),
			},
			source: {
				code: [
					'/* весь интерфейс просторнее: контролы 36px */',
					':root {',
					'  --rise-control-padding-y: 7px;',
					'  --rise-control-padding-x: 12px;',
					'}',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { BaseButton, BaseInput },
		setup: () => ({ text: ref(''), spacious: ref('') }),
		template: `
			<div class="story-grid" style="--story-grid-min: 280px;">
				<div class="story-frame story-col">
					<span class="story-label">По умолчанию</span>
					<BaseInput v-model="text" placeholder="Поле ввода" />
					<BaseButton>Сохранить</BaseButton>
				</div>
				<div class="story-frame story-col" style="--rise-control-padding-y: 7px; --rise-control-padding-x: 12px;">
					<span class="story-label">--rise-control-padding-y: 7px</span>
					<BaseInput v-model="spacious" placeholder="Поле ввода" />
					<BaseButton>Сохранить</BaseButton>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [compact, spacious] = [...canvasElement.querySelectorAll('.base-button')].map(el =>
			Math.round(el.getBoundingClientRect().height),
		)
		await expect(compact).toBe(32)
		await expect(spacious).toBe(36)
	},
}

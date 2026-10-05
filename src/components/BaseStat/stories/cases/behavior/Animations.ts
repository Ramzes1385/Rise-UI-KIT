import type meta from '../../BaseStat.stories'
import BaseStat from '../../../ui/BaseStat.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import { BaseSwitch } from '@components/BaseSwitch'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { MOTION_PRESETS } from '@composables/app/useMotion/types/useMotion.types'

const presets = MOTION_PRESETS

const values = [4_820_000, 5_310_000, 3_960_000]

const changes = [0.12, 0.1, -0.25]

const state = { step: 0, isLoaded: true }

const template = `
	<div class="story-motion">
		<div class="story-row">
			<BaseButton variant="outline" @click="step = (step + 1) % values.length">Новое значение</BaseButton>
			<BaseSwitch v-model="isLoaded" label="Загружено" />
		</div>
		<div class="story-motion__presets">
			<div v-for="preset in presets" :key="preset" class="story-motion__preset" :data-rise-motion="preset">
				<span class="story-label">{{ preset }}</span>
				<BaseStat v-bind="args" :value="values[step]" :change="changes[step]" :is-loading="!isLoaded" />
			</div>
		</div>
	</div>
`

const OWN_ARGS = ['value', 'change', 'isLoading']

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'valueFormat', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена значения и загрузка в четырёх пресетах движения. «Новое значение» — число плавно доходит до нового',
					'(`useTween`, длительность `--rise-duration-xslow`, замедление к концу) в том же формате `valueFormat`; цвет',
					'изменения меняется за `--rise-duration-fast`. Скринридер читает только итоговое значение — промежуточные числа',
					'скрыты от него. «Загружено» — заглушка гаснет, значение проявляется на её месте (`--rise-duration`,',
					'`--rise-ease-out`), строка изменения проявляется без сдвига раскладки.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`:",
					'значение встаёт сразу; системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseStat', 'BaseSwitch'],
				state,
				script: [
					`const presets = ${literal(presets)}`,
					`const values = ${literal(values)}`,
					`const changes = ${literal(changes)}`,
				].join('\n'),
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseButton, BaseStat, BaseSwitch },
		setup: useStorySetup(args, { state, data: { presets, values, changes }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const shown = () => [...canvasElement.querySelectorAll('.base-stat__content')].map(node => node.textContent?.replace(/\s/g, ' '))

		await userEvent.click(canvas.getByRole('button', { name: 'Новое значение' }))
		await waitFor(() => expect(shown()).toEqual(Array(4).fill('5,31 млн ₽')))
		await userEvent.click(canvas.getByRole('switch', { name: 'Загружено' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-stat[aria-busy="true"]')).toHaveLength(4))
		await userEvent.click(canvas.getByRole('switch', { name: 'Загружено' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-skeleton')).toHaveLength(0))
	},
}

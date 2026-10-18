import type meta from '../../BaseFlowMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { motionPresetsStory } from '@/stories/helpers'
import { expect, waitFor, within } from 'storybook/test'

const directions = ['TB', 'LR', 'RL', 'BT']

const motion = motionPresetsStory({
	item: `
		<BaseFlowMap v-bind="args" :layout="{ direction: directions[step] }" aria-label="Карта %preset%" height="360px" :panels="['toolbar']" />
	`,
	components: { BaseFlowMap, BaseButton },
	imports: ['BaseFlowMap'],
	steps: ['направление LR', 'направление RL', 'направление BT'],
	state: { directions },
	omit: ['layout', 'height', 'panels'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	decorators: [() => ({ template: '<div style="--story-motion-min: 480px;"><story /></div>' })],
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Карта в колонках четырёх пресетов движения; кнопка по шагам меняет направление раскладки `TB` → `LR` → `RL` → `BT`, после последнего шага «Повторить» возвращает `TB`.',
					'Узлы плавно едут на новые места через `transform` за `--rise-duration-slow` по кривой `--rise-ease-emphasized`, а линии перестраиваются вместе с ними; масштаб и сдвиг холста (`fitView`, фокус на узле) идут тем же переходом.',
					'Частицы на связях и токен сценария на `prefers-reduced-motion` не рисуются, в пресете `none` и при «уменьшить движение» узлы сразу встают на конечные места.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const next = canvas.getByRole('button', { name: /^(Следующий шаг|Повторить)/ })
		const [map] = canvas.getAllByRole('region', { name: /^Карта / })
		const spread = () => {
			const web = within(map)
				.getByRole('graphics-object', { name: /^Web, / })
				.getBoundingClientRect()
			const orders = within(map)
				.getByRole('graphics-object', { name: /^Orders, / })
				.getBoundingClientRect()
			return { x: orders.left - web.left, y: orders.top - web.top }
		}
		await waitFor(() => expect(spread().y).toBeGreaterThan(40))
		await userEvent.click(next)
		await waitFor(() => expect(spread().x).toBeGreaterThan(40))
		await userEvent.click(next)
		await waitFor(() => expect(spread().x).toBeLessThan(-40))
		await userEvent.click(next)
		await waitFor(() => expect(spread().y).toBeLessThan(-40))
		await expect(next).toHaveAccessibleName('Повторить')
		await userEvent.click(next)
		await waitFor(() => expect(spread().y).toBeGreaterThan(40))
		await expect(next).toHaveAccessibleName('Следующий шаг: направление LR')
	},
}

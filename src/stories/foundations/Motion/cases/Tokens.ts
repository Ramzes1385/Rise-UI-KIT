import type meta from '../Motion.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'
import { MOTION_TOKEN_VALUE_SOURCE, MOTION_TOKENS, MotionTokenValue } from '../shared'

const state = { tokens: MOTION_TOKENS }

const template = `
	<div class="fnd-motion-scroll" role="region" tabindex="0" aria-label="Токены движения">
		<table class="fnd-motion-table">
			<caption>Токены движения по пресетам</caption>
			<thead>
				<tr>
					<th scope="col">Токен</th>
					<th scope="col">none</th>
					<th scope="col">subtle</th>
					<th scope="col">standard</th>
					<th scope="col">expressive</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="token in tokens" :key="token">
					<th scope="row"><code>{{ token }}</code></th>
					<td data-rise-motion="none"><MotionTokenValue :token="token" /></td>
					<td data-rise-motion="subtle"><MotionTokenValue :token="token" /></td>
					<td data-rise-motion="standard"><MotionTokenValue :token="token" /></td>
					<td data-rise-motion="expressive"><MotionTokenValue :token="token" /></td>
				</tr>
			</tbody>
		</table>
	</div>
`

export const Tokens: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		docs: {
			description: {
				story: [
					'Значения вычислены прямо в ячейках: у каждой ячейки свой `data-rise-motion`, поэтому видно, что пресет',
					'пересчитывает токены в своей области. `--rise-duration-xslow` — графики и первая отрисовка данных,',
					'`--rise-ease-emphasized` — крупное движение панелей, `--rise-motion-stagger` — задержка между элементами.',
					'',
					'```css',
					'.my-panel {',
					'  transition: transform var(--rise-duration-slow) var(--rise-ease-emphasized);',
					'}',
					'```',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: [], state, components: { MotionTokenValue: MOTION_TOKEN_VALUE_SOURCE } }),
		},
	},
	render: args => ({
		components: { MotionTokenValue },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas }) => {
		const cells = canvas.getByRole('row', { name: /--rise-duration-slow/ }).querySelectorAll('td')
		await expect(cells).toHaveLength(4)
		for (const cell of cells) await waitFor(() => expect(cell).toHaveTextContent(/\d+m?s$/))
	},
}

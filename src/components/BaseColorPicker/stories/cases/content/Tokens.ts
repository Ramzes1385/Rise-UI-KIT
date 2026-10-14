import { docsFrame, CENTERED } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import BaseColorPicker from '../../../ui/BaseColorPicker.vue'
import { getKitTokenPalette } from '../../../model/colorPresets'
import { expect, screen, waitFor, within } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { color: 'modelValue' }

const centered = CENTERED

const template = `
	<div :style="centered">
		<BaseColorPicker v-bind="args" v-model="color" />
		<p>Значение: {{ color }}</p>
	</div>
`

export const Tokens: StoryObj<typeof meta> = {
	args: {
		modelValue: 'var(--rise-primary)',
		isPresetsHidden: true,
		isRecentHidden: true,
		palettes: [getKitTokenPalette()],
	},
	parameters: {
		docs: {
			...docsFrame(460),
			description: {
				story: [
					'Значение может быть токеном кита: `modelValue="var(--rise-primary)"`. Образец красится самим токеном и следует за темой страницы,',
					'панель показывает цвет токена в текущей теме («Токен primary: #…»; скринридер читает имя токена без `var(--rise-` и скобки). Палитра `getKitTokenPalette()` — токены кита:',
					'выбор из неё отдаёт в `v-model` строку `var(--rise-…)` как есть, а правка в панели (поле HEX, область, ползунки) заменяет токен обычным цветом.',
					'Переключите тему на панели Storybook: образец и цвет в панели меняются без перезагрузки.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseColorPicker'], models, script: `const centered = ${literal(centered)}` }),
		},
	},
	render: args => ({
		components: { BaseColorPicker },
		setup: useStorySetup(args, { models, data: { centered } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: /primary/ })
		await expect((swatch as HTMLElement).style.backgroundColor).toBe('var(--rise-primary)')
		await userEvent.click(swatch)
		const caption = await screen.findByText(/^Токен primary: #/)
		await waitFor(() => expect(caption).toBeVisible())
		const tokens = within(await screen.findByRole('group', { name: 'Токены кита' }))
		await userEvent.click(tokens.getByRole('button', { name: 'Пресет success' }))
		await waitFor(() => expect(canvas.getByText('Значение: var(--rise-success)')).toBeInTheDocument())
	},
}

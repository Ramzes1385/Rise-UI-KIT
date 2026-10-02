import { defineComponent } from 'vue'
import BaseApp from '../../ui/BaseApp.vue'
import type meta from '../BaseApp.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'
import { useLoadingBar } from '@composables/app/useLoadingBar'

const loadingButtonsTemplate = `
	<div class="story-row">
		<BaseButton variant="outline" @click="loadingBar.start">Начать загрузку</BaseButton>
		<BaseButton variant="outline" @click="loadingBar.finish">Завершить</BaseButton>
		<BaseButton variant="outline" @click="loadingBar.error">Ошибка</BaseButton>
	</div>
`

const loadingButtonsScript = `
const loadingBar = useLoadingBar()
`

const LoadingButtons = defineComponent({
	components: { BaseButton },
	setup() {
		return { loadingBar: useLoadingBar() }
	},
	template: loadingButtonsTemplate,
})

const template = `
	<BaseApp v-bind="args"><LoadingButtons /></BaseApp>
`

export const LoadingBar: StoryObj<typeof meta> = {
	args: { loadingBar: { height: 3 } },
	parameters: {
		docs: {
			description: {
				story: [
					'Полоса загрузки вверху страницы: `useLoadingBar()` — `start`, `finish`, `error`. Пока идёт загрузка,',
					'полоса растёт до 90 %, `finish` заполняет её и убирает, `error` — то же в цвете ошибки.',
					'Для скринридера — `role="progressbar"` без значения (ход оценочный) и с именем «Загрузка страницы»;',
					'шаги роста не объявляются. При `prefers-reduced-motion` полоса неподвижна и видна во всю ширину.',
					'В Controls — `loadingBar`: толщина `height` и имя `label`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseApp'],
				components: {
					LoadingButtons: {
						template: loadingButtonsTemplate,
						imports: ['BaseButton', 'useLoadingBar'],
						script: loadingButtonsScript,
					},
				},
			}),
		},
	},
	render: args => ({
		components: { BaseApp, LoadingButtons },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const start = canvas.getByRole('button', { name: 'Начать загрузку' })
		start.focus()
		await userEvent.keyboard('{Enter}')
		const bar = await screen.findByRole('progressbar', { name: 'Загрузка страницы' })
		await expect(bar).not.toHaveAttribute('aria-valuenow')

		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Завершить' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument())

		await userEvent.click(start)
		await userEvent.click(canvas.getByRole('button', { name: 'Ошибка' }))
		await expect(screen.getByRole('progressbar')).toHaveClass('base-app-loading-bar--error')
		await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument())
	},
}

import { defineComponent, ref } from 'vue'
import BaseApp from '../../../ui/BaseApp.vue'
import type meta from '../../BaseApp.stories'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { useLoadingBar } from '@composables/app/useLoadingBar'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const pages = ['Главная', 'Каталог', 'Отчёты']

const pagesTemplate = `
	<nav class="story-row" aria-label="Разделы">
		<BaseButton
			v-for="page in pages"
			:key="page"
			:variant="page === current ? 'solid' : 'ghost'"
			:aria-current="page === current ? 'page' : undefined"
			@click="open(page)">
			{{ page }}
		</BaseButton>
	</nav>
	<main :aria-busy="loadingBar.isLoading.value">
		<BaseText tag="h3">{{ current }}</BaseText>
	</main>
`

const pagesScript = `
const pages = ${literal(pages)}
const loadingBar = useLoadingBar()
const current = ref('Главная')

function open(page: string): void {
	loadingBar.start()
	setTimeout(() => {
		if (page === 'Отчёты') {
			loadingBar.error()
			return
		}
		current.value = page
		loadingBar.finish()
	}, 600)
}
`

const AppPages = defineComponent({
	components: { BaseButton, BaseText },
	setup() {
		const loadingBar = useLoadingBar()
		const current = ref('Главная')
		const open = (page: string): void => {
			loadingBar.start()
			setTimeout(() => {
				if (page === 'Отчёты') {
					loadingBar.error()
					return
				}
				current.value = page
				loadingBar.finish()
			}, 600)
		}
		return { pages, loadingBar, current, open }
	},
	template: pagesTemplate,
})

const template = `
	<BaseApp><AppPages /></BaseApp>
`

export const RouterLoadingBar: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Переходы между разделами: `start` при переходе, `finish` по готовности, `error` — раздел «Отчёты» не загрузился.',
					'Пока идёт загрузка, у `<main>` стоит `aria-busy`. В приложении с vue-router — охранники роутера,',
					'кит vue-router не импортирует:',
					'',
					'```ts',
					'const loadingBar = useLoadingBar()',
					'router.beforeEach(() => loadingBar.start())',
					'router.afterEach(() => loadingBar.finish())',
					'router.onError(() => loadingBar.error())',
					'```',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseApp'],
				components: {
					AppPages: {
						template: pagesTemplate,
						imports: ['BaseButton', 'BaseText', 'useLoadingBar'],
						vue: ['ref'],
						script: pagesScript,
					},
				},
			}),
		},
	},
	render: args => ({
		components: { BaseApp, AppPages },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const main = canvas.getByRole('main')
		await userEvent.click(canvas.getByRole('button', { name: 'Каталог' }))
		await expect(await screen.findByRole('progressbar', { name: 'Загрузка страницы' })).toBeInTheDocument()
		await expect(main).toHaveAttribute('aria-busy', 'true')

		await expect(await canvas.findByRole('heading', { name: 'Каталог' })).toBeInTheDocument()
		await expect(main).toHaveAttribute('aria-busy', 'false')
		await expect(canvas.getByRole('button', { name: 'Каталог' })).toHaveAttribute('aria-current', 'page')
		await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument())

		await userEvent.click(canvas.getByRole('button', { name: 'Отчёты' }))
		await waitFor(() => expect(screen.getByRole('progressbar')).toHaveClass('base-app-loading-bar--error'))
		await expect(canvas.getByRole('heading', { name: 'Каталог' })).toBeInTheDocument()
	},
}

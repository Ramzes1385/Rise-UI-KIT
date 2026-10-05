import BaseApp from '../../../ui/BaseApp.vue'
import type meta from '../../BaseApp.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useLoadingBar } from '@composables/app/useLoadingBar'
import { motionPresetsStory, storySource, useStorySetup } from '@/stories/helpers'

const LOADING_MS = 1200

const motion = motionPresetsStory({
	item: `
		<div class="story-frame" style="height: 48px; contain: layout;">
			<BaseApp v-bind="args">Полоса загрузки</BaseApp>
		</div>
	`,
	action: 'replay',
	components: { BaseApp, BaseButton },
	imports: ['BaseApp'],
})

const script = `
const loadingBar = useLoadingBar()

function replay(): void {
	loadingBar.start()
	setTimeout(loadingBar.finish, ${LOADING_MS})
}
`

function setupReplay() {
	const loadingBar = useLoadingBar()
	return {
		replay: (): void => {
			loadingBar.start()
			setTimeout(loadingBar.finish, LOADING_MS)
		},
	}
}

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['loadingBar'] },
		docs: {
			description: {
				story: [
					'Полоса загрузки в четырёх пресетах движения: появляется прозрачностью, растёт `transform: scaleX()`, по `finish`',
					'заполняется и гаснет. Длительности — токены движения; в `none` и при «уменьшить движение» полоса неподвижна',
					'и видна во всю ширину. «Повторить» запускает загрузку и завершает её через секунду. Полоса одна на страницу,',
					'поэтому все четыре BaseApp показывают одну загрузку — каждый в своём контейнере (`contain: layout`).',
				].join('\n'),
			},
			source: storySource({ template: motion.template, imports: ['BaseApp', 'BaseButton', 'useLoadingBar'], script }),
		},
	},
	render: args => ({
		components: { BaseApp, BaseButton },
		setup: useStorySetup(args, { setup: setupReplay }),
		template: motion.template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByRole('progressbar')).toHaveLength(4))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-app-loading-bar')).toHaveLength(0), { timeout: 4000 })
	},
}

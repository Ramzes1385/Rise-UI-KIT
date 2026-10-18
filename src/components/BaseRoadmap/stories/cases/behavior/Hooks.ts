import { defineComponent, ref } from 'vue'
import { BaseApp } from '@components/BaseApp'
import type meta from '../../BaseRoadmap.stories'
import { useConfirm } from '@components/BaseConfirm'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { miniProgress, miniRoadmap } from '../../demo/mini'
import { expect, screen, waitFor, within } from 'storybook/test'
import type { RoadmapStatusChange } from '../../../types/BaseRoadmap.types'
import { docsFrame, literal, staticStorySource, useStorySetup, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

const roadmapTemplate = `
	<div class="story-stack">
		<BaseRoadmap
			:data="data"
			:progress="progress"
			layout="list"
			:expanded="['basics']"
			:before-status-change="confirmDone"
			@status-change="onStatusChange" />
		<p class="story-label" role="status">{{ log }}</p>
	</div>
`

const roadmapScript = `
const data = ${literal(miniRoadmap)}
const progress = ${literal(miniProgress)}
const confirm = useConfirm()
const log = ref('Изменений пока нет')

function onStatusChange({ topic, from, to }: RoadmapStatusChange): void {
	log.value = \`\${topic.title}: \${from} → \${to}\`
}

async function confirmDone({ topic, to }: RoadmapStatusChange): Promise<boolean> {
	if (to !== 'done') return true
	return confirm({
		title: \`Отметить «\${topic.title}» изученной?\`,
		description: 'Тема появится в сводке прогресса как пройденная.',
		confirmLabel: 'Отметить',
	})
}
`

const RoadmapWithConfirm = defineComponent({
	components: { BaseRoadmap },
	setup() {
		const confirm = useConfirm()
		const log = ref('Изменений пока нет')
		const confirmDone = async ({ topic, to }: RoadmapStatusChange): Promise<boolean> => {
			if (to !== 'done') return true
			return confirm({
				title: `Отметить «${topic.title}» изученной?`,
				description: 'Тема появится в сводке прогресса как пройденная.',
				confirmLabel: 'Отметить',
			})
		}
		const onStatusChange = ({ topic, from, to }: RoadmapStatusChange): void => {
			log.value = `${topic.title}: ${from} → ${to}`
		}
		return { data: miniRoadmap, progress: miniProgress, log, confirmDone, onStatusChange }
	},
	template: roadmapTemplate,
})

const template = `
	<BaseApp><RoadmapWithConfirm /></BaseApp>
`

export const Hooks: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			...docsFrame(760),
			description: {
				story: [
					'Хук `beforeStatusChange({ topic, from, to, source })` вызывается перед каждой сменой статуса: отметкой, подтемой, методом ref',
					'и загрузкой из хранилища (`source`). `false` отменяет смену, `Promise` ждётся — пока он не завершился, тема помечена `aria-busy`.',
					'Здесь хук спрашивает подтверждение через `useConfirm()` (BaseConfirm), когда тема станет изученной. Результат смены',
					'приходит в событие `status-change`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseApp'],
				components: {
					RoadmapWithConfirm: {
						template: roadmapTemplate,
						imports: ['BaseRoadmap', 'useConfirm', 'type RoadmapStatusChange'],
						vue: ['ref'],
						script: roadmapScript,
					},
				},
			}),
		},
	},
	render: args => ({
		components: { BaseApp, RoadmapWithConfirm },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(await canvas.findByRole('button', { name: /^Реактивность/ }))
		await userEvent.click(await screen.findByRole('button', { name: 'Отметить изученной' }))
		const dialog = await screen.findByRole('alertdialog', { name: 'Отметить «Реактивность» изученной?' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
		await expect(canvas.getByText('Изменений пока нет')).toBeVisible()

		await userEvent.click(await screen.findByRole('button', { name: 'Отметить изученной' }))
		await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Отметить' }))
		await expect(await canvas.findByText('Реактивность: in-progress → done')).toBeVisible()
		await waitFor(() => expect(screen.getByRole('button', { name: 'Вернуть в работу' })).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
	},
}

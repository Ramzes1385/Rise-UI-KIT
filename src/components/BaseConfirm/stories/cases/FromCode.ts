import { defineComponent, ref } from 'vue'
import { useConfirm } from '../../useConfirm'
import { BaseApp } from '@components/BaseApp'
import type meta from '../BaseConfirm.stories'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, expect } from 'storybook/test'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const deleteButtonTemplate = `
	<div class="story-row">
		<BaseButton variant="outline" @click="remove">Удалить проект</BaseButton>
		<BaseText tag="span" role="status">{{ status }}</BaseText>
	</div>
`

const deleteButtonScript = `
const confirm = useConfirm()
const status = ref('Проект на месте')

async function remove(): Promise<void> {
	const isConfirmed = await confirm({
		title: 'Удалить проект «Сайт студии»?',
		description: 'Проект, 48 файлов и история правок удалятся без возможности восстановления.',
		confirmLabel: 'Удалить',
		isDanger: true,
	})
	status.value = isConfirmed ? 'Проект удалён' : 'Удаление отменено'
}
`

const DeleteProjectButton = defineComponent({
	components: { BaseButton, BaseText },
	setup() {
		const confirm = useConfirm()
		const status = ref('Проект на месте')
		const remove = async (): Promise<void> => {
			const isConfirmed = await confirm({
				title: 'Удалить проект «Сайт студии»?',
				description: 'Проект, 48 файлов и история правок удалятся без возможности восстановления.',
				confirmLabel: 'Удалить',
				isDanger: true,
			})
			status.value = isConfirmed ? 'Проект удалён' : 'Удаление отменено'
		}
		return { remove, status }
	},
	template: deleteButtonTemplate,
})

const template = `
	<BaseApp><DeleteProjectButton /></BaseApp>
`

export const FromCode: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Вызов из кода: `useConfirm()` открывает окно через ближайший `<BaseApp>` и возвращает промис с ответом.',
					'Шаблон окна в компоненте не нужен.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseApp'],
				components: {
					DeleteProjectButton: {
						template: deleteButtonTemplate,
						imports: ['BaseButton', 'BaseText', 'useConfirm'],
						vue: ['ref'],
						script: deleteButtonScript,
					},
				},
			}),
		},
	},
	render: args => ({
		components: { BaseApp, DeleteProjectButton },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить проект' }))
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить проект «Сайт студии»?' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }))
		await expect(await canvas.findByText('Удаление отменено')).toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Удалить проект' }))
		await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Удалить' }))
		await expect(await canvas.findByText('Проект удалён')).toBeInTheDocument()
	},
}

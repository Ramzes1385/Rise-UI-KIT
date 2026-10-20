import { visible } from '../edit/editShared'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup, STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import { proposalCard, reviewArgs, reviewControls, reviewImports, reviewModels, reviewTemplate, reviewTypes } from './reviewShared'

export const Review: StoryObj<typeof meta> = {
	parameters: {
		controls: reviewControls,
		docs: {
			description: {
				story: [
					'Режим «Правки» (мокап FlowReview): `mode: "review"` оставляет путь в просмотре, а справа открывает панель с вкладками',
					'«Предложения N» и «Комментарии N». Данные приходят пропом `review` и возвращаются через `v-model:review`:',
					'`proposals` — предложения, `threads` — цепочки комментариев к этапам и темам, `currentUser` — автор новых комментариев.',
					'- **Предложение** — набор изменений, который автор отправил вместо применения (`ref.propose(changes)`). Карточка: автор,',
					'  вид правки (добавление, переименование, перемещение…), сводка «+1 тема», строки «было → стало», «Принять» и «Отклонить».',
					'- **«Принять»** применяет все изменения к `data` одним шагом истории и объявляется в live-регионе; «Принять все: N» берёт',
					'  только применимые. «Отклонить» ничего не меняет в данных.',
					'- **Устаревшее** предложение (путь ушёл от версии автора) помечено «устарело», «Принять» у него неактивна, причина',
					'  связана с кнопкой через `aria-describedby` — см. `ReviewStale`.',
					'- **Комментарии**: поле появляется, когда выбрана тема; цепочку можно раскрыть, ответить, «Показать» её элемент и',
					'  отметить «Решено»; переключатель «Показывать решённые» (по умолчанию включён) скрывает решённые цепочки.',
				].join('\n'),
			},
			source: storySource({ template: reviewTemplate, imports: reviewImports, models: reviewModels, types: reviewTypes }),
		},
	},
	args: reviewArgs,
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: reviewModels, slots: [] }),
		template: reviewTemplate,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const panel = within(await canvas.findByRole('region', { name: 'Правки' }, { timeout: STORY_WAIT_TIMEOUT }))
		const area = within(canvasElement.querySelector('.base-roadmap__area') as HTMLElement)
		const proposalsTab = panel.getByRole('tab', { name: /^Предложения/ })
		await expect(proposalsTab).toHaveTextContent('Предложения 4')
		await expect(proposalsTab).toHaveAttribute('aria-selected', 'true')
		await expect(panel.getByRole('button', { name: 'Принять все: 3' })).toBeVisible()
		await expect(panel.getAllByRole('button', { name: 'Принять' })).toHaveLength(4)

		const rename = within(proposalCard(canvasElement, 'Переименовать'))
		await expect(rename.getByText('Маршруты')).toBeVisible()
		await expect(rename.getByText('Vue Router')).toBeVisible()
		await expect(rename.getByText('→')).toBeVisible()
		const stale = within(proposalCard(canvasElement, 'Увеличить оценку'))
		await expect(stale.getByText('устарело')).toBeVisible()
		await expect(stale.getByRole('button', { name: 'Принять' })).toHaveAttribute('aria-disabled', 'true')
		await expect(stale.getByRole('button', { name: 'Принять' })).toHaveAccessibleDescription(/принять нельзя/)

		await userEvent.click(within(proposalCard(canvasElement, 'Переименовать')).getByRole('button', { name: 'Принять' }))
		await visible(() => area.getByRole('button', { name: /^Vue Router/ }))
		await waitFor(() => expect(proposalCard(canvasElement, 'Переименовать')).toHaveTextContent('Принято'))
		await expect(panel.getByRole('button', { name: 'Принять все: 2' })).toBeVisible()
		await expect(proposalsTab).toHaveTextContent('Предложения 3')

		await userEvent.click(panel.getByRole('radio', { name: 'Только мои' }))
		await expect(await panel.findByText('Предложений пока нет')).toBeVisible()
		await userEvent.click(panel.getByRole('radio', { name: 'Всё' }))
		await expect(await panel.findByText('Увеличить оценку «Общего состояния» до 8 ч')).toBeVisible()

		await userEvent.click(within(proposalCard(canvasElement, 'Поднять')).getByRole('button', { name: 'Отклонить' }))
		await waitFor(() => expect(proposalCard(canvasElement, 'Поднять')).toHaveTextContent('Отклонено'))
		await expect(proposalsTab).toHaveTextContent('Предложения 2')
		await expect(panel.getByRole('button', { name: 'Принять все: 1' })).toBeVisible()

		await userEvent.click(panel.getByRole('button', { name: 'Принять все: 1' }))
		await visible(() => area.getByRole('button', { name: /^Тестирование/ }))
		await waitFor(() => expect(panel.queryByRole('button', { name: /^Принять все/ })).toBeNull())
		await expect(stale.getByRole('button', { name: 'Принять' })).toHaveAttribute('aria-disabled', 'true')

		await userEvent.click(area.getByRole('button', { name: /^Шаблоны/ }))
		const commentsTab = panel.getByRole('tab', { name: /^Комментарии/ })
		await userEvent.click(commentsTab)
		await expect(commentsTab).toHaveTextContent('Комментарии 3')
		const composer = await panel.findByRole('textbox', { name: 'Комментарий к «Шаблоны»' })
		await userEvent.type(composer, 'Добавьте пример с v-for')
		await userEvent.click(panel.getByRole('button', { name: 'Отправить' }))
		await waitFor(() => expect(commentsTab).toHaveTextContent('Комментарии 4'))
		await expect(panel.getAllByText('Добавьте пример с v-for').length).toBeGreaterThan(0)

		await userEvent.click(panel.getByRole('button', { name: 'Реактивность' }))
		await expect(await panel.findByText('Согласен, вынесу в подтему.')).toBeVisible()
		const thread = panel.getByRole('button', { name: 'Реактивность' }).closest('li') as HTMLElement
		await userEvent.click(within(thread).getByRole('button', { name: 'Решено' }))
		await expect(await within(thread).findByRole('button', { name: 'Вернуть' })).toBeVisible()

		const resolvedSwitch = panel.getByRole('switch', { name: 'Показывать решённые' })
		await expect(resolvedSwitch).toBeChecked()
		await userEvent.click(resolvedSwitch)
		await waitFor(() => expect(panel.queryByRole('button', { name: 'Реактивность' })).toBeNull())
		await expect(panel.getByRole('button', { name: 'Приложение' })).toBeVisible()
		await userEvent.click(resolvedSwitch)
		await expect(await panel.findByRole('button', { name: 'Реактивность' })).toBeVisible()
	},
}

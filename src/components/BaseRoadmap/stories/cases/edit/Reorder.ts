import { ref } from 'vue'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, waitFor, within } from 'storybook/test'
import type { RoadmapReorder } from '../../../types/BaseRoadmap.types'
import { storySource, useStorySetup, STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import {
	editAnnouncement,
	editArgs,
	editControls,
	editImports,
	editModels,
	editTypes,
	expectStatus,
	stageOrder,
	topicOrder,
} from './editShared'

const template = `
	<div class="story-stack">
		<BaseRoadmap
			v-bind="args"
			v-model:data="data"
			v-model:mode="mode"
			@reorder="onReorder" />
		<p class="story-label" role="status">{{ log }}</p>
	</div>
`

const script = `
const log = ref('Перестановок пока нет')

function onReorder({ entity, id, from, to }: RoadmapReorder): void {
	log.value = \`\${entity === 'stage' ? 'Этап' : 'Тема'} «\${id}»: место \${from.index + 1} → \${to.index + 1}\`
}
`

const setup = () => {
	const log = ref('Перестановок пока нет')
	const onReorder = ({ entity, id, from, to }: RoadmapReorder): void => {
		log.value = `${entity === 'stage' ? 'Этап' : 'Тема'} «${id}»: место ${from.index + 1} → ${to.index + 1}`
	}
	return { log, onReorder }
}

async function drag(handle: HTMLElement, target: HTMLElement): Promise<void> {
	const center = (element: HTMLElement) => {
		element.scrollIntoView({ block: 'center' })
		const rect = element.getBoundingClientRect()
		return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }
	}
	const options = (point: { clientX: number; clientY: number }): PointerEventInit => ({
		...point,
		bubbles: true,
		button: 0,
		pointerId: 1,
		pointerType: 'mouse',
	})
	handle.dispatchEvent(new PointerEvent('pointerdown', options(center(handle))))
	const aim = center(target)
	window.dispatchEvent(new PointerEvent('pointermove', options(aim)))
	await new Promise(resolve => setTimeout(resolve, 500))
	window.dispatchEvent(new PointerEvent('pointerup', options(aim)))
}

export const Reorder: StoryObj<typeof meta> = {
	parameters: {
		controls: editControls,
		docs: {
			description: {
				story: [
					'Перестановка в режиме «Правка» тремя способами; у всех один результат — шаг истории и событие `reorder`.',
					'- **Мышью.** Ручка «⋮⋮» у этапа и темы: сдвиг больше 5 px берёт элемент, «призрак» идёт за курсором, место переноса приглушено,',
					'  Escape отменяет. Тему можно бросить на другой этап.',
					'- **Alt+↑ / Alt+↓** на ручке (и кнопки «Выше» и «Ниже» панели элемента) — на место выше или ниже без захвата.',
					'- **Пробел, стрелки, пробел** — альтернатива перетаскиванию по WCAG 2.5.7: пробел берёт, стрелки двигают, пробел или Enter кладут,',
					'  Escape возвращает на место. Каждый шаг объявляется в live-регионе: «Тема «Шаблоны»: этап «Основы», место 2 из 3».',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [...editImports, 'type RoadmapReorder'],
				models: editModels,
				types: editTypes,
				script,
				vue: ['ref'],
			}),
		},
	},
	args: editArgs,
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: editModels, slots: [], setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(await canvas.findByRole('toolbar', { name: 'Инструменты правки' })).toBeVisible()
		await expect(topicOrder(canvasElement)).toEqual(['template', 'reactivity', 'components', 'router', 'store'])

		const handle = canvas.getByRole('button', { name: 'Перетащить тему «Шаблоны»' })
		handle.focus()
		await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
		await waitFor(() => expect(topicOrder(canvasElement)).toEqual(['reactivity', 'template', 'components', 'router', 'store']))
		await waitFor(() => expect(editAnnouncement(canvasElement)).toContain('место 2 из 3'))
		await expectStatus(canvasElement, /Изменений 1/)
		await expect(canvas.getByText('Тема «template»: место 1 → 2')).toBeVisible()
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Перетащить тему «Шаблоны»' })).toHaveFocus())

		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('button', { name: 'Перетащить тему «Шаблоны»' })).toHaveAttribute('aria-pressed', 'true')
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(topicOrder(canvasElement).slice(0, 3)).toEqual(['reactivity', 'components', 'template']))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(topicOrder(canvasElement).slice(0, 3)).toEqual(['reactivity', 'template', 'components']))
		await expectStatus(canvasElement, /Изменений 1/)

		await userEvent.keyboard(' ')
		await userEvent.keyboard('{ArrowUp}')
		await userEvent.keyboard(' ')
		await waitFor(() => expect(topicOrder(canvasElement).slice(0, 3)).toEqual(['template', 'reactivity', 'components']))
		await expectStatus(canvasElement, /Изменений 2/)

		await drag(
			canvas.getByRole('button', { name: 'Перетащить этап «Приложение»' }),
			canvasElement.querySelector('[data-roadmap-stage="basics"] .base-roadmap__edit-stage-head') as HTMLElement,
		)
		await waitFor(() => expect(stageOrder(canvasElement)).toEqual(['app', 'basics']), { timeout: STORY_WAIT_TIMEOUT })
		await expect(await canvas.findByText('Этап «app»: место 2 → 1')).toBeVisible()
		await expectStatus(canvasElement, /Изменений 3/)

		await drag(
			canvas.getByRole('button', { name: 'Перетащить тему «Маршруты»' }),
			canvasElement.querySelector('[data-roadmap-topic="components"]') as HTMLElement,
		)
		await waitFor(() => expect(topicOrder(canvasElement)).toContain('router'), { timeout: STORY_WAIT_TIMEOUT })
		await waitFor(
			() =>
				expect(
					within(canvasElement.querySelector('[data-roadmap-stage="basics"]') as HTMLElement).getByText('Маршруты'),
				).toBeVisible(),
			{ timeout: STORY_WAIT_TIMEOUT },
		)
		await expectStatus(canvasElement, /Изменений 4/)
	},
}

import { setup } from './Basic.setup'
import type meta from '../useSortable.stories'
import setupSource from './Basic.setup.ts?raw'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="cmp-demo cmp-sortable">
		<ul ref="root" class="cmp-sortable__list" aria-label="Этапы проекта">
			<li
				v-for="step in shown"
				:key="step.id"
				class="cmp-sortable__item"
				:class="{
					'cmp-sortable__item--grabbed': step.id === grabbedId,
					'cmp-sortable__item--placeholder': drag?.item.id === step.id,
				}"
				:data-step-id="step.id"
				tabindex="0"
				aria-describedby="sortable-hint"
				@keydown="handleKeydown($event, step)"
				@pointerdown="handlePointerDown($event, step)"
				@click="handleClick(step)">
				{{ step.title }}
			</li>
		</ul>
		<p id="sortable-hint" class="cmp-sortable__hint">Space — взять, стрелки — переместить, Space — положить, Escape — отменить</p>
		<p role="status" class="cmp-sortable__hint">{{ message }}</p>
		<div v-if="drag" ref="ghostRef" class="cmp-sortable__ghost" :style="ghostStyle" aria-hidden="true">{{ drag.item.title }}</div>
	</div>
`

const pointer = (type: string, x: number, y: number): PointerEvent =>
	new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0, pointerType: 'mouse' })

const titles = (list: HTMLElement): string[] => [...list.querySelectorAll('li')].map(item => item.textContent?.trim() ?? '')

export const Basic: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Свой сортируемый список на `useSortable`: место — индекс, черновик порядка — `draft`, объявления — в',
					'`role="status"`. Пробел берёт этап, ↑/↓ двигают, пробел кладёт, Escape отменяет; мышью — перетаскивание',
					'за этап. Разметка и стили — приложения: composable даёт только поведение.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: [],
				vue: ['computed', 'nextTick', 'ref', 'useTemplateRef'],
				importsFrom: { '@ramzes1385/rise-ui-kit/composables': ['type SortableAnnouncement', 'type SortablePoint', 'useSortable'] },
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const list = canvas.getByRole('list', { name: 'Этапы проекта' })
		const status = canvas.getByRole('status')
		await userEvent.tab()
		await userEvent.keyboard(' ')
		await waitFor(() => expect(status).toHaveTextContent('«Бриф» взят, место 1 из 4'))
		await userEvent.keyboard('{ArrowDown}')
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(status).toHaveTextContent('место 3 из 4'))
		await userEvent.keyboard(' ')
		await waitFor(() => expect(status).toHaveTextContent('«Бриф» на месте 3 из 4'))
		await expect(titles(list)).toEqual(['Дизайн', 'Код', 'Бриф', 'Выпуск'])
		await expect(canvas.getByText('Бриф')).toHaveFocus()

		await userEvent.keyboard(' ')
		await userEvent.keyboard('{ArrowUp}')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(status).toHaveTextContent('Отменено, «Бриф» на прежнем месте'))
		await expect(titles(list)).toEqual(['Дизайн', 'Код', 'Бриф', 'Выпуск'])

		const item = canvas.getByText('Выпуск')
		const from = item.getBoundingClientRect()
		const target = canvas.getByText('Код').getBoundingClientRect()
		item.dispatchEvent(pointer('pointerdown', from.left + 20, from.top + 10))
		window.dispatchEvent(pointer('pointermove', from.left + 20, from.top - 10))
		await waitFor(() => {
			window.dispatchEvent(pointer('pointermove', target.left + 20, target.top + 5))
			expect(titles(list)).toEqual(['Дизайн', 'Выпуск', 'Код', 'Бриф'])
		})
		window.dispatchEvent(pointer('pointerup', target.left + 20, target.top + 5))
		await waitFor(() => expect(status).toHaveTextContent('«Выпуск» на месте 2 из 4'))
	},
}

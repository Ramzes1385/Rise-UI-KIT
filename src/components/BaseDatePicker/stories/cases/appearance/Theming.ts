import { findPanel } from '../../shared'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDatePicker from '../../../ui/BaseDatePicker.vue'
import { expect, waitFor, within, screen } from 'storybook/test'
import { literal, storyDate, storySource, useStorySetup } from '@/stories/helpers'

const ui = { wrapper: 'story-themed-wrapper', 'icon-btn': 'story-themed-icon', panel: 'story-themed-panel', header: 'story-themed-header' }

const state = { plain: storyDate(0, 0, 0), themed: storyDate(0, 0, 0), classed: storyDate(0, 0, 0) }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseDatePicker v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-input-bg: var(--rise-bg-muted); --rise-input-border: var(--rise-primary-border); --rise-input-radius: var(--rise-radius-full); --rise-date-picker-icon-text: var(--rise-primary); --rise-date-picker-icon-text-hover: var(--rise-primary-text);">
			<BaseDatePicker v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseDatePicker v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { isMultiMonth: false },
	parameters: {
		controls: { include: ['inputVariant', 'calendarVariant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-date-picker-*` кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Рамку и фон поля рисует BaseInput — для них действуют `--rise-input-*`; свои токены поля — кнопки справа: `icon-text`,',
					'`icon-text-hover`. Панель: `panel-bg`, `panel-text`, `panel-border`, `panel-radius`, `panel-shadow`, `panel-padding`,',
					'`panel-gap`; год в шапке — `title-text`, `title-font-weight`. Панель открывается в слое страницы (`teleport`), поэтому её',
					'токены задавайте на `:root` или в теме, а не на контейнере поля. Сетку дней рисует BaseCalendar — у него свои токены.',
					'Проп `ui` добавляет классы к частям поля и панели (`root`, `wrapper`, `icon-btn`, `panel`, `header`, `nav-btn`, `calendar`…).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDatePicker'],
				script: `const ui = ${literal(ui)}`,
				state,
				types: { plain: 'Date | null', themed: 'Date | null', classed: 'Date | null' },
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseDatePicker },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-input__wrapper')]
		const [plainIcon, themedIcon, classedIcon] = canvas.getAllByRole('button', { name: 'Открыть календарь' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themedIcon).color).not.toBe(getComputedStyle(plainIcon).color)
		await expect(classed).toHaveClass('base-input__wrapper', 'story-themed-wrapper')
		await expect(classedIcon).toHaveClass('base-date-picker__icon-btn', 'story-themed-icon')

		await userEvent.click(classedIcon)
		const panel = await findPanel()
		await expect(panel).toHaveClass('date-picker-panel', 'base-date-picker__panel', 'story-themed-panel')
		await expect(panel.querySelector('.date-picker-panel__header')).toHaveClass('story-themed-header')
		await expect(within(panel).getAllByRole('button', { name: /месяц|год/ })).toHaveLength(4)
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

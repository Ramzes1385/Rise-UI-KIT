import { CENTERED, docsFrame } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import { expect, screen, waitFor } from 'storybook/test'
import BaseColorPicker from '../../../ui/BaseColorPicker.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { swatch: 'story-themed-swatch', marker: 'story-themed-marker', preset: 'story-themed-preset' }

const state = { plain: '#f97316', themed: '#3b82f6', classed: '#22c55e' }

const centered = CENTERED

const template = `
	<div class="story-row" :style="centered">
		<div class="story-col" style="align-items: center; gap: 6px;">
			<BaseColorPicker v-bind="args" v-model="plain" aria-label="По умолчанию" />
			<span class="story-label">По умолчанию</span>
		</div>
		<div class="story-col" style="align-items: center; gap: 6px; --rise-color-picker-border: var(--rise-primary-border); --rise-color-picker-radius: var(--rise-radius-full); --rise-color-picker-bg: var(--rise-bg-muted);">
			<BaseColorPicker v-bind="args" v-model="themed" aria-label="Токены на контейнере" />
			<span class="story-label">Токены на контейнере</span>
		</div>
		<div class="story-col" style="align-items: center; gap: 6px;">
			<BaseColorPicker v-bind="args" v-model="classed" aria-label="Классы через ui" :ui="ui" />
			<span class="story-label">Классы через ui</span>
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'hasAlpha'] },
		docs: {
			...docsFrame(460),
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-color-picker-*` кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Образец и поля HEX / RGB / HSL: `border`, `radius` (у полей без своих — общие `--rise-input-*`), поля — ещё `bg`,',
					'`border-focus`. Панель: `panel-bg`, `panel-shadow`, `panel-radius`, `panel-padding` (по умолчанию — отступ поверхности',
					'с учётом плотности). Образцы цветов: `preset-radius`, `preset-ring-selected` — цвет кольца выбранного. Маркер области',
					'и бегунки шкал: `thumb-border` — цвет обводки, `thumb-shadow`. Панель открывается в `body` (или в цель телепорта',
					'приложения), поэтому токены панели задавайте на `:root` или в теме — токены контейнера до неё не доходят.',
					'Цвета шкал тона и прозрачности и шахматка прозрачности — часть самого выбора цвета, токенов у них нет.',
					'Проп `ui` добавляет классы к частям образца и панели (`root`, `swatch`, `panel`, `area`, `marker`, `thumb`, `preset`…).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseColorPicker'],
				script: [`const ui = ${literal(ui)}`, `const centered = ${literal(centered)}`].join('\n'),
				state,
				types: { plain: 'string', themed: 'string', classed: 'string' },
				omit: ['modelValue', 'ariaLabel', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseColorPicker },
		setup: useStorySetup(args, { state, data: { ui, centered }, slots: ['modelValue', 'ariaLabel', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const plain = canvas.getByRole('button', { name: /По умолчанию/ })
		const themed = canvas.getByRole('button', { name: /Токены на контейнере/ })
		const classed = canvas.getByRole('button', { name: /Классы через ui/ })

		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(classed).toHaveClass('base-color-picker__swatch', 'story-themed-swatch')

		await userEvent.click(classed)
		await waitFor(() =>
			expect(screen.getByRole('dialog').querySelector('.base-color-picker__marker')).toHaveClass('story-themed-marker'),
		)
		await expect(screen.getByRole('button', { name: 'Пресет #22c55e' })).toHaveClass('base-color-picker__preset', 'story-themed-preset')
		await userEvent.keyboard('{Escape}')
	},
}

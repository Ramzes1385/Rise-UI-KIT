import { expect } from 'storybook/test'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource } from '@/stories/helpers'
import { DEMO_STEPS, type WizardCaseOptions, wizardRender, wizardSource } from '../../shared'

const ui = { root: 'story-themed-wizard', title: 'story-themed-title' }

const template = `
	<div class="story-stack">
		<BaseFormWizard v-bind="args" variant="outline" :steps="steps" />
		<div style="--rise-form-wizard-bg: var(--rise-primary-soft); --rise-form-wizard-text: var(--rise-primary-text); --rise-form-wizard-title-text: var(--rise-primary-text); --rise-form-wizard-radius: var(--rise-radius-2xl); --rise-form-wizard-padding-y: 28px; --rise-form-wizard-title-font-size: var(--rise-font-size-xl);">
			<BaseFormWizard v-bind="args" variant="outline" :steps="steps" />
		</div>
		<BaseFormWizard v-bind="args" variant="outline" :steps="steps" :ui="ui" />
	</div>
`

const options: WizardCaseOptions = {
	template,
	script: `const steps = ${literal(DEMO_STEPS)}\nconst ui = ${literal(ui)}`,
	data: { steps: DEMO_STEPS, ui },
}
const source = storySource(wizardSource(options))

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-form-wizard-*` кит только читает: `bg`, `text`, `border`, `radius`, `shadow`, `gap`,',
					'`padding-x`, `padding-y`, `title-font-size`, `title-text` — задайте их на `:root`, в теме или на контейнере, как во втором примере.',
					'Отступы умножаются на плотность темы `--rise-density`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`header`, `content`, `title`, `description`, `error`, `actions`, `back`, `skip`, `next`);',
					'глобально — `defaults.BaseFormWizard.ui` плагина. Степпер и кнопки внутри перекрашиваются своими токенами.',
				].join('\n'),
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-form-wizard')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('28px')
		await expect(classed).toHaveClass('base-form-wizard', 'story-themed-wizard')
		await expect(classed.querySelector('.base-form-wizard__title')).toHaveClass('story-themed-title')
	},
}

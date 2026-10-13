import { expect } from 'storybook/test'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource } from '@/stories/helpers'
import { type WizardCaseOptions, wizardRender, wizardSource } from '../../shared'

const STEPS = [
	{
		id: 'company',
		title: 'Сведения об организации и её юридическом адресе',
		description: 'Полное наименование так, как оно указано в уставе, без сокращений',
	},
	{ id: 'bank', title: 'Банковские реквизиты для расчётов', isOptional: true },
	{ id: 'documents', title: 'Загрузка учредительных документов и доверенностей' },
	{ id: 'contacts', title: 'Контактные лица и порядок согласования' },
	{ id: 'tariff', title: 'Выбор тарифа и дополнительных услуг' },
	{ id: 'confirm', title: 'Проверка данных и подтверждение заявки' },
]

const template = `
	<div class="story-narrow">
		<BaseFormWizard v-bind="args" :steps="steps">
			<template #default="{ step }">
				<p>Что нужно заполнить на шаге «{{ step.title }}»: укажите данные так, как они записаны в документах. Длинные слова вроде Благовещенскийгосударственныйуниверситет переносятся, а не выходят за границы мастера.</p>
			</template>
		</BaseFormWizard>
	</div>
`

const options: WizardCaseOptions = { template, script: `const steps = ${literal(STEPS)}`, data: { steps: STEPS } }
const source = storySource(wizardSource(options))

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Шесть шагов с длинными названиями в узком контейнере: степпер прокручивается по горизонтали, текущий шаг прокручивается в видимую область,',
					'заголовок и описание шага переносятся по словам, содержимое не выходит за границы мастера.',
				].join('\n'),
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvas, canvasElement }) => {
		const root = canvasElement.querySelector('.base-form-wizard') as HTMLElement
		await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
		await expect(canvas.getByRole('heading', { name: STEPS[0].title })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Далее' })).toBeVisible()
	},
}

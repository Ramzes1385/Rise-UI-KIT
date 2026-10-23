import type meta from '../../BaseAffix.stories'
import { BaseLink } from '@components/BaseLink'
import { expect, waitFor } from 'storybook/test'
import BaseAffix from '../../../ui/BaseAffix.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div id="story-affix-container" tabindex="0" role="region" aria-label="Прокручиваемая документация" style="height: 280px; overflow: auto; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
		<div style="padding: 20px 16px; border-bottom: 1px solid var(--rise-border)">Документация</div>
		<div style="display: grid; grid-template-columns: 160px 1fr; gap: 16px; padding: 16px; align-items: start">
			<BaseAffix v-bind="args" :offset-top="8" target="#story-affix-container">
				<nav aria-label="Содержание" style="display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">
					<BaseLink href="#intro" label="Введение" />
					<BaseLink href="#install" label="Установка" />
					<BaseLink href="#usage" label="Использование" />
				</nav>
			</BaseAffix>
			<div>
				<p v-for="n in 12" :key="n" style="margin: 0 0 12px">Раздел {{ n }}. Текст документации прокручивается, а содержание слева остаётся на виду.</p>
			</div>
		</div>
	</div>
`

export const InContainer: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['offsetTop', 'hasShadow', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Прокручиваемый контейнер: область с `overflow: auto` и фиксированной высотой, `target` — селектор этой области. Содержание в боковой колонке',
					'прилипает к верху области и остаётся на виду, пока прокручивается текст. Блок прилипает в пределах своей колонки (`align-items: start`),',
					'поэтому колонка должна быть выше самого блока.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAffix', 'BaseLink'], omit: ['offsetTop', 'target'] }),
		},
	},
	render: args => ({
		components: { BaseAffix, BaseLink },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement, args }) => {
		const container = canvasElement.querySelector('#story-affix-container') as HTMLElement
		const affix = canvasElement.querySelector('.base-affix') as HTMLElement
		await expect(affix).not.toHaveClass('base-affix--fixed')

		container.scrollTop = 150
		await waitFor(() => expect(affix).toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true))
		const expectedTop = container.getBoundingClientRect().top + container.clientTop + 8
		await expect(Math.abs(affix.getBoundingClientRect().top - expectedTop)).toBeLessThan(1.5)

		container.scrollTop = 0
		await waitFor(() => expect(affix).not.toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(false))
	},
}

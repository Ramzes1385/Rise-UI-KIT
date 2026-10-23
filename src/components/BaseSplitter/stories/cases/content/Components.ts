import { BaseCard } from '@components/BaseCard'
import { BaseForm } from '@components/BaseForm'
import { BaseInput } from '@components/BaseInput'
import { BaseTable } from '@components/BaseTable'
import type meta from '../../BaseSplitter.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { checkSplitterDrag, checkSplitterKeyboard } from '../../play'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const columns = [
	{ key: 'number', label: '№', width: '64px' },
	{ key: 'client', label: 'Клиент' },
	{ key: 'sum', label: 'Сумма', align: 'right' },
]

const rows = [
	{ id: 1, data: { number: '1048', client: 'ООО «Север»', sum: '42 000 ₽' } },
	{ id: 2, data: { number: '1049', client: 'ИП Громов', sum: '18 500 ₽' } },
	{ id: 3, data: { number: '1050', client: 'ООО «Ладога»', sum: '96 300 ₽' } },
	{ id: 4, data: { number: '1051', client: 'АО «Вектор»', sum: '7 900 ₽' } },
]

const state = { size: 55, client: 'ООО «Север»', sum: '42 000' }

const template = `
	<div style="height: 360px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-model="size" label="Таблица заказов" :min="30" :max="75">
			<template #start>
				<BaseTable :columns="columns" :rows="rows" />
			</template>
			<template #end>
				<div style="padding: 12px">
					<BaseCard title="Новый заказ" subtitle="Заполните поля и отправьте форму">
						<BaseForm aria-label="Новый заказ">
							<div style="display: grid; gap: 12px">
								<BaseInput v-model="client" label="Клиент" />
								<BaseInput v-model="sum" label="Сумма, ₽" />
								<BaseButton type="submit">Создать заказ</BaseButton>
							</div>
						</BaseForm>
					</BaseCard>
				</div>
			</template>
		</BaseSplitter>
	</div>
`

export const Components: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Другие компоненты кита в панелях: слева таблица заказов, справа карточка с формой. Панели прокручиваются сами,',
					'поэтому широкая таблица не ломает раскладку, а форма остаётся читаемой, пока разделитель в границах `min` и `max`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseSplitter', 'BaseTable', 'BaseCard', 'BaseForm', 'BaseInput', 'BaseButton'],
				state,
				script: [`const columns = ${literal(columns)}`, `const rows = ${literal(rows)}`].join('\n'),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseSplitter, BaseTable, BaseCard, BaseForm, BaseInput, BaseButton },
		setup: useStorySetup(args, { state, data: { columns, rows } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const separator = canvas.getByRole('separator', { name: 'Таблица заказов' })
		await checkSplitterKeyboard(separator, { min: 30, max: 75, step: 5 }, userEvent)
		await checkSplitterDrag(separator, { min: 30, max: 75 })
	},
}

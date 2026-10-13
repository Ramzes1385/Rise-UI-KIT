import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const columns = [
	{ key: 'customer', label: 'Покупатель' },
	{ key: 'total', label: 'Сумма', align: 'right' },
]

const rows = [
	{ id: 1, data: { customer: 'Анна', total: 12490 }, isExpandable: true },
	{ id: 2, data: { customer: 'Иван', total: 3150 } },
	{ id: 3, data: { customer: 'Мария', total: 28700 } },
	{ id: 4, data: { customer: 'Олег', total: 990 } },
]

const sorted = [...rows].sort((a, b) => a.data.total - b.data.total)

const motion = motionPresetsStory({
	item: `
		<BaseTable v-bind="args" :columns="columns" :rows="[rows, sorted, [], rows][step]" :is-loading="step === 2">
			<template #expanded-content="{ row }">
				<p style="margin: 0;">{{ row.data.customer }}: доставка курьером</p>
			</template>
		</BaseTable>
	`,
	components: { BaseTable, BaseButton },
	imports: ['BaseTable'],
	steps: ['сортировка по сумме', 'загрузка', 'загружено'],
	state: { columns, rows, sorted },
	omit: ['columns', 'rows', 'isLoading'],
	slots: ['default', 'columns', 'rows', 'isLoading'],
})

function customers(table: HTMLElement): string[] {
	return [...table.querySelectorAll('tbody > tr.base-table__tr:not(.base-table__tr--expanded-content)')].map(row =>
		row.querySelector('td:last-child')!.previousElementSibling!.textContent!.trim(),
	)
}

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Сортировка, загрузка и раскрытие строки в колонках четырёх пресетов движения. «Следующий шаг» по шагам: строки',
					'по сумме — каждая едет со старого места на новое (FLIP через `transform`) за `--rise-duration-slow` с кривой',
					'`--rise-ease-emphasized`; загрузка — строки-скелетоны; «загружено» — строки проявляются (`opacity`) за',
					'`--rise-duration-slow` с `--rise-ease-out`, без смены раскладки. Шеврон у «Анны» раскрывает строку: высота от 0',
					'до содержимого за `--rise-duration-slow` (`--rise-ease-emphasized`), содержимое проявляется (`--rise-ease`).',
					'В виртуальном режиме (`isVirtual`) строки не анимируются. В пресете `none` и при «уменьшить движение» — сразу',
					"конечное состояние. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const step = canvas.getByRole('button', { name: /^(Следующий шаг|Повторить)/ })
		const tables = () => [...canvasElement.querySelectorAll<HTMLElement>('.base-table')]
		await userEvent.click(step)
		for (const table of tables()) await waitFor(() => expect(customers(table)).toEqual(['Олег', 'Иван', 'Анна', 'Мария']))
		await userEvent.click(step)
		for (const table of tables()) await waitFor(() => expect(table.querySelector('table')).toHaveAttribute('aria-busy', 'true'))
		await userEvent.click(step)
		for (const table of tables()) await waitFor(() => expect(customers(table)).toEqual(['Анна', 'Иван', 'Мария', 'Олег']))
		const [expand] = canvas.getAllByRole('button', { name: 'Развернуть строку' })
		await userEvent.click(expand)
		await expect(expand).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(canvas.getByText('Анна: доставка курьером')).toBeVisible())
	},
}

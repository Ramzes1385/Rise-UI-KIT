import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import type { BaseAccordionItem } from '../../../types/BaseAccordion.types'

const sets: BaseAccordionItem[][] = [
	[
		{ label: 'Оплата', description: 'Карта, СБП, счёт для юрлиц', content: 'Оплатить можно картой, через СБП или по счёту.' },
		{ label: 'Доставка', description: 'Курьер, пункт выдачи', content: 'Курьером по городу — 290 ₽, в пункт выдачи — бесплатно.' },
		{ label: 'Возврат', description: '14 дней с момента получения', content: 'Верните товар в упаковке и с чеком.' },
	],
	[
		{ label: 'Гарантия', description: '2 года на всю технику', content: 'Ремонт или замена в сервисном центре.', defaultOpen: true },
		{ label: 'Сборка', description: 'В день доставки', content: 'Мастер соберёт мебель за 1500 ₽.' },
		{ label: 'Самовывоз', description: 'Со склада на Складской, 12', content: 'Заказ хранится 5 дней.' },
	],
	[
		{
			label: 'Тарифы',
			description: 'Старт, Бизнес, Корпорация',
			content: 'Тариф меняется в любой момент без потери данных.',
			defaultOpen: true,
		},
		{ label: 'Пробный период', description: '14 дней без оплаты', content: 'Все функции тарифа «Бизнес» на две недели.' },
		{ label: 'Отмена подписки', description: 'В настройках профиля', content: 'Деньги за неиспользованные дни вернутся на карту.' },
	],
	[
		{ label: 'Уведомления', description: 'Почта и push', content: 'Выберите события, о которых сообщать.', defaultOpen: true },
		{ label: 'Безопасность', description: 'Пароль и вход по коду', content: 'Включите вход по коду из приложения.' },
		{ label: 'Язык', description: 'Русский', content: 'Язык интерфейса и писем.' },
	],
]

const template = `
	<div class="story-grid" style="--story-grid-min: 300px;">
		<div class="story-col">
			<span class="story-label">Стрелка слева, акцент</span>
			<BaseAccordion v-bind="args" :items="sets[0]" arrow-position="start" is-accented />
		</div>
		<div class="story-col">
			<span class="story-label">Плюс и минус, пунктир</span>
			<BaseAccordion v-bind="args" :items="sets[1]" expand-icon="plus" collapse-icon="minus" divider="dashed" />
		</div>
		<div class="story-col">
			<span class="story-label">Карточки, акцент</span>
			<BaseAccordion v-bind="args" :items="sets[2]" variant="separated" is-accented />
		</div>
		<div class="story-col">
			<span class="story-label">Компактно, без стрелки</span>
			<BaseAccordion v-bind="args" :items="sets[3]" variant="outline" density="compact" :show-arrow="false" />
		</div>
	</div>
`

export const Customization: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isMultiple'] },
		docs: {
			description: {
				story: [
					'Настройка вида: сторона стрелки `arrowPosition`, свои значки `expandIcon` и `collapseIcon`, линия между пунктами',
					'`divider`, плотность `density`, выделение открытого пункта `isAccented`, вариант `separated` — пункты отдельными',
					'карточками, пояснение под заголовком — поле `description`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAccordion'], script: `const sets = ${literal(sets)}`, omit: ['items'] }),
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: useStorySetup(args, { data: { sets } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const header = canvas.getByRole('button', { name: 'Доставка' })
		await expect(header).toHaveAccessibleDescription('Курьер, пункт выдачи')
		await userEvent.click(header)
		await expect(header).toHaveAttribute('aria-expanded', 'true')
		const region = within(canvas.getByRole('region', { name: 'Доставка' }))
		await waitFor(() => expect(region.getByText('Курьером по городу — 290 ₽, в пункт выдачи — бесплатно.')).toBeVisible())
	},
}

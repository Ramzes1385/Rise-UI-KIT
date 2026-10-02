import { setup } from './Plans.setup'
import type meta from '../Pricing.stories'
import setupSource from './Plans.setup.ts?raw'
import { BaseCard } from '@components/BaseCard'
import { BaseIcon } from '@components/BaseIcon'
import { waitFor, expect } from 'storybook/test'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseAccordion } from '@components/BaseAccordion'
import { BaseSegmented } from '@components/BaseSegmented'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<main class="blk-page blk-pricing">
		<header class="blk-pricing__header">
			<h1 class="blk-title">Тарифы</h1>
			<p class="blk-muted">Начните бесплатно и переходите на платный тариф, когда команда вырастет.</p>
			<BaseSegmented v-model="period" :options="periods" aria-label="Период оплаты" />
		</header>
		<ul class="blk-pricing__plans">
			<li v-for="plan in plans" :key="plan.id">
				<BaseCard :class="['blk-pricing__plan', { 'blk-pricing__plan--popular': plan.isPopular }]">
					<div class="blk-pricing__plan-head">
						<h2 class="blk-pricing__name">{{ plan.name }}</h2>
						<BaseBadge v-if="plan.isPopular" variant="soft" label="Популярный" />
					</div>
					<p class="blk-muted">{{ plan.description }}</p>
					<p class="blk-pricing__price">
						{{ price(plan) }}
						<span v-if="plan.monthly" class="blk-muted">в месяц{{ period === 'year' ? ' при оплате за год' : '' }}</span>
					</p>
					<ul class="blk-pricing__features" :aria-label="'Что входит в «' + plan.name + '»'">
						<li v-for="feature in plan.features" :key="feature" class="blk-pricing__feature">
							<BaseIcon name="check" class="blk-pricing__check" />
							{{ feature }}
						</li>
					</ul>
					<template #footer>
						<BaseButton :variant="plan.isPopular ? 'default' : 'outline'" class="blk-pricing__action" @click="choose(plan)">
							{{ plan.monthly ? 'Выбрать «' + plan.name + '»' : 'Начать бесплатно' }}
						</BaseButton>
					</template>
				</BaseCard>
			</li>
		</ul>
		<p role="status" class="blk-muted">{{ message }}</p>
		<section class="blk-pricing__faq" aria-labelledby="pricing-faq">
			<h2 id="pricing-faq" class="blk-pricing__name">Частые вопросы</h2>
			<BaseAccordion :items="faq" :heading-level="3" />
		</section>
	</main>
`

export const Plans: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Три тарифа: переключатель «Помесячно / За год» (стрелки внутри группы) пересчитывает цены, популярный тариф',
					'выделен рамкой и бейджем. Возможности — список с галочками, выбор тарифа объявляет область `role="status"`.',
					'Ниже — частые вопросы в BaseAccordion с заголовками третьего уровня.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: [
					'BaseAccordion',
					'BaseBadge',
					'BaseButton',
					'BaseCard',
					'BaseIcon',
					'BaseSegmented',
					'type BaseAccordionItem',
					'type SegmentedOption',
				],
				vue: ['computed', 'ref'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseAccordion, BaseBadge, BaseButton, BaseCard, BaseIcon, BaseSegmented },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('heading', { level: 1, name: 'Тарифы' })).toBeVisible()
		await expect(canvas.getByText('990 ₽', { exact: false })).toBeVisible()

		canvas.getByRole('radio', { name: 'Помесячно' }).focus()
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(canvas.getByRole('radio', { name: 'За год −20%' })).toBeChecked())
		await waitFor(() => expect(canvas.getByText('792 ₽', { exact: false })).toBeVisible())

		await userEvent.click(canvas.getByRole('button', { name: 'Выбрать «Команда»' }))
		await waitFor(() => expect(canvas.getByText('Выбран тариф «Команда», оплата за год')).toHaveAttribute('role', 'status'))

		const question = canvas.getByRole('button', { name: 'Есть ли пробный период?' })
		await userEvent.click(question)
		await waitFor(() => expect(question).toHaveAttribute('aria-expanded', 'true'))
	},
}

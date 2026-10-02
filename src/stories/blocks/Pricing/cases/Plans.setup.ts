import { computed, ref } from 'vue'
import type { SegmentedOption } from '@components/BaseSegmented'
import type { BaseAccordionItem } from '@components/BaseAccordion'

type Period = 'month' | 'year'

interface Plan {
	id: string
	name: string
	description: string
	monthly: number
	features: string[]
	isPopular?: boolean
}

const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })

const periods: SegmentedOption[] = [
	{ value: 'month', label: 'Помесячно' },
	{ value: 'year', label: 'За год −20%' },
]

const plans: Plan[] = [
	{ id: 'free', name: 'Старт', description: 'Для личных проектов', monthly: 0, features: ['1 проект', '3 участника', 'Сообщество'] },
	{
		id: 'team',
		name: 'Команда',
		description: 'Для небольших команд',
		monthly: 990,
		features: ['10 проектов', '20 участников', 'Темы и брендирование', 'Поддержка в чате'],
		isPopular: true,
	},
	{
		id: 'business',
		name: 'Бизнес',
		description: 'Для компаний',
		monthly: 2490,
		features: ['Без ограничений', 'Единый вход (SSO)', 'Журнал действий', 'Персональный менеджер'],
	},
]

const faq: BaseAccordionItem[] = [
	{ id: 'trial', label: 'Есть ли пробный период?', content: '14 дней тарифа «Команда» бесплатно, карта не нужна.' },
	{ id: 'change', label: 'Можно ли сменить тариф?', content: 'Да, в любой момент: разница пересчитывается по дням.' },
	{ id: 'refund', label: 'Как вернуть деньги?', content: 'В течение 30 дней после оплаты — полностью, через поддержку.' },
]

export function setup() {
	const period = ref<Period>('month')
	const message = ref('')

	const prices = computed(() =>
		Object.fromEntries(plans.map(plan => [plan.id, period.value === 'year' ? Math.round(plan.monthly * 0.8) : plan.monthly])),
	)

	function price(plan: Plan): string {
		return prices.value[plan.id] ? rub.format(prices.value[plan.id]) : 'Бесплатно'
	}

	function choose(plan: Plan): void {
		message.value = `Выбран тариф «${plan.name}», ${period.value === 'year' ? 'оплата за год' : 'оплата помесячно'}`
	}

	return { periods, plans, faq, period, message, price, choose }
}

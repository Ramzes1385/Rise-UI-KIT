import { BaseText } from '@components/BaseText'
import type meta from '../BaseSlideover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../ui/BaseSlideover.vue'
import { screen, within, expect, waitFor } from 'storybook/test'
import { literal, isStoryBranded, storySource, useStorySetup } from '@/stories/helpers'

const HISTORY = [
	'Анна Смирнова загрузила серию 1 и субтитры к ней.',
	'Иван Петров назначил роли: Мария — главная героиня, Олег — рассказчик.',
	'Мария Кузнецова записала реплики 1–48, дубли отмечены в таймлайне.',
	'Олег Соколов перезаписал вступление: исправлено ударение в названии.',
	'Екатерина Волкова проверила синхронизацию и оставила 6 комментариев.',
	'Анна Смирнова поправила громкость фоновой музыки на 12-й минуте.',
	'Иван Петров отправил серию 1 на согласование.',
	'Мария Кузнецова ответила на комментарии к репликам 20–26.',
	'Екатерина Волкова приняла правки и закрыла проверку.',
	'Анна Смирнова выгрузила финальный микс в формате WAV.',
	'Иван Петров опубликовал серию 1 в сообществе.',
	'Олег Соколов начал запись серии 2.',
	'Мария Кузнецова загрузила черновые дубли серии 2.',
	'Екатерина Волкова составила список правок к серии 2.',
	'Анна Смирнова загрузила субтитры к серии 2.',
	'Иван Петров назначил роли для серии 2.',
	'Мария Кузнецова записала реплики 1–30 серии 2.',
	'Олег Соколов проверил ударения в именах героев.',
	'Екатерина Волкова оставила 4 комментария к серии 2.',
	'Анна Смирнова согласовала громкость музыки в серии 2.',
] as const

const history = HISTORY

const models = { isOpen: 'isOpen' }

const template = `
	<BaseButton variant="outline" @click="onUpdate(true)">Открыть историю</BaseButton>
	<BaseSlideover v-bind="args" v-model:is-open="isOpen">
		<div class="story-stack">
			<BaseText v-for="(entry, index) in history" :key="index">{{ entry }}</BaseText>
		</div>
		<template #footer>
			<BaseButton @click="onUpdate(false)">Готово</BaseButton>
		</template>
	</BaseSlideover>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Длинное содержимое прокручивается внутри тела: шапка и подвал остаются на месте. Тело с прокруткой получает',
					'`tabindex="0"`, поэтому его можно прокрутить с клавиатуры, даже если внутри нет кнопок и полей.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSlideover', 'BaseButton', 'BaseText'],
				script: `const history = ${literal(history)}`,
				models,
			}),
		},
	},
	tags: ['!autodocs'],
	args: { isOpen: true, title: 'История проекта' },
	render: args => ({
		components: { BaseSlideover, BaseButton, BaseText },
		setup: useStorySetup(args, { models, data: { history } }),
		template,
	}),
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'История проекта' })
		const body = within(dialog).getByText(HISTORY[0]).closest('.base-slideover__body') as HTMLElement
		if (!isStoryBranded()) {
			await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
			await waitFor(() => expect(body).toHaveAttribute('tabindex', '0'))
		}
		const done = within(dialog).getByRole('button', { name: 'Готово' })
		await expect(done.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight)
	},
}

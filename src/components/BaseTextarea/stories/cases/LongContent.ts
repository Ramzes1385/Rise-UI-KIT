import { expect } from 'storybook/test'
import type meta from '../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

const LONG_TEXT = [
	'Заказ собран 14 мая, но курьер не смог передать его по адресу: в подъезде не работает домофон, а телефон был недоступен.',
	'Прошу перенести доставку на 16 мая с 18:00 до 21:00 и перед приездом позвонить на второй номер из профиля.',
	'Если в этот день доставить не получится, готов забрать заказ самостоятельно из пункта выдачи на Тверской.',
].join('\n')

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Длинный текст прокручивается внутри поля: высота задана `rows`, ширина — контейнером (360px).' } },
	},
	args: { label: 'Обращение в поддержку', modelValue: LONG_TEXT, rows: 3 },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Обращение в поддержку')
		await expect(field.scrollHeight).toBeGreaterThan(field.clientHeight)
		await expect(field.scrollWidth).toBeLessThanOrEqual(field.clientWidth)
	},
}

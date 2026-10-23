import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import BaseQrCode from '../../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { gostPaymentText } from '@utils/data/paymentQrUtils'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const payment = {
	name: 'ООО «Ромашка»',
	personalAcc: '40702810938000012345',
	bankName: 'ПАО СБЕРБАНК',
	bic: '044525225',
	correspAcc: '30101810400000000225',
	payeeInn: '7707083893',
	kpp: '773601001',
	purpose: 'Оплата по счёту № 42 от 05.10.2026, НДС не облагается',
	sumKopecks: 1250000,
}

const value = gostPaymentText(payment)

const template = '<BaseQrCode v-bind="args" :value="value" />'

export const GostPayment: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Оплата по реквизитам: строку ГОСТ Р 56042-2014 собирает `gostPaymentText()` из `@ramzes1385/rise-ui-kit/utils`',
					'(UTF-8, сумма в копейках). БИК, ключи счетов, ИНН и КПП проверяются — неверные данные дают исключение.',
					'С кириллицей строка длиннее 270 байт — код версии больше 10.',
				].join(' '),
			},
			source: storySource({
				template,
				imports: ['BaseQrCode'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['gostPaymentText'] },
				script: `const value = gostPaymentText(${literal(payment)})`,
				omit: ['value'],
			}),
		},
		controls: { include: ['size', 'errorCorrection', 'margin'] },
	},
	args: { label: 'QR-код для оплаты', size: 200 },
	render: args => ({
		components: { BaseQrCode },
		setup: useStorySetup(args, { data: { value } }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('img', { name: 'QR-код для оплаты' })).toBeVisible()
		const size = Number(canvasElement.querySelector('svg')?.getAttribute('viewBox')?.split(' ')[2]) - 8
		await expect(size).toBeGreaterThan(17 + 10 * 4)
	},
}

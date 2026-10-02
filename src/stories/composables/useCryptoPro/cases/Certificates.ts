import { setup } from './Certificates.setup'
import type meta from '../useCryptoPro.stories'
import { expect, within } from 'storybook/test'
import { BaseAlert } from '@components/BaseAlert'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import setupSource from './Certificates.setup.ts?raw'
import { COMPOSABLES, certificatesTemplate as template } from '../shared'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

export const Certificates: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`getCertificates()` читает личное хранилище текущего пользователя: ФИО, организация, ИНН, ОГРН, СНИЛС из субъекта,',
					'срок действия, проверка `IsValid` и наличие закрытого ключа. Эмуляция отдаёт четыре сертификата: действующий,',
					'истекающий, просроченный и без закрытого ключа. Пока список грузится, `isLoading` — `true`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseAlert', 'BaseBadge', 'BaseButton'],
				importsFrom: { [COMPOSABLES]: ['useCryptoPro'] },
				vue: ['onMounted'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseAlert, BaseBadge, BaseButton },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Загрузить сертификаты' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')

		const list = await canvas.findByRole('list', { name: 'Сертификаты' })
		await expect(within(list).getAllByRole('listitem')).toHaveLength(4)
		await expect(within(list).getByText('Иванов Иван Иванович')).toBeVisible()
		await expect(within(list).getByText('ООО "Ромашка", ИНН 7712345678')).toBeVisible()
		await expect(within(list).getByText('Недействителен')).toBeVisible()
		await expect(within(list).getByText('Нет закрытого ключа')).toBeVisible()
	},
}

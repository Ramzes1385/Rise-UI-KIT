import type meta from '../BaseLink.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithoutIcon: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ссылка в новой вкладке без значка «↗» (`hasExternalIcon: false`) — для ссылок внутри текста, подписей и панелей.',
					'Скрытая подсказка «откроется в новой вкладке» остаётся: скринридер слышит её в имени ссылки.',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale', 'label', 'href', 'hasExternalIcon'] },
	},
	args: { to: undefined, href: 'https://example.com/guide', target: '_blank', label: 'Руководство по озвучке', hasExternalIcon: false },
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: /Руководство по озвучке/ })
		await expect(link).toHaveAccessibleName(/^Руководство по озвучке\s*\(откроется в новой вкладке\)$/)
		await expect(within(link).queryByText('↗')).toBeNull()
	},
}

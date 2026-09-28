import { DEMO_LOGO } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const TitleAndLogo: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Название (`title`, `hasTitle`) показывается вверху кадра вместе с панелью и скрывается с ней. Логотип (`logo`)',
					'остаётся виден всегда; с `logoHref` он становится ссылкой в новой вкладке, `logoAlt` — его имя для скринридера.',
				].join('\n'),
			},
		},
	},
	args: { logo: DEMO_LOGO, logoAlt: 'Rise UI Kit', logoHref: 'https://example.com', logoPosition: 'top-right' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Rise UI Kit' })).toHaveAttribute('target', '_blank')
	},
}

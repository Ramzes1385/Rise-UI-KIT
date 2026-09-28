import type meta from '../BaseEditor.stories'
import { expect, within } from 'storybook/test'
import { renderWithLocalModel } from '../shared'
import { STORY_IMAGES } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

export const SanitizedContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Очистка HTML. В `modelValue` пришла разметка из недоверенного источника: скрипт, обработчик `onerror`,',
					'ссылка `javascript:` и `<iframe>`. Редактор показывает только безопасную часть: текст, изображение без обработчика',
					'и ссылку без адреса. Своя очистка — проп `sanitize`, например DOMPurify со своими правилами.',
				].join('\n'),
			},
		},
	},
	render: renderWithLocalModel,
	args: {
		modelValue: [
			`<p>Фото стенда <img src="${STORY_IMAGES[2].src}" onerror="console.error('xss')" alt="${STORY_IMAGES[2].alt}" width="120"></p>`,
			`<p><a href="javascript:console.error('xss')">Подробнее</a><script>console.error('xss')</script></p>`,
			`<iframe srcdoc="<script>console.error('xss')</script>"></iframe>`,
		].join(''),
	},
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox.querySelector('script, iframe')).toBeNull()
		await expect(within(textbox).getByRole('img', { name: STORY_IMAGES[2].alt })).not.toHaveAttribute('onerror')
		await expect(within(textbox).getByText('Подробнее')).not.toHaveAttribute('href')
	},
}

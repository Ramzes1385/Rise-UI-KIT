import { ref } from 'vue'
import { expect, within } from 'storybook/test'
import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, STORY_IMAGES, storySource, useStorySetup } from '@/stories/helpers'

const image = STORY_IMAGES[2]

const untrustedHtml = (src: string): string =>
	[
		`<p>Фото стенда <img src="${src}" onerror="console.error('xss')" alt="${image.alt}" width="120"></p>`,
		`<p><a href="javascript:console.error('xss')">Подробнее</a><script>console.error('xss')</script></p>`,
		`<iframe srcdoc="<script>console.error('xss')</script>"></iframe>`,
	].join('')

const template = `
	<BaseEditor v-bind="args" v-model="html" />
`

const script = `
const image = ${literal(image.src)}
const html = ref(
	\`<p>Фото стенда <img src="\${image}" onerror="console.error('xss')" alt="${image.alt}" width="120"></p>\` +
		\`<p><a href="javascript:console.error('xss')">Подробнее</a><script>console.error('xss')<\\/script></p>\` +
		\`<iframe srcdoc="<script>console.error('xss')<\\/script>"></iframe>\`,
)
`

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
			source: storySource({ template, imports: ['BaseEditor'], vue: ['ref'], script, omit: ['toolbar'] }),
		},
	},
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { slots: ['toolbar', 'modelValue'], setup: () => ({ html: ref(untrustedHtml(image.src)) }) }),
		template,
	}),
	args: { modelValue: untrustedHtml(image.src) },
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox.querySelector('script, iframe')).toBeNull()
		await expect(within(textbox).getByRole('img', { name: STORY_IMAGES[2].alt })).not.toHaveAttribute('onerror')
		await expect(within(textbox).getByText('Подробнее')).not.toHaveAttribute('href')
	},
}

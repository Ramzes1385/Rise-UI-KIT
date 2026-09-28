import { expect } from 'storybook/test'
import type meta from '../BaseEditor.stories'
import type { StoryObj } from '@storybook/vue3-vite'

const LONG_HTML = [
	'<h2>Регламент подготовки релиза</h2>',
	...Array.from(
		{ length: 12 },
		(_, index) =>
			`<p>Шаг ${index + 1}. Проверьте изменения в ветке, обновите changelog и убедитесь, что visual-тесты и e2e проходят ` +
			'в обеих темах. Замечания фиксируйте в задаче, а не в личных сообщениях: так их увидит вся команда.</p>',
	),
	'<p>Путь без пробелов переносится по символам: src/components/BaseEditor/styles/BaseEditor.style.scss/typography/long-content</p>',
	'<ul><li>Сборка пакета</li><li>Публикация документации</li><li>Анонс в канале команды</li></ul>',
].join('')

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Длинный документ прокручивается внутри области текста (до 600px при sizeScale = 100, переменная `--editor-max-height`),',
					'тулбар остаётся на месте. Слова без пробелов переносятся и не растягивают редактор.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: LONG_HTML },
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox.scrollHeight).toBeGreaterThan(textbox.clientHeight)
		await expect(textbox.scrollWidth).toBeLessThanOrEqual(textbox.clientWidth)
	},
}

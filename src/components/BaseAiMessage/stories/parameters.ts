import type { Meta } from '@storybook/vue3-vite'
import type BaseAiMessage from '../ui/BaseAiMessage.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Сообщение ИИ-ассистента: аватар, имя и время, ответ в Markdown (BaseMarkdown — без HTML-строк), действия.',
				'',
				'- `is-streaming` — потоковый ответ: курсор в конце, `aria-busy`, для скринридера статус «Ассистент отвечает»;',
				'  пока текста нет — три точки. Действия появляются, когда ответ готов.',
				'- `error` — ответ не получен: сообщение и «Повторить» (событие `retry`).',
				'- «Копировать ответ» (`has-copy`) копирует Markdown и сообщает событием `copy`; свои действия — слот `actions`.',
				'- Слот `default` — блоки перед ответом: рассуждение (BaseReasoning) и вызовы инструментов (BaseToolCall).',
				'- Варианты: `default` — без пузыря, `soft` — пузырь на подложке, `outline` — рамка, `ghost` — только текст.',
				'- Готовый ответ показывает действия сдвигом и проявлением на токенах движения (история «Анимации»).',
				'- Перекраска — токены `--rise-ai-message-*`, классы частей — проп `ui` (история «Токены»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAiMessage>['parameters']

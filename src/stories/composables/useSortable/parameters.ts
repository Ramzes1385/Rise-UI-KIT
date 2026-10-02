import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'`useSortable` — перестановка элементов мышью и с клавиатуры, общая для BaseKanban и BaseList. Нужна, когда',
				'свой список, сетку или доску надо сортировать так же, как компоненты кита.',
				'',
				'- Мышь и перо: перетаскивание начинается после сдвига на 5 px, «призрак» под курсором (`drag`, `ghostRef`,',
				'  `ghostStyle`), Escape отменяет; после броска «призрак» плавно садится на место. Касание не перехватывается —',
				'  им прокручивают страницу; клик сразу после броска пропускает `consumeClick()`.',
				'- Клавиатура — альтернатива перетаскиванию по WCAG 2.5.7: `grab(item)` берёт элемент, дальше',
				'  `handleGrabbedKeydown`: стрелки, Home и End — шаг (`stepPlace`), пробел или Enter — положить, Escape —',
				'  отменить, Tab — отменить и уйти. Каждый шаг приходит в `onAnnounce` — его объявляют через `role="status"`.',
				'- Порядок composable не хранит: место (`TPlace` — индекс, `{ columnId, index }`) и черновик ведёт вызывающий код',
				'  в `onStart`, `onPreview`, `onDrop` и `onCancel`. Так один composable служит списку, доске и BaseTransfer.',
				'- `flip` — анимация перестановки: соседи плавно расступаются. При `prefers-reduced-motion` анимаций нет.',
				"- Импорт: `import { useSortable } from '@ramzes1385/rise-ui-kit/composables'`. Код примера — во вкладке «Show code».",
			].join('\n'),
		},
	},
} satisfies Meta['parameters']

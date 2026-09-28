import type meta from '../BaseEditor.stories'
import { STORY_IMAGES } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

const ARTICLE_HTML = [
	'<h1>Редизайн библиотеки</h1>',
	'<p>Компоненты переходят на <strong>токены</strong> и единую высоту контролов. В тексте встречаются <em>курсив</em>, ',
	'<u>подчёркнутый</u> и <s>зачёркнутый</s> фрагменты, <a href="#tokens">ссылка на раздел</a> и код <code>sizeScale</code> в строке.</p>',
	'<h2>Что меняется</h2>',
	'<ul><li>Нейтральные поверхности и тонкие рамки</li><li>Кольцо фокуса основного цвета</li></ul>',
	'<h3>Порядок работ</h3>',
	'<ol><li>Токены и миксины</li><li>Компоненты по группам</li><li>Stories и visual-тесты</li></ol>',
	'<blockquote>Стили правильные и масштабируемые: без HEX-цветов и ручных отступов.</blockquote>',
	'<pre><code>&lt;BaseEditor v-model="html" variant="outline" /&gt;</code></pre>',
	'<hr>',
	`<p><img src="${STORY_IMAGES[1].src}" alt="${STORY_IMAGES[1].alt}" width="200"></p>`,
].join('')

export const FormattedContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Типографика содержимого: заголовки трёх уровней, начертания, ссылка, код в строке и блок кода, списки, цитата,',
					'разделитель и изображение. Стили элементов заданы с нулевой специфичностью — `customClass.content` их перекрывает.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: ARTICLE_HTML },
}

import { motionPresetsStory } from '../render/decorators/motion'

const item = `
		<BaseAnimation :key="replay" v-bind="args">
			<div class="story-frame">Карточка</div>
		</BaseAnimation>
`

describe('motionPresetsStory', () => {
	const story = motionPresetsStory({ item, components: {}, imports: ['BaseAnimation'], omit: ['default'] })

	it('шаблон: кнопка «Повторить» и четыре колонки пресетов с одной и той же разметкой', () => {
		expect(story.template).toContain('<BaseButton variant="outline" @click="replay++">Повторить</BaseButton>')
		const presets = [...story.template.matchAll(/data-rise-motion="(\w+)"/g)].map(([, preset]) => preset)
		expect(presets).toEqual(['none', 'subtle', 'standard', 'expressive'])
		expect(story.template.match(/<BaseAnimation :key="replay" v-bind="args">/g)).toHaveLength(4)
	})

	it('отступ разметки колонки выравнивается по шаблону', () => {
		expect(story.template).toContain(
			'\t\t\t<BaseAnimation :key="replay" v-bind="args">\n\t\t\t\t<div class="story-frame">Карточка</div>',
		)
	})

	it('%preset% в разметке — имя пресета своей колонки', () => {
		const { template } = motionPresetsStory({
			item: '<BaseApp :toaster="{ ariaLabel: \'Уведомления %preset%\' }" />',
			components: {},
			imports: [],
		})

		expect([...template.matchAll(/Уведомления (\w+)/g)].map(([, preset]) => preset)).toEqual([
			'none',
			'subtle',
			'standard',
			'expressive',
		])
	})

	it('своё действие и подпись кнопки', () => {
		const { template } = motionPresetsStory({ item, components: {}, imports: [], action: 'isOpen = !isOpen', trigger: 'Открыть' })

		expect(template).toContain('@click="isOpen = !isOpen">Открыть</BaseButton>')
	})

	it('«Show code» — тот же шаблон, BaseButton в импортах и replay в состоянии', () => {
		const code = story.source.transform('', { args: {} })

		expect(code).toContain("import { BaseAnimation, BaseButton } from '@ramzes1385/rise-ui-kit'")
		expect(code).toContain('const replay = ref(0)')
		expect(code).toContain('data-rise-motion="expressive"')
	})
})

describe('motionPresetsStory: steps', () => {
	const steps = ['добавить', 'удалить']
	const stepItem = '<BaseAnimation :key="step" v-bind="args" />'
	const story = motionPresetsStory({ item: stepItem, components: {}, imports: ['BaseAnimation'], steps, state: { phases: [1, 2, 3] } })

	it('кнопка — «Следующий шаг: <подпись>», после последнего шага — «Повторить» и возврат в начало', () => {
		expect(story.template).toContain(
			`@click="step = step < steps.length ? step + 1 : 0">{{ step < steps.length ? 'Следующий шаг: ' + steps[step] : 'Повторить' }}</BaseButton>`,
		)
		expect(story.template).not.toContain('replay')
	})

	it('«Show code» — step, steps и своё состояние вместо replay', () => {
		const code = story.source.transform('', { args: {} })

		expect(code).toContain('const step = ref(0)')
		expect(code).toContain('const steps = ref(["добавить", "удалить"])'.replaceAll('"', "'"))
		expect(code).toContain('const phases = ref([1, 2, 3])')
		expect(code).not.toContain('replay')
	})

	it('без steps прежняя кнопка и replay', () => {
		const plain = motionPresetsStory({ item, components: {}, imports: [] })

		expect(plain.template).toContain('@click="replay++">Повторить</BaseButton>')
		expect(plain.template).not.toContain('step <')
	})
})

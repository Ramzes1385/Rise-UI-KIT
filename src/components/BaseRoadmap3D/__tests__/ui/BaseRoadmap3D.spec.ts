import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { Mesh, ShaderMaterial } from 'three'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'
import { mockWebGL } from '../../../BaseImageMap3D/__tests__/imageMap3d.test-utils'
import { DATA_ROADMAP_3D, useRoadmap3DEnvironment } from '../fixtures/roadmap3d.test-utils'

const env = useRoadmap3DEnvironment()

const findTwoD = () => screen.findAllByText('Основы', {}, { timeout: 20000 })

describe('BaseRoadmap3D: разметка и доступность', () => {
	it('область с названием пути, группа сцены с подсказкой, холст скрыт от скринридера', async () => {
		const { container } = await env.renderRoadmap()
		const region = screen.getByRole('region', { name: 'Путь' })
		expect(region).toHaveAttribute('aria-roledescription')
		const viewport = screen.getByRole('group', { name: 'Путь' })
		expect(viewport).toHaveAttribute('tabindex', '0')
		const hint = viewport.getAttribute('aria-describedby')?.split(' ') ?? []
		expect(hint).toHaveLength(2)
		hint.forEach(id => expect(document.getElementById(id)).toHaveTextContent(/\S/))
		expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
		expect(screen.getByRole('heading', { level: 2, name: 'Путь' })).toBeInTheDocument()
		expect(screen.getByText('Тестовый путь')).toBeInTheDocument()
	})

	it('подпись берётся из ariaLabel, без названия — запасная', async () => {
		await env.renderRoadmap({ ariaLabel: 'Мой путь' })
		expect(screen.getByRole('region', { name: 'Мой путь' })).toBeInTheDocument()
	})

	it('без названия данных подпись запасная', async () => {
		await env.renderRoadmap({ data: { ...DATA_ROADMAP_3D, title: undefined } })
		expect(screen.getByRole('region').getAttribute('aria-label')).toBeTruthy()
	})

	it('бирки: этапы с номером и процентами, «Вы здесь», старт и цель', async () => {
		const { container } = await env.renderRoadmap()
		const tag = (id: string) => container.querySelector(`[data-label-id="${id}"]`) as HTMLElement
		expect(tag('basics')).toHaveTextContent('Основы')
		expect(tag('frame')).toHaveTextContent('Вы здесь')
		expect(tag('build')).toHaveTextContent('закрыт')
		expect(tag('__start')).toHaveTextContent('Старт')
		expect(tag('__goal')).toHaveTextContent('Работа')
		expect(tag('frame')).toHaveClass('base-roadmap-3d__tag--current')
	})

	it('скрытый список этапов и тем доступен по кнопкам', async () => {
		const user = userEvent.setup()
		await env.renderRoadmap()
		const list = screen.getByRole('list', { name: /Список/ })
		expect(within(list).getAllByRole('button').length).toBeGreaterThan(8)
		await user.click(within(list).getByRole('button', { name: /Основы/ }))
		expect(screen.getByRole('region', { name: /Подробности/ })).toBeInTheDocument()
		await user.click(within(list).getByRole('button', { name: /^Vue, / }))
		expect(screen.getByRole('region', { name: /Подробности/ })).toBeInTheDocument()
	})

	it('сводка с прогрессом в шапке; hasSummary=false её убирает; слот summary-end', async () => {
		await env.renderRoadmap({}, { 'summary-end': () => h('span', '') })
		expect(screen.getByRole('group', { name: /Сводка|Прогресс/i })).toBeInTheDocument()
	})

	it('hasSummary=false убирает сводку', async () => {
		await env.renderRoadmap({ hasSummary: false })
		expect(screen.queryByRole('group', { name: /Сводка|Прогресс/i })).not.toBeInTheDocument()
	})

	it('переключатель 3D / 2D и кнопка тура есть, а по флагам убираются', async () => {
		const { unmount } = await env.renderRoadmap()
		expect(screen.getByRole('radio', { name: '2D' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /тур/i })).toBeInTheDocument()
		unmount()
		await env.renderRoadmap({ has2dToggle: false, hasTour: false })
		expect(screen.queryByRole('radio', { name: '2D' })).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /тур/i })).not.toBeInTheDocument()
	})

	it('загрузка, пустой путь и отключённое состояние', async () => {
		const loading = await env.renderRoadmap({ isLoading: true })
		expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true')
		expect(loading.container.querySelector('.base-roadmap-3d__status--loading')).toBeInTheDocument()
		loading.unmount()
		await env.renderRoadmap({ isDisabled: true })
		expect(screen.getByRole('region')).toHaveAttribute('aria-disabled', 'true')
	})

	it('классы частей из пропа ui добавляются к классам кита', async () => {
		const { container } = await env.renderRoadmap({ ui: { root: 'my-root', viewport: 'my-viewport' }, customClass: undefined })
		expect(container.querySelector('.base-roadmap-3d')).toHaveClass('my-root')
		expect(container.querySelector('.base-roadmap-3d__viewport')).toHaveClass('my-viewport')
	})

	it('нет WebGL: fallback unsupported, переключателя нет', async () => {
		mockWebGL(false)
		const { events, factory } = await env.renderRoadmap({}, {}, { isReady: false })
		await waitFor(() => expect(events.fallback?.[0]).toEqual(['unsupported']))
		expect(factory).not.toHaveBeenCalled()
		expect(screen.queryByRole('radio', { name: '2D' })).not.toBeInTheDocument()
	})

	it('view=2d сразу показывает BaseRoadmap и не создаёт рендерер; переключатель возвращает 3D', async () => {
		const user = userEvent.setup()
		const { factory, events, exposed } = await env.renderRoadmap({ view: '2d' })
		expect(factory).not.toHaveBeenCalled()
		await findTwoD()
		expect(exposed.value?.getSceneContext()).toBeNull()
		await user.click(screen.getByRole('radio', { name: '3D' }))
		expect(events['update:view']?.[0]).toEqual(['3d'])
	})

	it('2D и 3D делят данные и прогресс: слоты передаются 2D-виду', async () => {
		await env.renderRoadmap(
			{ view: '2d', layout: 'path' },
			{
				'summary-end': () => h('span', 'конец сводки'),
				empty: () => h('span', 'пусто'),
				material: () => h('span', 'материал'),
				'stage-header': () => h('span', 'шапка этапа'),
				'topic-details': () => h('span', 'детали'),
				topic: () => h('span', 'своя тема'),
			},
		)
		expect((await screen.findAllByText('конец сводки', {}, { timeout: 20000 })).length).toBeGreaterThan(0)
	})

	it('режим проверки показывает 2D даже при view=3d', async () => {
		await env.renderRoadmap({ modes: ['view', 'review'], mode: 'review' }, {}, { isReady: false })
		await findTwoD()
		expect(document.querySelector('canvas')).toBeNull()
	})
})

describe('BaseRoadmap3D: управление через ref', () => {
	it('модели сцены: по этапу и списком; нет этапа — null', async () => {
		const { exposed } = await env.renderRoadmap()
		expect(exposed.value?.getModel('basics')).not.toBeNull()
		expect(exposed.value?.getModel('нет')).toBeNull()
		expect(exposed.value?.getModels()).toHaveLength(4)
		expect(exposed.value?.getStage('frame')?.title).toBe('Каркас')
		expect(exposed.value?.getStage('нет')).toBeNull()
		expect(exposed.value?.getSceneContext()?.scene).toBeDefined()
	})

	it('2D-методы раскрытия не выставлены наружу', async () => {
		const { exposed } = await env.renderRoadmap()
		expect(exposed.value).not.toHaveProperty('expandAll')
		expect(exposed.value).toHaveProperty('continueLearning')
	})

	it('setView и setCamera сообщают об изменении', async () => {
		const { exposed, events } = await env.renderRoadmap()
		exposed.value?.setCamera('top')
		expect(events['update:camera']?.at(-1)).toEqual(['top'])
		exposed.value?.rotate(1)
		exposed.value?.setView('2d')
		expect(events['update:view']?.at(-1)).toEqual(['2d'])
	})

	it('проп camera меняет вид камеры, неизвестное имя — iso', async () => {
		const { rerender, exposed } = await env.renderRoadmap({ camera: 'top' })
		await rerender({ camera: 'perspective' })
		env.flush(4)
		expect(exposed.value?.getSceneContext()?.camera).toBeDefined()
		await rerender({ camera: undefined })
	})

	it('кнопки камеры: поворот, масштаб, сброс, общий вид', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap()
		const toolbar = screen.getByRole('toolbar')
		const buttons = within(toolbar).getAllByRole('button')
		expect(buttons).toHaveLength(6)
		for (const button of buttons) await user.click(button)
		expect(events['update:camera']?.length).toBeGreaterThan(0)
		await fireEvent.wheel(screen.getByRole('group', { name: 'Путь' }), { deltaY: -100 })
	})
})

describe('BaseRoadmap3D: дорога и машинка', () => {
	function doneProgress(context: { scene: { traverse: (visit: (item: unknown) => void) => void } }): number {
		let value = -1
		context.scene.traverse(item => {
			const mesh = item as Mesh
			if (mesh.isMesh && (mesh.material as ShaderMaterial).uniforms?.uProgress && mesh.renderOrder === 3)
				value = (mesh.material as ShaderMaterial).uniforms.uProgress.value
		})
		return value
	}

	it('пройденная часть дороги следует за прогрессом', async () => {
		const { exposed, rerender } = await env.renderRoadmap()
		const context = () =>
			exposed.value?.getSceneContext() as NonNullable<ReturnType<NonNullable<typeof exposed.value>['getSceneContext']>>
		env.flush(400)
		const before = doneProgress(context())
		expect(before).toBeGreaterThan(0)
		await rerender({
			progress: { version: 1, topics: { html: { status: 'done' }, css: { status: 'done' }, vue: { status: 'done' } } },
		})
		env.flush(1200)
		expect(doneProgress(context())).toBeGreaterThan(before)
	})
})

import { editData } from '../fixtures/editFixtures'
import { stageUnder, topicUnder } from '../../../model/edit/sortable/roadmapSortableDom'
import { previewMove, stagePlace, stepStage, stepTopic, topicPlace } from '../../../model/edit/data/roadmapPlaces'

describe('stagePlace и topicPlace', () => {
	it('номер этапа и место темы; для чужого вида id — null', () => {
		const data = editData()
		expect(stagePlace(data, 's2')).toBe(1)
		expect(stagePlace(data, 'a')).toBeNull()
		expect(topicPlace(data, 'e')).toEqual({ stage: 's2', index: 1 })
		expect(topicPlace(data, 's2')).toBeNull()
		expect(topicPlace(data, 'ghost')).toBeNull()
	})
})

describe('stepStage', () => {
	it('стрелки сдвигают на один, Home и End — на край', () => {
		const data = editData()
		expect(stepStage(data, 's2', 'ArrowUp')).toBe(0)
		expect(stepStage(data, 's2', 'ArrowLeft')).toBe(0)
		expect(stepStage(data, 's2', 'ArrowDown')).toBe(2)
		expect(stepStage(data, 's2', 'ArrowRight')).toBe(2)
		expect(stepStage(data, 's2', 'Home')).toBe(0)
		expect(stepStage(data, 's2', 'End')).toBe(2)
	})

	it('за краем, на месте, чужая клавиша и неизвестный id — null', () => {
		const data = editData()
		expect(stepStage(data, 's1', 'ArrowUp')).toBeNull()
		expect(stepStage(data, 's3', 'ArrowDown')).toBeNull()
		expect(stepStage(data, 's1', 'Home')).toBeNull()
		expect(stepStage(data, 's2', 'x')).toBeNull()
		expect(stepStage(data, 'ghost', 'Home')).toBeNull()
	})
})

describe('stepTopic', () => {
	it('внутри этапа сдвигает на соседнее место', () => {
		const data = editData()
		expect(stepTopic(data, 'b', 'ArrowUp')).toEqual({ stage: 's1', index: 0 })
		expect(stepTopic(data, 'b', 'ArrowDown')).toEqual({ stage: 's1', index: 2 })
		expect(stepTopic(data, 'b', 'Home')).toEqual({ stage: 's1', index: 0 })
		expect(stepTopic(data, 'b', 'End')).toEqual({ stage: 's1', index: 2 })
	})

	it('Home у первой и End у последней — на месте; чужая клавиша и неизвестный id — null', () => {
		const data = editData()
		expect(stepTopic(data, 'a', 'Home')).toBeNull()
		expect(stepTopic(data, 'c', 'End')).toBeNull()
		expect(stepTopic(data, 'b', 'Enter')).toBeNull()
		expect(stepTopic(data, 'ghost', 'ArrowUp')).toBeNull()
		expect(stepTopic(data, 's1', 'ArrowUp')).toBeNull()
	})

	it('на краю этапа переходит в соседний: вверх — в его конец, вниз — в начало', () => {
		const data = editData()
		expect(stepTopic(data, 'd', 'ArrowUp')).toEqual({ stage: 's1', index: 3 })
		expect(stepTopic(data, 'c', 'ArrowDown')).toEqual({ stage: 's2', index: 0 })
		expect(stepTopic(data, 'a', 'ArrowUp')).toBeNull()
		expect(stepTopic(data, 'e', 'ArrowDown')).toEqual({ stage: 's3', index: 0 })
	})
})

describe('previewMove', () => {
	it('этап: то же или неизвестное место — null, иначе move', () => {
		const data = editData()
		expect(previewMove(data, 's1', 0)).toBeNull()
		expect(previewMove(data, 'a', 1)).toBeNull()
		expect(previewMove(data, 's1', 2)).toEqual({ type: 'move', entity: 'stage', id: 's1', from: 0, to: 2 })
	})

	it('тема: то же место и неизвестная тема — null, иначе move', () => {
		const data = editData()
		expect(previewMove(data, 'a', { stage: 's1', index: 0 })).toBeNull()
		expect(previewMove(data, 'ghost', { stage: 's1', index: 0 })).toBeNull()
		expect(previewMove(data, 'a', { stage: 's1', index: 1 })).toMatchObject({ entity: 'topic', to: { stage: 's1', index: 1 } })
		expect(previewMove(data, 'a', { stage: 's2', index: 0 })).toMatchObject({
			from: { stage: 's1', index: 0 },
			to: { stage: 's2', index: 0 },
		})
	})
})

describe('stageUnder и topicUnder: определение места под курсором', () => {
	let root: HTMLElement
	const original = document.elementsFromPoint

	function hit(...elements: Element[]): void {
		document.elementsFromPoint = () => elements
	}

	beforeEach(() => {
		root = document.createElement('div')
		root.innerHTML = `
			<section data-roadmap-stage="s1"><span data-roadmap-topic="a"><i id="a-in"></i></span><b id="s1-in"></b></section>
			<section data-roadmap-stage="s2"><span data-roadmap-topic="d"></span><b id="s2-in"></b></section>
			<p id="outside"></p>`
		document.body.append(root)
	})

	afterEach(() => {
		root.remove()
		document.elementsFromPoint = original
	})

	const pick = (id: string) => root.querySelector(`#${id}`) as Element
	const at = { x: 1, y: 2 }

	it('этап находится по ближайшему предку, без попадания — null', () => {
		const data = editData()
		hit(pick('outside'), pick('s2-in'))
		expect(stageUnder(data, at)).toBe(1)
		hit(pick('outside'))
		expect(stageUnder(data, at)).toBeNull()
	})

	it('тема под курсором: чужая — её место, та же самая — null', () => {
		const data = editData()
		hit(pick('a-in'))
		expect(topicUnder(data, at, 'd')).toEqual({ stage: 's1', index: 0 })
		expect(topicUnder(data, at, 'a')).toBeNull()
	})

	it('над этапом без темы — в конец; в своём этапе на одну позицию меньше; вне этапов — null', () => {
		const data = editData()
		hit(pick('s1-in'))
		expect(topicUnder(data, at, 'd')).toEqual({ stage: 's1', index: 3 })
		expect(topicUnder(data, at, 'a')).toEqual({ stage: 's1', index: 2 })
		hit(pick('outside'))
		expect(topicUnder(data, at, 'a')).toBeNull()
	})

	it('этап в разметке, которого нет в данных, — null', () => {
		hit(pick('s2-in'))
		expect(topicUnder({ ...editData(), stages: [] }, at, 'a')).toBeNull()
	})
})

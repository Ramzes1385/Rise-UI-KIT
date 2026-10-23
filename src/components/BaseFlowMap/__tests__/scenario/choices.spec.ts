import { vi } from 'vitest'
import { act } from '../helpers/flowFixtures.test-utils'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { pickBranch, resolveScenarioChoices } from '../../model/scenario/choices'
import type { FlowScenarioChoice, FlowScenarioStep } from '../../types/data/flowScenario.types'

const pay: FlowScenarioChoice = {
	type: 'choice',
	id: 'pay',
	branches: [
		{ id: 'ok', condition: 'прошла', steps: [act('ship')] },
		{ id: 'fail', condition: 'отказ', steps: [act('cancel')] },
	],
}

guardConsole()

describe('pickBranch', () => {
	it('берёт ветку из choices по id или по условию', () => {
		expect(pickBranch(pay, { pay: 'fail' })?.id).toBe('fail')
		expect(pickBranch(pay, { pay: 'отказ' })?.id).toBe('fail')
	})

	it('без выбора или с неизвестным ключом — defaultBranch, затем первая ветка', () => {
		expect(pickBranch(pay, {})?.id).toBe('ok')
		expect(pickBranch({ ...pay, defaultBranch: 'fail' }, { pay: '???' })?.id).toBe('fail')
		expect(pickBranch({ ...pay, defaultBranch: 'нет' }, {})?.id).toBe('ok')
	})

	it('ветвление без веток — undefined', () => {
		expect(pickBranch({ type: 'choice', id: 'x', branches: [] }, {})).toBeUndefined()
	})
})

describe('resolveScenarioChoices', () => {
	it('спрашивает у ask о каждом ветвлении без ответа и записывает id выбранной ветки', async () => {
		const ask = vi.fn(async () => 'отказ')
		const result = await resolveScenarioChoices([pay], {}, ask)
		expect(ask).toHaveBeenCalledTimes(1)
		expect(ask).toHaveBeenCalledWith(pay)
		expect(result).toEqual({ pay: 'fail' })
	})

	it('не спрашивает о том, что уже выбрано в choices, и не меняет переданный объект', async () => {
		const ask = vi.fn(async () => 'ok')
		const choices = { pay: 'fail' }
		const result = await resolveScenarioChoices([pay], choices, ask)
		expect(ask).not.toHaveBeenCalled()
		expect(result).toEqual({ pay: 'fail' })
		expect(result).not.toBe(choices)
	})

	it('пустой ответ или неизвестная ветка — ничего не записывается, идёт ветка по умолчанию', async () => {
		expect(await resolveScenarioChoices([pay], {}, async () => undefined)).toEqual({})
		expect(await resolveScenarioChoices([pay], {}, async () => '')).toEqual({})
		expect(await resolveScenarioChoices([pay], {}, async () => 'нет такой')).toEqual({})
	})

	it('спрашивает и о вложенных ветвлениях в выбранной ветке, и о ветвлениях внутри параллелей, по порядку', async () => {
		const inner: FlowScenarioChoice = {
			type: 'choice',
			id: 'inner',
			branches: [
				{ id: 'i1', steps: [] },
				{ id: 'i2', steps: [] },
			],
		}
		const deep: FlowScenarioChoice = { type: 'choice', id: 'deep', branches: [{ id: 'd1', steps: [] }] }
		const steps: FlowScenarioStep[] = [
			{
				type: 'choice',
				id: 'outer',
				branches: [
					{ id: 'o1', steps: [inner] },
					{ id: 'o2', steps: [deep] },
				],
			},
			{ type: 'parallel', id: 'p', branches: [[deep], [act('x')]] },
			act('plain'),
		]
		const asked: string[] = []
		const result = await resolveScenarioChoices(steps, {}, async step => {
			asked.push(step.id)
			return step.id === 'outer' ? 'o1' : step.branches[step.branches.length - 1].id
		})
		expect(asked).toEqual(['outer', 'inner', 'deep'])
		expect(result).toEqual({ outer: 'o1', inner: 'i2', deep: 'd1' })
	})

	it('ветки, не выбранные пользователем, не опрашиваются', async () => {
		const inner: FlowScenarioChoice = { type: 'choice', id: 'inner', branches: [{ id: 'i1', steps: [] }] }
		const steps: FlowScenarioStep[] = [
			{
				type: 'choice',
				id: 'outer',
				branches: [
					{ id: 'o1', steps: [] },
					{ id: 'o2', steps: [inner] },
				],
			},
		]
		const ask = vi.fn(async () => 'o1')
		await resolveScenarioChoices(steps, {}, ask)
		expect(ask).toHaveBeenCalledTimes(1)
	})

	it('ветвление без веток: спрашивать не о чем, ответ не записывается, обход идёт дальше', async () => {
		const empty: FlowScenarioChoice = { type: 'choice', id: 'empty', branches: [] }
		const ask = vi.fn(async () => 'x')
		const result = await resolveScenarioChoices([empty, act('after')], {}, ask)
		expect(ask).toHaveBeenCalledTimes(1)
		expect(result).toEqual({})
	})
})

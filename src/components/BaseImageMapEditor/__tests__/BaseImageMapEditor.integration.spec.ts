import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { at, makeMap, stageOf, statusOf } from './utils/editorTestUtils'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'

function renderWithModel() {
	const model = ref<ImageMapData>(makeMap())
	const result = render({
		components: { BaseImageMapEditor },
		setup: () => ({ model }),
		template: '<BaseImageMapEditor v-model="model" />',
	})
	return { ...result, model }
}

describe('BaseImageMapEditor integration', () => {
	it('рисует прямоугольник мышью, отменяет и повторяет через v-model', async () => {
		const user = userEvent.setup()
		const { container, model } = renderWithModel()
		await user.click(screen.getByRole('radio', { name: 'Прямоугольник' }))
		const stage = stageOf(container)
		await fireEvent.pointerDown(stage, at(0.5, 0.5))
		await fireEvent.pointerMove(stage, at(0.7, 0.8))
		await fireEvent.pointerUp(stage, at(0.7, 0.8))
		expect(model.value.objects.at(-1)).toMatchObject({
			id: 'rect-1',
			title: 'Прямоугольник 2',
			x: 0.5,
			y: 0.5,
			width: 0.2,
			height: 0.3,
		})
		expect(screen.getByRole('button', { name: /^Прямоугольник 2\s*Прямоугольник$/ })).toHaveAttribute('aria-current', 'true')
		await user.keyboard('{Control>}z{/Control}')
		expect(model.value.objects.map(object => object.id)).not.toContain('rect-1')
		await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
		expect(model.value.objects.map(object => object.id)).toContain('rect-1')
	})

	it('с клавиатуры: Tab на холст, точка стрелками и Enter, правка названия, удаление', async () => {
		const user = userEvent.setup()
		const { container, model } = renderWithModel()
		await user.click(screen.getByRole('radio', { name: 'Точка' }))
		screen.getByRole('application', { name: 'Холст карты' }).focus()
		await user.keyboard('{ArrowRight}{ArrowRight}{Enter}')
		expect(model.value.objects.at(-1)).toMatchObject({ id: 'point-1', x: 0.51, y: 0.5 })
		expect(statusOf(container)).toHaveTextContent('Добавлен объект «Точка 2»')
		const title = screen.getByLabelText('Название')
		await user.clear(title)
		await user.type(title, 'Касса')
		expect(screen.getByRole('button', { name: /^Касса\s*Точка$/ })).toBeInTheDocument()
		await user.click(screen.getByRole('radio', { name: 'Выбор' }))
		screen.getByRole('application', { name: 'Холст карты' }).focus()
		await user.keyboard('{Delete}')
		expect(model.value.objects.map(object => object.id)).not.toContain('point-1')
		expect(statusOf(container)).toHaveTextContent('Удалён объект «Касса»')
	})
})

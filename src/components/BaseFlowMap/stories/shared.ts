import { expect, waitFor, type within } from 'storybook/test'

type StoryCanvas = ReturnType<typeof within>

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const flowNode = (canvas: StoryCanvas, label: string): HTMLElement =>
	canvas.getByRole('graphics-object', { name: new RegExp(`^${escapeRegExp(label)}, `) })

export const flowNodes = (canvas: StoryCanvas): HTMLElement[] =>
	canvas.getAllByRole('graphics-object').filter((element: HTMLElement) => element.dataset.flowEntity === 'node')

export const flowEdge = (canvas: StoryCanvas, name: string): HTMLElement => canvas.getByRole('graphics-symbol', { name })

export const flowAnnouncer = (canvas: StoryCanvas): HTMLElement =>
	canvas.getAllByRole('status').find((element: HTMLElement) => element.classList.contains('base-flow-map__sr'))!

const FIT_TOLERANCE = 2
const FIT_MIN_SHARE = 0.15

export const expectFitted = (canvas: StoryCanvas, canvasElement: HTMLElement): Promise<void> =>
	waitFor(
		() => {
			const area = canvasElement.querySelector('.base-flow-map__viewport')!.getBoundingClientRect()
			const legend = canvas.queryByRole('group', { name: 'Обозначения' })?.getBoundingClientRect()
			const rects = flowNodes(canvas).map(node => node.getBoundingClientRect())
			for (const rect of rects) {
				expect(rect.left).toBeGreaterThanOrEqual(area.left - FIT_TOLERANCE)
				expect(rect.right).toBeLessThanOrEqual(area.right + FIT_TOLERANCE)
				expect(rect.top).toBeGreaterThanOrEqual(area.top - FIT_TOLERANCE)
				expect(rect.bottom).toBeLessThanOrEqual(area.bottom + FIT_TOLERANCE)
				if (legend) {
					const isOverlapped =
						rect.left < legend.right && rect.right > legend.left && rect.top < legend.bottom && rect.bottom > legend.top
					expect(isOverlapped).toBe(false)
				}
			}
			const width = Math.max(...rects.map(rect => rect.right)) - Math.min(...rects.map(rect => rect.left))
			const height = Math.max(...rects.map(rect => rect.bottom)) - Math.min(...rects.map(rect => rect.top))
			expect((width * height) / (area.width * area.height)).toBeGreaterThan(FIT_MIN_SHARE)
		},
		{ timeout: 3000 },
	)

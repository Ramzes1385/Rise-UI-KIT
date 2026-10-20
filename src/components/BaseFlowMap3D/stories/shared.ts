import { expect, screen, waitFor, type within } from 'storybook/test'

type StoryCanvas = ReturnType<typeof within>
type StoryUser = { keyboard: (keys: string) => Promise<void> }
export const flowScene = (canvas: StoryCanvas, name = 'Оформление заказа'): HTMLElement => canvas.getByRole('group', { name })
export const flowLive = (canvasElement: HTMLElement): HTMLElement =>
	canvasElement.querySelector<HTMLElement>('.base-flow-map-3d__sr[role="status"]')!
export const waitForCanvas = (canvasElement: HTMLElement): Promise<void> =>
	waitFor(
		() => {
			expect(canvasElement.querySelector('canvas')).not.toBeNull()
			expect(canvasElement.querySelector('.base-flow-map-3d__status')).toBeNull()
		},
		{ timeout: 8000 },
	)
export const tagNames = (canvasElement: HTMLElement): string[] =>
	[...canvasElement.querySelectorAll('.base-flow-map-3d__tag-name')].map(tag => tag.textContent ?? '')
const isCompact = (canvasElement: HTMLElement): boolean => canvasElement.querySelector('.base-flow-map-3d--compact') !== null
export async function expectDetails(
	{ canvas, canvasElement, userEvent }: { canvas: StoryCanvas; canvasElement: HTMLElement; userEvent: StoryUser },
	text: string,
): Promise<void> {
	if (!isCompact(canvasElement)) {
		await expect(await canvas.findByRole('region', { name: 'Подробности узла' })).toHaveTextContent(text)
		return
	}
	await expect(await screen.findByRole('dialog')).toHaveTextContent(text)
	await userEvent.keyboard('{Escape}')
	await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
}

import { useFlowCanvasContext, useFlowChromeContext, useFlowMapContext } from '../../../../model/context/flowContext'

describe('контексты частей BaseFlowMap', () => {
	it.each([
		['карты', useFlowMapContext],
		['холста', useFlowCanvasContext],
		['шапки и панелей', useFlowChromeContext],
	])('часть без BaseFlowMap выше не работает: контекст %s', (_name, read) => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		expect(() => read()).toThrow('BaseFlowMap: the part must be rendered inside BaseFlowMap')
		expect(warn).toHaveBeenCalled()
	})
})

function createContext(canvas: HTMLCanvasElement): WebGLRenderingContext | WebGL2RenderingContext | null {
	try {
		return canvas.getContext('webgl2') ?? canvas.getContext('webgl') ?? null
	} catch {
		return null
	}
}

export function hasWebGL(doc: Document = document): boolean {
	const context = createContext(doc.createElement('canvas'))
	context?.getExtension('WEBGL_lose_context')?.loseContext()
	return context !== null
}

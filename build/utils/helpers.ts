import { resolve } from 'node:path'

export function isProductionMode(mode: string): boolean {
	return mode === 'production'
}

export function resolveFromRoot(...segments: string[]): string {
	return resolve(process.cwd(), ...segments)
}

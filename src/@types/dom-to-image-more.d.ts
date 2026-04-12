declare module 'dom-to-image-more' {
	export type DomToImageOptions = {
		filter?: (node: Node) => boolean
		bgcolor?: string
		width?: number
		height?: number
		quality?: number
		cacheBust?: boolean
		imagePlaceholder?: string
		style?: Partial<Record<string, string>>
	}
	export function toPng(node: Node, options?: DomToImageOptions): Promise<string>
}

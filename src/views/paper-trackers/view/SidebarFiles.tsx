// src/pages/paper-trackers/view/SidebarFiles.tsx
type FileItem = { id: number | string; name: string; size?: string; url: string }

export default function SidebarFiles({ files = [] as FileItem[] }: { files?: FileItem[] }) {
	if (!files.length) {
		return <div className="text-sm text-gray-500">Файлы не прикреплены</div>
	}
	return (
		<div className="space-y-3">
			<div className="text-sm font-medium text-gray-600">Прикреплённые файлы</div>
			{files.map(f => (
				<a key={f.id} href={f.url} target="_blank" rel="noreferrer"
					 className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
					<div>
						<div className="font-medium">{f.name}</div>
						{!!f.size && <div className="text-xs text-gray-500">{f.size}</div>}
					</div>
					<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
						<path fill="currentColor" d="M5 20h14v-2H5v2Zm7-18L5.33 9h3.84v6h5.66V9h3.84L12 2Z"/>
					</svg>
				</a>
			))}
		</div>
	)
}

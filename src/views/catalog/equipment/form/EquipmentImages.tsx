import { useState } from 'react'
import { pub } from '@/utils/publicUrl'
import { UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { HiEye, HiTrash } from 'react-icons/hi'
import { FileType } from '@/@types/common'
import { AdaptableCard, ConfirmDialog, DoubleSidedImage } from '@/components/shared'
import { Dialog, FormItem, Upload } from '@/components/ui'
import { FormModel } from './EquipmentForm'

type IFileListProps = {
	files: FileType[]
	onFileDelete: (file: FileType) => void
}

type EquipmentImagesProps = {
	watch: UseFormWatch<FormModel>
	setValue: UseFormSetValue<FormModel>
}

const IMAGE_UPLOAD_SIZE = 10

const ImageList = ({ files, onFileDelete }: IFileListProps) => {
	const { t } = useTranslation()

	const [selectedFile, setSelectedFile] = useState<FileType | null>(null)
	const [isViewOpen, setIsViewOpen] = useState(false)
	const [isDelete, setIsDelete] = useState(false)

	const onViewOpen = (file: FileType) => {
		setSelectedFile(file)
		setIsViewOpen(true)
	}

	const onDialogClose = () => {
		setIsViewOpen(false)
		setTimeout(() => setSelectedFile(null), 300)
	}

	const onDeleteConfirmation = (file: FileType) => {
		setSelectedFile(file)
		setIsDelete(true)
	}

	const onDelete = () => {
		if (selectedFile) onFileDelete(selectedFile)
		setIsDelete(false)
	}

	return (
		<>
			{files.map((file, index) => (
				<div key={`${file.id}_${index}`} className='group relative flex rounded-sm border p-2'>
					<img
						className='h-full max-h-[140px] w-full max-w-full rounded-sm object-contain'
						src={file.file}
						alt={`Image ${index + 1}`}
					/>
					<div className='absolute inset-2 hidden items-center justify-center bg-gray-900/[.7] text-xl group-hover:flex'>
						<span
							className='cursor-pointer p-1.5 text-gray-100 hover:text-gray-300'
							onClick={() => onViewOpen(file)}
						>
							<HiEye />
						</span>
						<span
							className='cursor-pointer p-1.5 text-gray-100 hover:text-gray-300'
							onClick={() => onDeleteConfirmation(file)}
						>
							<HiTrash />
						</span>
					</div>
				</div>
			))}

			<Dialog isOpen={isViewOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
				{selectedFile && <img className='w-full' src={selectedFile.file} alt='' />}
			</Dialog>

			<ConfirmDialog
				isOpen={isDelete}
				type='danger'
				title={t('Удалить')}
				confirmButtonColor='red-600'
				onClose={() => setIsDelete(false)}
				onRequestClose={() => setIsDelete(false)}
				onCancel={() => setIsDelete(false)}
				onConfirm={onDelete}
				cancelText={t('Отменить')}
				confirmText={t('Удалить')}
			>
				<p>{t('Вы уверены, что хотите удалить это изображение?')}</p>
			</ConfirmDialog>
		</>
	)
}

const EquipmentImages = ({ setValue, watch }: EquipmentImagesProps) => {
	const { t } = useTranslation()

	const files = watch('files') || []
	const new_files = watch('new_files') || []
	const deleted_files = watch('deleted_files') || []

	const beforeUpload = (file: FileList | null) => {
		let valid: boolean | string = true
		const allowedFileType = ['image/jpeg', 'image/png']
		const maxFileSize = 5 * 1024 * 1024 // 5 MB

		if (file) {
			for (const f of file) {
				if (!allowedFileType.includes(f.type)) {
					valid = t('Пожалуйста, загрузите файл .jpeg или .png!')
				}

				if (f.size >= maxFileSize) {
					valid = t('Файл не должен превышать 5 МБ!')
				}
			}
		}

		return valid
	}

	const handleUpload = (fileList: File[]) => {
		const latestUpload = fileList.length - 1
		const image: FileType = {
			id: Date.now() + fileList.length,
			file: URL.createObjectURL(fileList[latestUpload])
		}
		setValue('files', [...files, ...[image]])
		setValue('new_files', [...(new_files || []), ...[image]])
	}

	const handleDelete = (deletedFile: FileType) => {
		const updatedFiles = files.filter((f) => f.id !== deletedFile.id)
		setValue('files', updatedFiles)

		const isNew = new_files.some((f) => f.id === deletedFile.id)

		if (!isNew) {
			setValue('deleted_files', [...deleted_files, deletedFile])
		}

		if (isNew) {
			const updatedNew = new_files.filter((f) => f.id !== deletedFile.id)
			setValue('new_files', updatedNew)
		}
	}

	return (
		<AdaptableCard className='mb-4 max-h-[60vh] w-full'>
			<h5>{t('Фото продукта')}</h5>
			<p className='mb-6'>{t('Добавить или изменить изображение для продукта')}</p>

			<FormItem>
				{files.length > 0 ? (
					<div
						// className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3'
						className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'
					>
						<ImageList files={files} onFileDelete={handleDelete} />

						{files.length < IMAGE_UPLOAD_SIZE && (
							<Upload
								draggable
								className='min-h-fit'
								beforeUpload={beforeUpload}
								showList={false}
								onChange={(fileList) => handleUpload(fileList)}
							>
								<div className='flex max-w-full flex-col items-center justify-center px-4 py-2'>
									<DoubleSidedImage
										src={pub('/img/others/upload.png')}
										darkModeSrc={pub('/img/others/upload-dark.png')}
									/>
									<p className='text-center font-semibold text-gray-800 dark:text-white'>
										{t('Загрузить')}
									</p>
								</div>
							</Upload>
						)}
					</div>
				) : (
					<Upload
						draggable
						beforeUpload={beforeUpload}
						showList={false}
						onChange={(fileList) => handleUpload(fileList)}
					>
						<div className='my-16 text-center'>
							<DoubleSidedImage
								className='mx-auto'
								src={pub('/img/others/upload.png')}
								darkModeSrc={pub('/img/others/upload-dark.png')}
							/>
							<p className='mx-auto max-w-[200px] font-semibold text-gray-800 dark:text-white'>
								<Trans
									i18nKey='Переместите или загрузите сюда своё изображение'
									components={{
										span: <span className='text-blue-500' />
									}}
								/>
							</p>
							{/*<p className='mx-auto max-w-[200px] font-semibold text-gray-800 dark:text-white'>*/}
							{/*	Переместите или <span className='text-blue-500'>загрузите</span> сюда своё*/}
							{/*	изображение*/}
							{/*</p>*/}
							<p className='mx-auto mt-1 max-w-[200px] opacity-60 dark:text-white'>
								{t('Форматы')}: jpeg, png
							</p>
						</div>
					</Upload>
				)}

				{files.length === 0 && (
					<p className='mt-2 text-center text-sm text-gray-500'>{t('Нет изображений')}</p>
				)}
			</FormItem>
		</AdaptableCard>
	)
}

export default EquipmentImages

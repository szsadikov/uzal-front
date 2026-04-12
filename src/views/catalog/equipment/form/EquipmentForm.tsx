import { forwardRef } from 'react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AiOutlineSave } from 'react-icons/ai'
import { FileType } from '@/@types/common'
import { MeasureUnitEnum, TechCharacteristicItem } from '@/@types/tech.types'
import { StickyFooter } from '@/components/shared'
import { Button } from '@/components/ui'
import BasicInformationFields from './BasicInformationFields'
import CharacteristicsFields from './CharacteristicsFields'
import EquipmentImages from './EquipmentImages'

export type FormModel = {
	model_name_ru: string
	model_name_uz: string
	manufacturer: number | null
	country: string
	type: number | null
	measure_unit: MeasureUnitEnum | null
	code_1c: string
	ikpu_code: string
	description: string
	characteristics: TechCharacteristicItem[] | null
	files: FileType[]
	new_files?: FileType[]
	deleted_files?: FileType[]
}

type Props = {
	defaultValues?: FormModel
	type: 'edit' | 'new'
	onDiscard?: () => void
	onFormSubmit: (formData: FormModel) => void
	isSubmitting: boolean
}

const EquipmentForm = forwardRef<HTMLFormElement, Props>(
	({ defaultValues = {} as FormModel, onFormSubmit, isSubmitting, onDiscard }, ref) => {
		const { t } = useTranslation()

		const { control, handleSubmit, setValue, watch } = useForm<FormModel>({
			mode: 'onChange',
			defaultValues
		})

		const {
			fields: characterFields,
			append: characterAppend,
			remove: characterRemove
		} = useFieldArray({
			control,
			name: 'characteristics'
		})

		const onSubmit: SubmitHandler<FormModel> = (data) => {
			const formData: FormModel = {
				...data,
				model_name_uz: data.model_name_ru
			}
			onFormSubmit(formData)
		}

		return (
			<form ref={ref} onSubmit={handleSubmit(onSubmit)}>
				{/* Container: mobileda flex-column, lg dan boshlab grid 3 column */}
				<div className='flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-start'>
					{/* O'ng blok (Images) — MOBILDA BIRINCHI, DESKTOPDA O‘NGGA (oxiriga) */}
					<div className='order-first lg:order-last lg:col-span-1'>
						<EquipmentImages setValue={setValue} watch={watch} />
					</div>

					{/* Chap katta blok (Basic + Characteristics) — Desktopda 2-column */}
					<div className='order-last flex flex-col gap-4 lg:order-first lg:col-span-2'>
						<BasicInformationFields control={control} isSubmitting={isSubmitting} />

						<CharacteristicsFields
							control={control}
							fields={characterFields}
							append={characterAppend}
							remove={characterRemove}
							isSubmitting={isSubmitting}
						/>
					</div>
				</div>

				<StickyFooter
					className='-mx-8 flex items-center justify-between px-8 py-4'
					stickyClass='border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
				>
					<div className='ml-auto items-center md:flex'>
						<Button
							size='sm'
							className='ltr:mr-3 rtl:ml-3'
							type='button'
							disabled={!onDiscard}
							onClick={() => onDiscard && onDiscard()}
						>
							{t('Отменить')}
						</Button>

						<Button
							size='sm'
							variant='solid'
							loading={isSubmitting}
							icon={<AiOutlineSave />}
							type='submit'
						>
							{t('Сохранить')}
						</Button>
					</div>
				</StickyFooter>
			</form>

			// <form ref={ref} onSubmit={handleSubmit(onSubmit)}>
			// 	<div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
			// 		<div className='lg:col-span-2'>
			// 			<BasicInformationFields control={control} isSubmitting={isSubmitting} />
			// 			<CharacteristicsFields
			// 				control={control}
			// 				fields={characterFields}
			// 				append={characterAppend}
			// 				remove={characterRemove}
			// 				isSubmitting={isSubmitting}
			// 			/>
			// 		</div>
			// 		<div className='lg:col-span-1'>
			// 			<EquipmentImages setValue={setValue} watch={watch} />
			// 		</div>
			// 	</div>
			// 	<StickyFooter
			// 		className='-mx-8 flex items-center justify-between px-8 py-4'
			// 		stickyClass='border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
			// 	>
			// 		<div className='ml-auto items-center md:flex'>
			// 			<Button
			// 				size='sm'
			// 				className='ltr:mr-3 rtl:ml-3'
			// 				type='button'
			// 				disabled={!onDiscard}
			// 				onClick={() => onDiscard && onDiscard()}
			// 			>
			// 				{t('Отменить')}
			// 			</Button>
			// 			<Button
			// 				size='sm'
			// 				variant='solid'
			// 				loading={isSubmitting}
			// 				icon={<AiOutlineSave />}
			// 				type='submit'
			// 			>
			// 				{t('Сохранить')}
			// 			</Button>
			// 		</div>
			// 	</StickyFooter>
			// </form>
		)
	}
)

EquipmentForm.displayName = 'EquipmentForm'

export default EquipmentForm

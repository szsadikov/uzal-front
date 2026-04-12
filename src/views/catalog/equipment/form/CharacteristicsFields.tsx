import { Fragment } from 'react'
import {
	Control,
	Controller,
	FieldArrayWithId,
	UseFieldArrayAppend,
	UseFieldArrayRemove
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineTrash, HiPlusCircle } from 'react-icons/hi'
import { AdaptableCard } from '@/components/shared'
import { Button, FormItem, Input } from '@/components/ui'
import { FormModel } from './EquipmentForm'

type CharacteristicsFieldsProps = {
	control: Control<FormModel>
	fields: FieldArrayWithId<FormModel, 'characteristics'>[]
	append: UseFieldArrayAppend<FormModel, 'characteristics'>
	remove: UseFieldArrayRemove
	isSubmitting?: boolean
}

const CHARACTERS_MAX_SIZE = 10

const CharacteristicsFields = ({
	control,
	fields,
	append,
	remove,
	isSubmitting
}: CharacteristicsFieldsProps) => {
	const { t } = useTranslation()

	return (
		<AdaptableCard divider className='mb-4'>
			<h5>{t('Характеристики')}</h5>
			<p className='mb-6'>{t('Раздел для настройки характеристик продукте')}</p>

			{fields.length ? (
				<div className='grid grid-cols-[1fr_1fr_36px] items-center gap-4'>
					{fields.map((field, index) => (
						<Fragment key={field.id}>
							<Controller
								control={control}
								name={`characteristics.${index}.name` as const}
								render={({ field, fieldState: { invalid, error } }) => (
									<FormItem
										className='mb-0'
										invalid={invalid}
										errorMessage={error && error.message}
									>
										<Input
											type='text'
											placeholder={t('Название характеристики')}
											value={field.value}
											onChange={field.onChange}
											invalid={invalid}
										/>
									</FormItem>
								)}
							/>

							<Controller
								control={control}
								name={`characteristics.${index}.description` as const}
								render={({ field, fieldState: { invalid, error } }) => (
									<FormItem
										className='mb-0'
										invalid={invalid}
										errorMessage={error && error.message}
									>
										<Input
											type='text'
											placeholder={t('Описание характеристики')}
											value={field.value}
											onChange={field.onChange}
											invalid={invalid}
										/>
									</FormItem>
								)}
							/>

							<Button
								className='text-red-600 hover:text-red-500 active:text-red-700'
								variant='plain'
								size='sm'
								icon={<HiOutlineTrash />}
								type='button'
								onClick={() => remove(index)}
							/>
						</Fragment>
					))}
				</div>
			) : (
				<p className='text-red-500'>{t('Нет добавленных характеристик')}</p>
			)}

			<Button
				className='mt-4 w-max'
				variant='plain'
				size='sm'
				disabled={isSubmitting || fields.length >= CHARACTERS_MAX_SIZE}
				icon={
					<HiPlusCircle className='text-indigo-600 hover:text-indigo-500 active:text-indigo-700' />
				}
				type='button'
				onClick={() => append({ name: '', description: '' })}
			>
				{t('Добавить')}
			</Button>
		</AdaptableCard>
	)
}

export default CharacteristicsFields

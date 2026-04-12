import { Field, FieldProps } from 'formik'
import { DatePicker, FormItem, Input } from '@/components/ui'
import { formatDate } from '@/utils/format'

export default function ExpeditorTab() {
	return (
		<section className="space-y-4">
			{/*<h3 className="text-lg font-semibold">Экспедитор</h3>*/}

			{/* Дизайн bo‘yicha: Полис страховки № / дата */}
			<FormItem label="Полис страховки">
				<div className="grid grid-cols-2 gap-2">
					<Field name="exp_insurance_number">
						{({ field, form }: FieldProps) => (
							<Input
								field={field}
								form={form}
								placeholder="№"
								onChange={(e) => form.setFieldValue(field.name, e.target.value)}
								className="h-11 rounded-md"
							/>
						)}
					</Field>

					<Field name="exp_insurance_date">
						{({ field, form }: FieldProps) => (
							<DatePicker
								field={field}
								form={form}
								placeholder="YYYY-MM-DD"
								clearable
								onChange={(d) =>
									form.setFieldValue(field.name, d ? formatDate(d, 'YYYY-MM-DD') : '')
								}
								className="h-11"
							/>
						)}
					</Field>
				</div>
			</FormItem>
		</section>
	)
}

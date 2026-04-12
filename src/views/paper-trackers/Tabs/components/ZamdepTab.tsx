// ZamdepTab.tsx
import { Field, FieldProps } from 'formik'
import { DatePicker, FormItem } from '@/components/ui'
import { formatDate } from '@/utils/format'

export default function ZamdepTab() {
	return (
		<section className="space-y-4">
			{/*<h3 className="text-lg font-semibold">Зампред</h3>*/}
			<FormItem label="Дата">
				<Field name="zamdep_date">
					{({ field, form }: FieldProps) => (
						<DatePicker
							field={field}
							form={form}
							placeholder="YYYY-MM-DD"
							clearable
							onChange={(d) => form.setFieldValue(field.name, d ? formatDate(d, 'YYYY-MM-DD') : '')}
							className="h-11"
						/>
					)}
				</Field>
			</FormItem>
		</section>
	)
}

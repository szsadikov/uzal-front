// MonitoringTab.tsx
import { Field, FieldProps } from 'formik'
import { DatePicker, FormItem, Input } from '@/components/ui'
import { formatDate } from '@/utils/format'

export default function MonitoringTab() {
	return (
		<section className="space-y-4">
			{/*<h3 className="text-lg font-semibold">Мониторинг</h3>*/}

			<FormItem label="Қабул қилиш-тов. далолатномаси № / дата">
				<div className="grid grid-cols-2 gap-2">
					<Field name="mon_act_number">
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
					<Field name="mon_act_date">
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
				</div>
			</FormItem>

			<FormItem label="Бўлимда қайд этилди № / дата">
				<div className="grid grid-cols-2 gap-2">
					<Field name="mon_reg_number">
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
					<Field name="mon_reg_date">
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
				</div>
			</FormItem>
		</section>
	)
}

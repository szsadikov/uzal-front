// MarketingTab.tsx
import { Field, FieldProps } from 'formik'
import { DatePicker, FormItem, Input } from '@/components/ui'
import { formatDate } from '@/utils/format'

export default function MarketingTab() {
	return (
		<section className="space-y-4">
			{/*<h3 className="text-lg font-semibold">Маркетинг</h3>*/}

			<FormItem label="Филиал эксперт қарори № / дата">
				<div className="grid grid-cols-2 gap-2">
					<Field name="mkt_exp_number">
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
					<Field name="mkt_exp_date">
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

			<FormItem label="Қайд этилди № / дата">
				<div className="grid grid-cols-2 gap-2">
					<Field name="mkt_reg_number">
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
					<Field name="mkt_reg_date">
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

			<FormItem label="Таъминот билан тузилган шартнома">
				<Field name="mkt_has_guarantee">
					{({ field, form }: FieldProps) => (
						<Input
							field={field}
							form={form}
							placeholder="Масалан, 25/02-4-25к"
							onChange={(e) => form.setFieldValue(field.name, e.target.value)}
							className="h-11 rounded-md"
						/>
					)}
				</Field>
			</FormItem>
		</section>
	)
}

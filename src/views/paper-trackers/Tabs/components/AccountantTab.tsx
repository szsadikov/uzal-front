// AccountantTab.tsx
import { Field, FieldProps } from 'formik'
import { DatePicker, FormItem, Input } from '@/components/ui'
import { formatDate } from '@/utils/format'

export default function AccountantTab() {
	return (
		<section className="space-y-4">
			{/*<h3 className="text-lg font-semibold">Бухгалтер</h3>*/}

			<FormItem label="Сумма аванса">
				<Field name="acc_advance">
					{({ field, form }: FieldProps) => (
						<Input
							field={field}
							form={form}
							placeholder="Сумма"
							onChange={(e) => form.setFieldValue(field.name, e.target.value)}
							className="h-11 rounded-md"
						/>
					)}
				</Field>
			</FormItem>

			<FormItem label="Пошлина за регистрацию">
				<Field name="acc_reg_fee">
					{({ field, form }: FieldProps) => (
						<Input
							field={field}
							form={form}
							placeholder="Сумма"
							onChange={(e) => form.setFieldValue(field.name, e.target.value)}
							className="h-11 rounded-md"
						/>
					)}
				</Field>
			</FormItem>

			<div className="grid grid-cols-2 gap-4">
				<FormItem label="Счет фактура — дата">
					<Field name="acc_invoice_date">
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

				<FormItem label="Сургут акты № / дата">
					<div className="grid grid-cols-2 gap-2">
						<Field name="acc_act_number">
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
						<Field name="acc_act_date">
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
			</div>
		</section>
	)
}

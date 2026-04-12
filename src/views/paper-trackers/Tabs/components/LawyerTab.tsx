// LawyerTab.tsx
import { Field, FieldProps } from 'formik'
import { FormItem, Input } from '@/components/ui'

export default function LawyerTab() {
	return (
		<section className="space-y-4">
			{/*<h3 className="text-lg font-semibold">Юрист</h3>*/}

			<FormItem label="Шартнома рақами">
				<Field name="law_contract_num">
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
			</FormItem>

			<FormItem label="Таъминот шартномаси (реестр/изоҳ)">
				<Field name="law_guarantee_info">
					{({ field, form }: FieldProps) => (
						<Input
							field={field}
							form={form}
							placeholder="25/02-4-25к ..."
							onChange={(e) => form.setFieldValue(field.name, e.target.value)}
							className="h-11 rounded-md"
						/>
					)}
				</Field>
			</FormItem>
		</section>
	)
}

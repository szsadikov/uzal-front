// FinancierTab.tsx
import { Field } from 'formik'
import { Checkbox, FormItem } from '@/components/ui'

export default function FinancierTab() {
	return (
		<section className="space-y-4">
			{/*<h3 className="text-lg font-semibold">Финансист</h3>*/}

			<FormItem>
				<div className="flex items-center justify-between">
					<div className="text-sm">Молиявий ҳолати</div>
					<Field name="financier_ok">
						{({ field, form }: any) => (
							<Checkbox
								checked={!!field.value}
								onChange={(v) => form.setFieldValue(field.name, v)}
							/>
						)}
					</Field>
				</div>
			</FormItem>

			<FormItem>
				<div className="flex items-center justify-between">
					<div className="text-sm">Қарздорлиги мавжуд эмас</div>
					<Field name="financier_no_debt">
						{({ field, form }: any) => (
							<Checkbox
								checked={!!field.value}
								onChange={(v) => form.setFieldValue(field.name, v)}
							/>
						)}
					</Field>
				</div>
			</FormItem>
		</section>
	)
}

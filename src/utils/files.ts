import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'

export const exportToExcel = async <T extends object>(data: T[], fileName: string) => {
	const workbook = new Workbook()
	const worksheet = workbook.addWorksheet('Данные')

	worksheet.columns = Object.keys(data[0] || {}).map((key) => ({
		header: key.toUpperCase(),
		key,
		width: 20
	}))

	worksheet.getRow(1).eachCell((cell) => {
		cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF007ACC' }
		}
		cell.alignment = { vertical: 'middle', horizontal: 'center' }
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' }
		}
	})

	data.forEach((row) => {
		worksheet.addRow(row)
	})

	worksheet.eachRow((row) => {
		row.eachCell((cell) => {
			cell.alignment = { vertical: 'middle', horizontal: 'left' }
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			}
		})
	})

	const buffer = await workbook.xlsx.writeBuffer()
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	})
	saveAs(blob, `${fileName}.xlsx`)
}

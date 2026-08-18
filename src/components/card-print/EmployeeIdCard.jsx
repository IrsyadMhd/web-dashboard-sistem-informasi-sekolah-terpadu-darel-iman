import EmployeeCardHorizontal from './EmployeeCardHorizontal'
import EmployeeCardVertical from './EmployeeCardVertical'

export default function EmployeeIdCard({
  orientation = 'horizontal',
  employee,
  template = 'green',
  pengaturan = {},
  formatDate,
  qrPayload,
  isPrint = false,
}) {
  if (orientation === 'horizontal') {
    return (
      <EmployeeCardHorizontal
        employee={employee}
        template={template}
        pengaturan={pengaturan}
        formatDate={formatDate}
        qrPayload={qrPayload}
        isPrint={isPrint}
      />
    )
  }

  return (
    <EmployeeCardVertical
      employee={employee}
      template={template}
      pengaturan={pengaturan}
      formatDate={formatDate}
      qrPayload={qrPayload}
      isPrint={isPrint}
    />
  )
}

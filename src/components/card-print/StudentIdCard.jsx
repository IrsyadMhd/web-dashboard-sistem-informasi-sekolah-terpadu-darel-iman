import StudentCardHorizontal from './StudentCardHorizontal'
import StudentCardVertical from './StudentCardVertical'

export default function StudentIdCard({
  data,
  config = {},
  theme = {},
  pengaturan = {},
  qrToken = '',
  formatDate,
  isPrint = false,
}) {
  const orientation = config.orientation || 'horizontal'

  if (orientation === 'horizontal') {
    return (
      <StudentCardHorizontal
        data={data}
        config={config}
        theme={theme}
        pengaturan={pengaturan}
        qrToken={qrToken}
        formatDate={formatDate}
        isPrint={isPrint}
      />
    )
  }

  return (
    <StudentCardVertical
      data={data}
      config={config}
      theme={theme}
      pengaturan={pengaturan}
      qrToken={qrToken}
      formatDate={formatDate}
      isPrint={isPrint}
    />
  )
}

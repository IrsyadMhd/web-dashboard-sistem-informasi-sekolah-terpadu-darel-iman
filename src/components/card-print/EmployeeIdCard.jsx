import EmployeeCardHorizontal from './EmployeeCardHorizontal'
import EmployeeCardVertical from './EmployeeCardVertical'
import EmployeeCardBackHorizontal from './EmployeeCardBackHorizontal'
import EmployeeCardBackVertical from './EmployeeCardBackVertical'

export default function EmployeeIdCard({
  orientation = 'horizontal',
  employee,
  template = 'green',
  pengaturan = {},
  formatDate,
  qrPayload,
  isPrint = false,
  isEditing = false,
  layoutConfig = {},
  frameStyle = 'standard',
  photoShape = 'rounded',
  showPattern = true,
  showWave = true,
  headerMotto = 'Berilmu, Berakhlak, Beramal',
  footerMotto = 'Generasi Beriman, Berilmu,\nBerakhlak Mulia',
  cardSide = 'front',
  backTitle = 'KETENTUAN KARTU PEGAWAI',
  backRules = '1. Kartu ini adalah milik resmi Yayasan Dar el-Iman.\n2. Wajib dibawa & dikenakan selama jam kerja.\n3. Apabila menemukan kartu ini, harap mengembalikan ke kantor yayasan.\n4. QR Code digunakan untuk absensi & verifikasi SIMSIT.',
  backAddress = 'Jl. Gajah Mada No. 28 Padang, Sumatera Barat\nTelp: (0751) 123456 | Website: dareliman.or.id',
  backShowQr = true,
  onElementMove,
}) {
  const cardProps = {
    employee,
    template,
    pengaturan,
    formatDate,
    qrPayload,
    isPrint,
    isEditing,
    layoutConfig,
    frameStyle,
    photoShape,
    showPattern,
    showWave,
    headerMotto,
    footerMotto,
    backTitle,
    backRules,
    backAddress,
    backShowQr,
    onElementMove,
  }

  if (cardSide === 'back') {
    if (orientation === 'horizontal') {
      return <EmployeeCardBackHorizontal {...cardProps} />
    }
    return <EmployeeCardBackVertical {...cardProps} />
  }

  if (orientation === 'horizontal') {
    return <EmployeeCardHorizontal {...cardProps} />
  }

  return <EmployeeCardVertical {...cardProps} />
}


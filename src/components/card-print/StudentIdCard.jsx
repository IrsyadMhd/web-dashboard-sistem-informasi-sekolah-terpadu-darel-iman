import StudentCardHorizontal from './StudentCardHorizontal'
import StudentCardVertical from './StudentCardVertical'
import StudentCardBackHorizontal from './StudentCardBackHorizontal'
import StudentCardBackVertical from './StudentCardBackVertical'

export default function StudentIdCard({
  data,
  config = {},
  theme = {},
  pengaturan = {},
  qrToken = '',
  formatDate,
  isPrint = false,
  cardSide = 'front',
  backTitle = 'TATA TERTIB SISWA',
  backRules = '1. Kartu ini adalah kartu identitas resmi siswa Yayasan Dar el-Iman.\n2. Wajib dibawa & dikenakan selama jam KBM sekolah.\n3. Apabila menemukan kartu ini, harap mengembalikan ke piket sekolah.\n4. QR Code digunakan untuk absensi gerbang & verifikasi SIMSIT.',
  backAddress = 'Jl. Gajah Mada No. 28 Padang, Sumatera Barat\nTelp: (0751) 123456 | Website: dareliman.or.id',
  frameStyle = 'standard',
  photoShape = 'rounded',
  showPattern = true,
  showWave = true,
  headerMotto = 'Berilmu, Berakhlak, Beramal',
  footerMotto = 'Sekolah Unggulan\nBerbasis Al-Qur\'an',
  backShowQr = true,
}) {
  const orientation = config.orientation || 'horizontal'

  const cardProps = {
    data,
    config,
    theme,
    pengaturan,
    qrToken,
    formatDate,
    isPrint,
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
  }

  if (cardSide === 'back') {
    if (orientation === 'horizontal') {
      return <StudentCardBackHorizontal {...cardProps} />
    }
    return <StudentCardBackVertical {...cardProps} />
  }

  if (orientation === 'horizontal') {
    return <StudentCardHorizontal {...cardProps} />
  }

  return <StudentCardVertical {...cardProps} />
}

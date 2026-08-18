import { QRCodeSVG } from 'qrcode.react'
import {
  BookOpen,
  CalendarDays,
  Droplets,
  IdCard,
  School,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { FaGraduationCap, FaQrcode } from 'react-icons/fa'
import PersonAvatar from '../ui/PersonAvatar'

export default function StudentCardVertical({
  data,
  config = {},
  theme = {},
  pengaturan = {},
  qrToken = '',
  formatDate,
  isPrint = false,
}) {
  if (!data) return null

  const {
    showPhoto = true,
    showLogo = true,
    showQr = true,
    showNis = true,
    showNisn = true,
    showClass = true,
    showRombel = true,
    showUnit = true,
    showAcademicYear = false,
    showMotto = true,
  } = config

  const sekolah = pengaturan?.school_name || pengaturan?.namaSekolah || 'YAYASAN DAR EL-IMAN'
  const logo = pengaturan?.logo_url || pengaturan?.logoUrl || ''
  const brandTitle = sekolah.replace(/^YAYASAN\s*/i, '').replace(/\s*-\s*/g, '-').trim()

  const primaryColor = theme.primary || '#0E5C44'
  const darkColor = theme.dark || '#064e3b'
  const accentColor = theme.accent || '#F6C143'

  const formattedDateVal = formatDate ? formatDate(data.tanggalLahir) : (data.tanggalLahir || '-')

  const BrandMarkInverted = () => (
    <div className="flex items-center gap-2 text-left">
      {showLogo && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-white">
          {logo ? (
            <img src={logo} alt="Logo situs" className="h-full w-full object-contain" crossOrigin="anonymous" />
          ) : (
            <FaGraduationCap className="text-xl" />
          )}
        </span>
      )}
      <span className="min-w-0">
        <small className="block text-[6px] font-black uppercase leading-none tracking-[0.16em] text-white/70">
          Yayasan
        </small>
        <strong className="mt-0.5 block max-w-[220px] truncate text-[11px] font-black uppercase leading-none tracking-tight text-white">
          {brandTitle}
        </strong>
        <small className="mt-1 block whitespace-nowrap text-[6px] font-semibold leading-none text-white/80">
          Islamic School
        </small>
      </span>
    </div>
  )

  const StudentPhotoVertical = () => (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-lg"
      style={{ backgroundColor: data.foto ? undefined : primaryColor }}
    >
      <PersonAvatar
        src={data.foto}
        name={data.nama}
        size="profile"
        className="h-[118px]! w-[100px]! border-0 shadow-none rounded-[16px]"
      />
    </div>
  )

  const AttendanceQr = () => (
    <div className="student-card-qr rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-slate-300">
      {qrToken ? (
        <QRCodeSVG value={qrToken} size={68} level="M" marginSize={4} />
      ) : (
        <FaQrcode style={{ width: 68, height: 68 }} className="text-slate-300" />
      )}
    </div>
  )

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex shrink-0 items-center justify-center" style={{ color: primaryColor }}>
        <Icon className="h-3 w-3" strokeWidth={2.4} />
      </span>
      <span className="grid min-w-0 flex-1 grid-cols-[68px_8px_minmax(0,1fr)] items-baseline text-slate-800">
        <small className="text-[7px] font-medium">{label}</small>
        <b className="text-[8px]">:</b>
        <strong className="truncate text-[7.5px] font-black">{value}</strong>
      </span>
    </div>
  )

  const cardClass = isPrint
    ? 'student-card-print-canvas--vertical aspect-[54/86] w-[320px] h-[510px]'
    : 'aspect-[54/86] w-full max-w-[320px] rounded-2xl shadow-2xl'

  return (
    <article
      id={isPrint ? undefined : 'printable-student-card'}
      className={`${cardClass} relative flex shrink-0 overflow-hidden bg-white text-center`}
      style={{ border: isPrint ? undefined : `1px solid ${primaryColor}40` }}
    >
      <div className="relative z-10 h-full w-full">
        <span
          className="absolute left-0 right-0 top-0 h-[28%] rounded-b-[52%]"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${darkColor})`,
            borderBottom: `4px solid ${accentColor}`,
          }}
        />
        <span
          className="absolute left-0 right-0 top-0 h-[28%] opacity-10"
          style={{
            backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '13px 13px',
          }}
        />

        <div className="absolute left-[8%] right-[8%] top-[5%]">
          <BrandMarkInverted />
        </div>
        {showMotto && (
          <p className="absolute left-[36%] right-[5%] top-[16%] text-left text-[7px] italic leading-relaxed text-white/90">
            Berilmu, Berakhlak, Beramal
            <br />
            Untuk Meraih Ridha Allah
          </p>
        )}

        {showPhoto && (
          <div className="absolute left-1/2 top-[17.5%] h-[22%] w-[38%] -translate-x-1/2">
            <StudentPhotoVertical />
          </div>
        )}

        <div className={`absolute left-[8%] right-[8%] ${showPhoto ? 'top-[40.5%]' : 'top-[29%]'}`}>
          <h4 className="truncate text-[14px] font-black uppercase leading-tight" style={{ color: darkColor }}>
            {data.nama}
          </h4>
          {showUnit && (
            <p
              className="mx-auto mt-1 w-fit max-w-full truncate rounded-md px-4 py-1 text-[7px] font-black text-white"
              style={{ background: primaryColor }}
            >
              {data.unit}
            </p>
          )}

          <div className="mt-3 space-y-2 text-left">
            {showNis && <DetailRow icon={IdCard} label="NIS" value={data.nis} />}
            {showNisn && <DetailRow icon={ShieldCheck} label="NISN" value={data.nisn} />}
            {showClass && (
              <DetailRow
                icon={UserRound}
                label="Kelas"
                value={`${data.kelas}${showRombel && data.rombel !== '-' ? ` / ${data.rombel}` : ''}`}
              />
            )}
            {!showClass && showRombel && <DetailRow icon={UserRound} label="Rombel" value={data.rombel} />}
            <DetailRow icon={CalendarDays} label="Tanggal Lahir" value={formattedDateVal} />
            <DetailRow icon={Droplets} label="Gol. Darah" value={data.golonganDarah} />
            {showAcademicYear && <DetailRow icon={School} label="Tahun Ajaran" value={data.tahunAjaran} />}
          </div>
        </div>

        {showQr && (
          <div className="absolute bottom-[12%] left-1/2 flex -translate-x-1/2 flex-col items-center rounded-xl border border-slate-300 bg-white p-2 shadow-sm">
            <AttendanceQr />
            <b className="mt-1 w-full rounded py-1 text-[7px] text-white" style={{ background: primaryColor }}>
              ID CARD
            </b>
            <small className="mt-1 text-[6px] text-slate-500">Scan untuk verifikasi</small>
          </div>
        )}

        <span
          className="absolute -bottom-[5%] -left-[10%] h-[17%] w-[120%] rounded-[50%_50%_0_0]"
          style={{
            background: `linear-gradient(115deg, ${darkColor}, ${primaryColor})`,
            borderTop: `4px solid ${accentColor}`,
          }}
        />
        <div className="absolute bottom-[3.6%] left-[8%] flex items-center gap-2 text-left text-white">
          <BookOpen className="h-6 w-6" strokeWidth={1.5} />
          <p className="text-[6.5px] font-semibold leading-tight">
            Sekolah Unggulan
            <br />
            Berbasis Al-Qur'an
          </p>
        </div>
        <p className="absolute bottom-[3.6%] right-[8%] border-l border-white/40 pl-4 text-left text-[6.5px] font-bold text-white">
          TAHUN AJARAN
          <br />
          {data.tahunAjaran}
        </p>
      </div>
    </article>
  )
}

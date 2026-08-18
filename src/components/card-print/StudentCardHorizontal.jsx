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

export default function StudentCardHorizontal({
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
  } = config

  const sekolah = pengaturan?.school_name || pengaturan?.namaSekolah || 'YAYASAN DAR EL-IMAN'
  const logo = pengaturan?.logo_url || pengaturan?.logoUrl || ''
  const brandTitle = sekolah.replace(/^YAYASAN\s*/i, '').replace(/\s*-\s*/g, '-').trim()

  const primaryColor = theme.primary || '#0E5C44'
  const darkColor = theme.dark || '#064e3b'
  const softColor = theme.soft || '#ecfdf5'
  const accentColor = theme.accent || '#F6C143'

  const formattedDateVal = formatDate ? formatDate(data.tanggalLahir) : (data.tanggalLahir || '-')

  const BrandMark = () => (
    <div className="flex items-center gap-2 text-left">
      {showLogo && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center" style={{ color: darkColor }}>
          {logo ? (
            <img src={logo} alt="Logo situs" className="h-full w-full object-contain" crossOrigin="anonymous" />
          ) : (
            <FaGraduationCap className="text-2xl" />
          )}
        </span>
      )}
      <span className="min-w-0">
        <small className="block text-[6px] font-black uppercase leading-none tracking-[0.16em]" style={{ color: primaryColor }}>
          Yayasan
        </small>
        <strong className="mt-0.5 block max-w-[220px] truncate text-[15px] font-black uppercase leading-none tracking-tight" style={{ color: darkColor }}>
          {brandTitle}
        </strong>
        <small className="mt-1 block whitespace-nowrap text-[6px] font-semibold leading-none text-slate-400">
          Islamic School
        </small>
      </span>
    </div>
  )

  const StudentPhoto = () => (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100 shadow-sm"
      style={{ backgroundColor: data.foto ? undefined : primaryColor }}
    >
      <PersonAvatar
        src={data.foto}
        name={data.nama}
        size="card"
        className="h-full! w-full! border-0 shadow-none rounded-[12px]"
      />
    </div>
  )

  const AttendanceQr = () => (
    <div className="student-card-qr rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-slate-300">
      {qrToken ? (
        <QRCodeSVG value={qrToken} size={78} level="M" marginSize={4} />
      ) : (
        <FaQrcode style={{ width: 78, height: 78 }} className="text-slate-300" />
      )}
    </div>
  )

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex shrink-0 items-center justify-center" style={{ color: primaryColor }}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
      <span className="grid min-w-0 flex-1 grid-cols-[62px_8px_minmax(0,1fr)] items-baseline text-slate-800">
        <small className="text-[8px] font-medium">{label}</small>
        <b className="text-[8px]">:</b>
        <strong className="truncate text-[9px] font-black">{value}</strong>
      </span>
    </div>
  )

  const cardClass = isPrint
    ? 'student-card-print-canvas--horizontal aspect-[86/54] w-[560px] h-[351px]'
    : 'aspect-[86/54] w-full max-w-[560px] rounded-2xl shadow-2xl'

  return (
    <article
      id={isPrint ? undefined : 'printable-student-card'}
      className={`${cardClass} relative flex shrink-0 overflow-hidden bg-white`}
      style={{ border: isPrint ? undefined : `1px solid ${primaryColor}40` }}
    >
      <div className="relative z-10 h-full w-full">
        <span
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
            backgroundSize: '13px 13px',
          }}
        />
        <span className="absolute -right-20 -top-24 h-40 w-64 rounded-[50%]" style={{ background: softColor }} />
        <div className="absolute left-[4%] top-[6%]">
          <BrandMark />
        </div>
        <span
          className="absolute right-0 top-0 rounded-bl-[28px] px-5 py-3 text-[9px] font-black tracking-wider text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${darkColor})` }}
        >
          KARTU SISWA
        </span>

        {showPhoto && (
          <div className="absolute left-[5.8%] top-[31%] h-[45%] w-[25.8%]">
            <StudentPhoto />
          </div>
        )}
        {showUnit && (
          <span
            className="absolute left-[5.8%] top-[78.5%] w-[25.8%] truncate rounded-md px-2 py-1 text-center text-[7px] font-black text-white"
            style={{ background: primaryColor }}
          >
            {data.unit}
          </span>
        )}

        <div className={`absolute top-[31%] min-w-0 ${showPhoto ? 'left-[36%] right-[31%]' : 'left-[6%] right-[31%]'}`}>
          <p className="text-[7px] font-medium text-slate-500">Nama</p>
          <h4 className="truncate text-[13px] font-black uppercase leading-tight text-slate-950">{data.nama}</h4>
          <div className="mt-2.5 space-y-2">
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
          <div className="absolute right-[5%] top-[38%] flex w-[22%] flex-col items-center rounded-xl border border-slate-300 bg-white p-2 shadow-sm">
            <AttendanceQr />
            <b className="mt-1 w-full rounded py-1 text-center text-[7px] text-white" style={{ background: primaryColor }}>
              ID CARD
            </b>
            <small className="mt-1 text-[6px] text-slate-500">Scan untuk verifikasi</small>
          </div>
        )}

        <span
          className="absolute -bottom-[26%] -left-[9%] h-[44%] w-[92%] -rotate-2 rounded-[50%]"
          style={{
            background: `linear-gradient(115deg, ${darkColor}, ${primaryColor})`,
            borderTop: `4px solid ${accentColor}`,
          }}
        />
        <span
          className="absolute -bottom-[23%] right-[-9%] h-[39%] w-[43%] rotate-2 rounded-[58%_0_0_0]"
          style={{ background: `linear-gradient(130deg, ${accentColor}, #d89b13)` }}
        />
        <div className="absolute bottom-[5%] left-[5%] flex items-center gap-2 text-white">
          <BookOpen className="h-6 w-6" strokeWidth={1.5} />
          <p className="text-[7px] font-semibold leading-tight">
            Sekolah Unggulan
            <br />
            Berbasis Al-Qur'an
          </p>
        </div>
        <p className="absolute bottom-[7%] left-[37%] text-[7px] font-medium text-white/90">www.dareliman.sch.id</p>
        <div className="absolute bottom-[4%] right-[4%] w-[23%] text-center text-white">
          <svg viewBox="0 0 120 34" className="mx-auto h-7 w-[86%]" aria-hidden="true">
            <path
              d="M8 26C24 4 23 3 18 29C40 5 31 30 50 14C42 36 65 10 58 28C74 16 77 28 111 23"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-[6.5px] font-bold uppercase">Kepala Sekolah</p>
        </div>
      </div>
    </article>
  )
}

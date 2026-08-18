import React from 'react'
import MutabaahSubNav from '../../components/mutabaah/MutabaahSubNav'
import MutabaahEnterprisePage from '../MutabaahEnterprisePage'

export default function MutabaahAgendaDetailPage() {
  return (
    <div data-testid="mutabaah-agenda-page" className="mutabaah-agenda-wrapper">
      <MutabaahSubNav />
      <MutabaahEnterprisePage resource="agendas" />
    </div>
  )
}

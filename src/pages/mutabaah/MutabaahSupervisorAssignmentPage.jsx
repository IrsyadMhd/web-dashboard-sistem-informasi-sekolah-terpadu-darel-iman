import React from 'react'
import MutabaahSubNav from '../../components/mutabaah/MutabaahSubNav'
import MutabaahEnterprisePage from '../MutabaahEnterprisePage'

export default function MutabaahSupervisorAssignmentPage() {
  return (
    <div data-testid="mutabaah-supervisor-assignment-page" className="mutabaah-supervisor-assignment-wrapper">
      <MutabaahSubNav />
      <MutabaahEnterprisePage resource="supervisor-assignments" />
    </div>
  )
}

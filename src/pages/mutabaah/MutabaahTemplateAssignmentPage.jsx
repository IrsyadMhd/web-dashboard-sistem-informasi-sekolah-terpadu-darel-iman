import React from 'react'
import MutabaahSubNav from '../../components/mutabaah/MutabaahSubNav'
import MutabaahEnterprisePage from '../MutabaahEnterprisePage'

export default function MutabaahTemplateAssignmentPage() {
  return (
    <div data-testid="mutabaah-template-assignment-page" className="mutabaah-template-assignment-wrapper">
      <MutabaahSubNav />
      <MutabaahEnterprisePage resource="template-assignments" />
    </div>
  )
}

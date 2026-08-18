import React from 'react'
import MutabaahSubNav from '../../components/mutabaah/MutabaahSubNav'
import MutabaahEnterprisePage from '../MutabaahEnterprisePage'

export default function MutabaahTemplatePage() {
  return (
    <div data-testid="mutabaah-template-page" className="mutabaah-template-wrapper">
      <MutabaahSubNav />
      <MutabaahEnterprisePage resource="templates" />
    </div>
  )
}

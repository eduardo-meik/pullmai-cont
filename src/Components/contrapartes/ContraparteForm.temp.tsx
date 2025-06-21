// Temporarily disabled - ContraparteForm is not needed in the new architecture
// where contrapartes are relationships to existing organizations
import React from 'react'

interface ContraparteFormProps {
  contraparte?: any
  onClose: () => void
  onSuccess: () => void
}

const ContraparteForm: React.FC<ContraparteFormProps> = ({ onClose }) => {
  return (
    <div>
      <p>ContraparteForm is temporarily disabled</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}

export default ContraparteForm

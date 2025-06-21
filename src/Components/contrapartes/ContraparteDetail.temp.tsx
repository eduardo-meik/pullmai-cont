// Temporarily disabled - ContraparteDetail will be refactored for the new architecture
import React from 'react'

interface ContraparteDetailProps {
  contraparte?: any
  onClose: () => void
  onEdit: () => void
}

const ContraparteDetail: React.FC<ContraparteDetailProps> = ({ onClose }) => {
  return (
    <div>
      <p>ContraparteDetail is temporarily disabled</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}

export default ContraparteDetail

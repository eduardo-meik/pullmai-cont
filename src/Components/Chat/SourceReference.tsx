// src/Components/Chat/SourceReference.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatMessageReference } from '../../types/chat'; // Adjust path as needed

interface SourceReferenceProps {
  reference: ChatMessageReference;
}

const SourceReference: React.FC<SourceReferenceProps> = ({ reference }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Determine the navigation path based on the reference collection type
    // This is a simplified example; you'll need to match your actual routes.
    if (reference.collection === 'contract_pdf_chunk' && reference.pdfUrl && reference.documentId) {
      // For PDF chunks, navigate to a view that can handle PDF display with page numbers
      // Assuming a route like /contracts/:contractId/pdf-view
      // The ContractPDFViewer component would then pick up these parameters from route state
      navigate(`/contracts/${reference.documentId}/pdf-view`, {
        state: {
          pdfStoragePath: reference.pdfUrl, // Pass the storage path
          pageNumber: reference.pageNumber,
          // You could also pass a text snippet or coordinates if your PDF viewer supports highlighting them
          // highlightText: reference.displayText // Example, if displayText is the chunk
        }
      });
    } else if (reference.collection === 'contratos' && reference.documentId) {
      navigate(`/contracts/${reference.documentId}`);
    } else if (reference.collection === 'proyectos' && reference.documentId) {
      navigate(`/projects/${reference.documentId}`); // Ensure this route exists
    } else if (reference.collection === 'organizaciones' && reference.documentId) {
      // Assuming you have a route for organization details
      navigate(`/organizations/${reference.documentId}`); // Ensure this route exists
    } else if (reference.collection === 'usuarios' && reference.documentId) {
      // Assuming you have a route for user details (less common for direct linking from chat)
      navigate(`/users/${reference.documentId}`); // Ensure this route exists
    } else {
      console.warn('Unknown reference collection or missing ID:', reference);
      // Optionally navigate to a generic search page or do nothing
    }
  };

  // Basic styling for the reference link
  // Using Tailwind CSS classes for illustration
  return (
    <button
      onClick={handleClick}
      className="inline-block bg-gray-200 hover:bg-gray-300 text-blue-700 hover:text-blue-800 text-xs font-semibold mr-2 mb-2 px-2.5 py-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      title={`View ${reference.collection}: ${reference.displayText}`}
    >
      {reference.displayText || 'Source'}
      {reference.pageNumber && ` (Page ${reference.pageNumber})`}
    </button>
  );
};

export default SourceReference;

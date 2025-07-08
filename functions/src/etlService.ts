// functions/src/etlService.ts

import { Organizacion, Proyecto, Contrato } from '../../src/types'; // Adjust path based on your actual functions structure
// If functions are in a separate package, these types might need to be copied or shared differently.
// For now, assuming relative path access from functions/src to src/ is possible or types are co-located.

// Placeholder for PDF parsing library. In a real Node.js environment for Firebase Functions,
// you would use a library like 'pdf-parse'.
// import pdf from 'pdf-parse';
// import { getStorage } from 'firebase-admin/storage'; // For downloading PDFs from Firebase Storage

// --- Text Preparation Functions ---

/**
 * Prepares a text representation of an Organizacion document for embedding.
 */
export const prepareOrganizacionText = (organizacion: Organizacion): string => {
  let text = `Organización: ${organizacion.nombre || ''}.`;
  if (organizacion.descripcion) text += ` Descripción: ${organizacion.descripcion}.`;
  if (organizacion.rut) text += ` RUT: ${organizacion.rut}.`;
  if (organizacion.direccion) text += ` Dirección: ${organizacion.direccion}.`;
  if (organizacion.ciudad) text += ` Ciudad: ${organizacion.ciudad}.`;
  if (organizacion.representanteLegal) text += ` Representante Legal: ${organizacion.representanteLegal}.`;
  if (organizacion.tipoEntidad) text += ` Tipo: ${organizacion.tipoEntidad}.`;
  // Add other relevant fields as needed
  return text.replace(/\s+/g, ' ').trim(); // Normalize whitespace
};

/**
 * Prepares a text representation of a Proyecto document for embedding.
 */
export const prepareProyectoText = (proyecto: Proyecto): string => {
  let text = `Proyecto: ${proyecto.nombre || ''}.`;
  if (proyecto.descripcion) text += ` Descripción: ${proyecto.descripcion}.`;
  if (proyecto.estado) text += ` Estado: ${proyecto.estado}.`;
  if (proyecto.prioridad) text += ` Prioridad: ${proyecto.prioridad}.`;
  if (proyecto.departamento) text += ` Departamento: ${proyecto.departamento}.`;
  // Consider adding names of responsible team members if easily accessible and relevant
  // Add other relevant fields
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Prepares a text representation of the main fields of a Contrato document for embedding.
 */
export const prepareContratoMainText = (contrato: Contrato): string => {
  let text = `Contrato: ${contrato.titulo || ''}.`;
  if (contrato.descripcion) text += ` Descripción: ${contrato.descripcion}.`;
  if (contrato.contraparte) text += ` Contraparte: ${contrato.contraparte}.`;
  if (contrato.proyecto) text += ` Proyecto Asociado: ${contrato.proyecto}.`;
  if (contrato.categoria) text += ` Categoría: ${contrato.categoria}.`;
  if (contrato.tipo) text += ` Tipo Económico: ${contrato.tipo}.`;
  if (contrato.estado) text += ` Estado: ${contrato.estado}.`;
  if (contrato.monto && contrato.moneda) text += ` Monto: ${contrato.monto} ${contrato.moneda}.`;
  if (contrato.fechaInicio) text += ` Fecha de Inicio: ${new Date(contrato.fechaInicio).toLocaleDateString()}.`;
  if (contrato.fechaTermino) text += ` Fecha de Término: ${new Date(contrato.fechaTermino).toLocaleDateString()}.`;
  if (contrato.etiquetas && contrato.etiquetas.length > 0) text += ` Etiquetas: ${contrato.etiquetas.join(', ')}.`;
  // Add other relevant fields
  return text.replace(/\s+/g, ' ').trim();
};


// --- PDF Processing and Chunking ---

const PDF_CHUNK_SIZE = 500; // Approximate number of characters per chunk
const PDF_CHUNK_OVERLAP = 50; // Number of characters to overlap between chunks

/**
 * Downloads a PDF from Firebase Storage and extracts its text.
 * THIS IS A PLACEHOLDER. Actual implementation requires Admin SDK and pdf-parse.
 * @param pdfStoragePath Path to the PDF in Firebase Storage.
 * @returns Extracted text or null if failed.
 */
export const extractPdfTextFromStorage = async (pdfStoragePath: string): Promise<string | null> => {
  console.log(`Simulating PDF download and text extraction for: ${pdfStoragePath}`);
  // In a real Firebase Function:
  // try {
  //   const bucket = getStorage().bucket(); // Default bucket
  //   const file = bucket.file(pdfStoragePath);
  //   const [exists] = await file.exists();
  //   if (!exists) {
  //     console.warn(`PDF not found at path: ${pdfStoragePath}`);
  //     return null;
  //   }
  //   const pdfBuffer = await file.download();
  //   const data = await pdf(pdfBuffer[0]); // pdf-parse library
  //   return data.text;
  // } catch (error) {
  //   console.error(`Error downloading or parsing PDF ${pdfStoragePath}:`, error);
  //   return null;
  // }
  if (pdfStoragePath.includes('error')) return null; // Simulate an error
  return `Simulated PDF content for ${pdfStoragePath}. Page 1: Introduction... Lorem ipsum dolor sit amet... Page 2: Details section... Consectetur adipiscing elit... Page 3: Conclusion... Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. This is a longer text to test chunking. This part will definitely be a separate chunk. And perhaps this too. One more sentence for good measure.`;
};

/**
 * Chunks text into smaller pieces with overlap.
 * @param text The text to chunk.
 * @param chunkSize Approximate size of each chunk.
 * @param overlap Overlap between chunks.
 * @returns An array of text chunks.
 */
export const chunkText = (text: string, chunkSize: number = PDF_CHUNK_SIZE, overlap: number = PDF_CHUNK_OVERLAP): string[] => {
  if (!text) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push(text.substring(i, end));
    i += (chunkSize - overlap);
    if (i >= text.length && end < text.length && text.substring(i).length > 0 ) {
        // Ensure the last bit is captured if smaller than overlap
        const lastChunkStart = Math.max(0, text.length - chunkSize + overlap); // Try to maintain some overlap
        if (lastChunkStart > i - (chunkSize - overlap)) { // Avoid duplicate if last chunk was already added
             chunks.push(text.substring(lastChunkStart));
        } else if (end < text.length) { // If the loop terminated early due to overlap logic but there's still text
             chunks.push(text.substring(end));
        }
        break;
    } else if (end === text.length) {
        break;
    }
  }
   // A simpler alternative for the loop, might be less precise with overlap at the very end but more robust:
   // for (let i = 0; i < text.length; i += chunkSize - overlap) {
   //   chunks.push(text.substring(i, i + chunkSize));
   // }
  return chunks.filter(chunk => chunk.trim() !== ''); // Remove empty chunks
};


/**
 * Processes a Contrato document, prepares its main text, extracts and chunks PDF text if available.
 * @param contrato The Contrato document.
 * @returns An object containing main text and an array of PDF chunk texts with page numbers.
 */
export const processContratoForEmbedding = async (
  contrato: Contrato
): Promise<{ mainText: string; pdfChunkTexts?: Array<{ text: string; pageNumber: number }> }> => {
  const mainText = prepareContratoMainText(contrato);
  let pdfChunkTexts: Array<{ text: string; pageNumber: number }> | undefined = undefined;

  if (contrato.pdfUrl) {
    const rawPdfText = await extractPdfTextFromStorage(contrato.pdfUrl);
    if (rawPdfText) {
      // Naive page splitting for simulation. Real PDF parsing gives page info.
      // For simulation, we'll just chunk the whole text and assign page numbers sequentially.
      // A real implementation with pdf-parse would allow getting text per page.
      const textChunks = chunkText(rawPdfText);
      pdfChunkTexts = textChunks.map((chunk, index) => ({
        text: chunk,
        // This page number is a placeholder. Real PDF parsing library can provide actual page numbers for chunks.
        pageNumber: Math.floor(index / 3) + 1, // Simulate ~3 chunks per page for testing
      }));
    }
  }
  return { mainText, pdfChunkTexts };
};

// --- Embedding Update Logic ---
import * as admin from 'firebase-admin';
import { generateEmbedding } from './openaiService'; // Assuming this will be created

/**
 * Updates a Firestore document with generated embeddings for its main text and PDF chunks.
 * @param collectionName The name of the Firestore collection.
 * @param docId The ID of the document to update.
 * @param mainTextToEmbed The main text content of the document to embed.
 * @param pdfChunkDetails Optional array of PDF chunk texts and their page numbers.
 */
export const updateDocumentEmbedding = async (
  collectionName: string,
  docId: string,
  mainTextToEmbed: string,
  pdfChunkDetails?: Array<{ text: string; pageNumber: number }>
): Promise<void> => {
  if (!mainTextToEmbed && (!pdfChunkDetails || pdfChunkDetails.length === 0)) {
    console.log(`No text provided to embed for ${collectionName}/${docId}. Skipping embedding update.`);
    // Optionally, clear existing embeddings if no text is provided
    // await admin.firestore().collection(collectionName).doc(docId).update({
    //   embedding_openai_t3s: admin.firestore.FieldValue.delete(),
    //   pdfChunks: admin.firestore.FieldValue.delete(),
    // });
    return;
  }

  const updateData: { [key: string]: any } = {};

  try {
    // Embed main document text
    if (mainTextToEmbed) {
      console.log(`Generating main embedding for ${collectionName}/${docId}`);
      const mainEmbedding = await generateEmbedding(mainTextToEmbed);
      updateData.embedding_openai_t3s = mainEmbedding;
      console.log(`Main embedding generated for ${collectionName}/${docId}. Dimension: ${mainEmbedding.length}`);
    }

    // Embed PDF chunks if provided
    if (pdfChunkDetails && pdfChunkDetails.length > 0) {
      console.log(`Generating embeddings for ${pdfChunkDetails.length} PDF chunks for ${collectionName}/${docId}`);
      const embeddedPdfChunks = await Promise.all(
        pdfChunkDetails.map(async (chunkDetail) => {
          const chunkEmbedding = await generateEmbedding(chunkDetail.text);
          return {
            text: chunkDetail.text, // Store original text for context retrieval if needed
            pageNumber: chunkDetail.pageNumber,
            embedding_openai_t3s: chunkEmbedding,
          };
        })
      );
      updateData.pdfChunks = embeddedPdfChunks;
      console.log(`${embeddedPdfChunks.length} PDF chunk embeddings generated for ${collectionName}/${docId}`);
    }

    if (Object.keys(updateData).length > 0) {
      await admin.firestore().collection(collectionName).doc(docId).set(updateData, { merge: true });
      console.log(`Successfully updated embeddings for ${collectionName}/${docId}`);
    } else {
      console.log(`No new embeddings were generated for ${collectionName}/${docId}. No update performed.`);
    }

  } catch (error) {
    console.error(`Error updating embeddings for ${collectionName}/${docId}:`, error);
    // Decide on error handling: rethrow, log, or specific handling for triggers/batch jobs
    // For now, just logging. In a trigger, you might not want to fail the whole operation.
  }
};

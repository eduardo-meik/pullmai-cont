// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

import {
  prepareOrganizacionText,
  prepareProyectoText,
  processContratoForEmbedding,
  updateDocumentEmbedding,
} from './etlService'; // Assuming etlService.ts is in the same directory

import { Organizacion, Proyecto, Contrato } from '../../src/types'; // Adjust path as necessary

// --- Firestore Triggers for Automatic Embedding Updates ---

const REGION = 'us-central1'; // Define your preferred region

/**
 * Trigger for when an Organizacion document is written (created or updated).
 * Prepares text from the document and updates its embedding.
 */
export const onOrganizacionWritten = functions
  .region(REGION)
  .firestore.document('organizaciones/{organizacionId}')
  .onWrite(async (change, context) => {
    const { organizacionId } = context.params;

    // If the document is deleted, do nothing for embeddings.
    // Embeddings will remain but won't be found if the doc is gone.
    // Optionally, you could implement logic to delete embeddings from a separate index if used.
    if (!change.after.exists) {
      console.log(`Organizacion ${organizacionId} deleted. No embedding action.`);
      return null;
    }

    const organizacionData = change.after.data() as Organizacion | undefined;
    if (!organizacionData) {
      console.error(`No data found for organizacion ${organizacionId} after write.`);
      return null;
    }
    // Add id to the data if it's not already there, as .data() doesn't include it.
    organizacionData.id = organizacionId;


    console.log(`Processing Organizacion ${organizacionId} for embedding update.`);
    try {
      const textToEmbed = prepareOrganizacionText(organizacionData);
      await updateDocumentEmbedding('organizaciones', organizacionId, textToEmbed);
      console.log(`Successfully triggered embedding update for Organizacion ${organizacionId}`);
    } catch (error) {
      console.error(`Error processing Organizacion ${organizacionId} for embedding:`, error);
      // Depending on the error, you might want to retry or log for manual intervention.
    }
    return null;
  });

/**
 * Trigger for when a Proyecto document is written (created or updated).
 * Prepares text from the document and updates its embedding.
 */
export const onProyectoWritten = functions
  .region(REGION)
  .firestore.document('proyectos/{proyectoId}')
  .onWrite(async (change, context) => {
    const { proyectoId } = context.params;

    if (!change.after.exists) {
      console.log(`Proyecto ${proyectoId} deleted. No embedding action.`);
      return null;
    }

    const proyectoData = change.after.data() as Proyecto | undefined;
    if (!proyectoData) {
      console.error(`No data found for proyecto ${proyectoId} after write.`);
      return null;
    }
    proyectoData.id = proyectoId;


    console.log(`Processing Proyecto ${proyectoId} for embedding update.`);
    try {
      const textToEmbed = prepareProyectoText(proyectoData);
      await updateDocumentEmbedding('proyectos', proyectoId, textToEmbed);
      console.log(`Successfully triggered embedding update for Proyecto ${proyectoId}`);
    } catch (error) {
      console.error(`Error processing Proyecto ${proyectoId} for embedding:`, error);
    }
    return null;
  });

/**
 * Trigger for when a Contrato document is written (created or updated).
 * Prepares main text and PDF chunk texts from the document and updates their embeddings.
 */
export const onContratoWritten = functions
  .region(REGION)
  .firestore.document('contratos/{contratoId}')
  .onWrite(async (change, context) => {
    const { contratoId } = context.params;

    if (!change.after.exists) {
      console.log(`Contrato ${contratoId} deleted. No embedding action.`);
      // If PDF chunks were stored elsewhere (e.g. separate vector DB), handle deletion here.
      return null;
    }

    const contratoData = change.after.data() as Contrato | undefined;
    if (!contratoData) {
      console.error(`No data found for contrato ${contratoId} after write.`);
      return null;
    }
    contratoData.id = contratoId;

    // Check if relevant fields for embedding have changed, to avoid unnecessary re-embedding.
    // This is a simple check; more sophisticated checks might compare specific fields.
    // For PDF chunks, if pdfUrl changes, re-embedding is definitely needed.
    // For simplicity now, we re-embed on any write if the document exists.
    // A more advanced version would compare change.before.data() with change.after.data().
    // const beforeData = change.before.data() as Contrato | undefined;
    // if (beforeData && JSON.stringify(relevantEmbeddingFields(beforeData)) === JSON.stringify(relevantEmbeddingFields(contratoData))) {
    //   console.log(`Contrato ${contratoId} data relevant to embeddings did not change. Skipping re-embedding.`);
    //   return null;
    // }


    console.log(`Processing Contrato ${contratoId} for embedding update.`);
    try {
      const { mainText, pdfChunkTexts } = await processContratoForEmbedding(contratoData);
      await updateDocumentEmbedding('contratos', contratoId, mainText, pdfChunkTexts);
      console.log(`Successfully triggered embedding update for Contrato ${contratoId}`);
    } catch (error) {
      console.error(`Error processing Contrato ${contratoId} for embedding:`, error);
    }
    return null;
  });

// Placeholder for other functions (like askLlm, batchEmbedDocuments) that will be added later.

// --- HTTP Triggerable Function for Batch Embedding ---

interface BatchEmbedRequestData {
  collections?: ('organizaciones' | 'proyectos' | 'contratos')[]; // Specific collections to process, or all if undefined
  forceReEmbed?: boolean; // If true, re-embed even if embedding exists (not implemented in detail here)
}

export const batchEmbedDocuments = functions
  .region(REGION)
  .runWith({ timeoutSeconds: 540, memory: '1GB' }) // Increase timeout and memory
  .https.onCall(async (data: BatchEmbedRequestData, context) => {
    // Basic authentication check: Ensure the user is an admin or has specific role
    // This is a placeholder; implement proper role-based access control.
    // if (!context.auth || !context.auth.token.admin) { // Example: check for admin custom claim
    //   console.warn('Unauthorized attempt to run batchEmbedDocuments by:', context.auth?.uid);
    //   throw new functions.https.HttpsError(
    //     'permission-denied',
    //     'User does not have permission to run this operation.'
    //   );
    // }
    console.log('User authorized (placeholder), proceeding with batch embedding.');


    const collectionsToProcess = data.collections || ['organizaciones', 'proyectos', 'contratos'];
    // const forceReEmbed = data.forceReEmbed || false; // Placeholder for future use

    console.log(`Starting batch embedding for collections: ${collectionsToProcess.join(', ')}`);
    const results: { [collectionName: string]: { success: number; failed: number } } = {};

    for (const collectionName of collectionsToProcess) {
      results[collectionName] = { success: 0, failed: 0 };
      try {
        const snapshot = await admin.firestore().collection(collectionName).get();
        console.log(`Found ${snapshot.docs.length} documents in ${collectionName}.`);

        // Process documents in parallel (be mindful of API rate limits for large collections)
        await Promise.all(snapshot.docs.map(async (doc) => {
          const docId = doc.id;
          const docData = doc.data();
          docData.id = docId; // ensure ID is part of the object for prepare functions

          try {
            console.log(`Processing ${collectionName}/${docId} for batch embedding...`);
            if (collectionName === 'organizaciones') {
              const text = prepareOrganizacionText(docData as Organizacion);
              await updateDocumentEmbedding(collectionName, docId, text);
            } else if (collectionName === 'proyectos') {
              const text = prepareProyectoText(docData as Proyecto);
              await updateDocumentEmbedding(collectionName, docId, text);
            } else if (collectionName === 'contratos') {
              const { mainText, pdfChunkTexts } = await processContratoForEmbedding(docData as Contrato);
              await updateDocumentEmbedding(collectionName, docId, mainText, pdfChunkTexts);
            }
            results[collectionName].success++;
            console.log(`Successfully batch embedded ${collectionName}/${docId}`);
          } catch (error) {
            results[collectionName].failed++;
            console.error(`Failed to batch embed ${collectionName}/${docId}:`, error);
          }
        }));
      } catch (error) {
        console.error(`Error processing collection ${collectionName}:`, error);
        results[collectionName].failed = -1; // Indicate collection-level failure
      }
    }

    const summary = `Batch embedding finished. Results: ${JSON.stringify(results)}`;
    console.log(summary);
    return { message: summary, details: results };
  });

// export { askLlm } from './llmService'; // Example

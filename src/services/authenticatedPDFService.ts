import { auth, storage } from '../firebase'
import { getDownloadURL, ref } from 'firebase/storage'

export interface AuthenticatedPDFResult {
  url: string
  blob?: Blob
}

class AuthenticatedPDFService {
  /**
   * Get an authenticated download URL for a PDF file
   */
  async getAuthenticatedPDFUrl(pdfPath: string): Promise<string> {
    try {
      console.log('Getting authenticated URL for:', pdfPath)
      
      // Ensure user is authenticated
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get the storage reference
      const fileRef = ref(storage, pdfPath)
      
      // Get download URL (this will include auth token automatically)
      const downloadURL = await getDownloadURL(fileRef)
      
      console.log('Authenticated PDF URL obtained:', downloadURL)
      return downloadURL
      
    } catch (error) {
      console.error('Error getting authenticated PDF URL:', error)
      throw new Error(`Unable to access PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Fetch PDF blob with authentication - Use this only when you need the blob data
   * For PDF viewing, prefer using getAuthenticatedPDFUrl directly
   */
  async fetchAuthenticatedPDF(pdfPath: string): Promise<Blob> {
    try {
      console.log('Fetching authenticated PDF blob for:', pdfPath)
      
      // Get authenticated URL
      const authenticatedUrl = await this.getAuthenticatedPDFUrl(pdfPath)
      
      // For development environments, we might face CORS issues
      // Try to fetch, but if it fails due to CORS, we'll handle it gracefully
      try {
        const response = await fetch(authenticatedUrl)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        console.log('PDF blob fetched successfully, size:', blob.size)
        
        return blob
      } catch (fetchError) {
        // If fetch fails (likely due to CORS), throw a more descriptive error
        if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          throw new Error('CORS error: Use getAuthenticatedPDFUrl() for direct PDF viewing instead of fetchAuthenticatedPDF()')
        }
        throw fetchError
      }
      
    } catch (error) {
      console.error('Error fetching authenticated PDF:', error)
      throw error
    }
  }

  /**
   * Create an object URL for the PDF - DEPRECATED due to CORS issues
   * Use getAuthenticatedPDFUrl() directly for PDF viewing
   */
  async getPDFObjectUrl(pdfPath: string): Promise<string> {
    try {
      console.warn('getPDFObjectUrl is deprecated due to CORS issues. Use getAuthenticatedPDFUrl directly.')
      const blob = await this.fetchAuthenticatedPDF(pdfPath)
      const objectUrl = URL.createObjectURL(blob)
      
      console.log('PDF object URL created:', objectUrl)
      return objectUrl
      
    } catch (error) {
      console.error('Error creating PDF object URL:', error)
      throw error
    }
  }

  /**
   * Get a URL that can be used directly for PDF viewing (recommended method)
   */
  async getPDFViewerUrl(pdfPath: string): Promise<string> {
    try {
      console.log('Getting PDF viewer URL for:', pdfPath)
      
      // Firebase Storage URLs with tokens work directly in PDF viewers
      const authenticatedUrl = await this.getAuthenticatedPDFUrl(pdfPath)
      
      console.log('PDF viewer URL ready:', authenticatedUrl)
      return authenticatedUrl
      
    } catch (error) {
      console.error('Error getting PDF viewer URL:', error)
      throw error
    }
  }

  /**
   * Extract the Firebase Storage path from a full URL or return the path if it's already a path
   */
  extractStoragePath(url: string): string {
    try {
      // If the input is already a path (doesn't start with http/https), return it as-is
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.log('Input is already a storage path:', url);
        return url;
      }

      // Create a URL object to easily access parts of the URL
      const urlObj = new URL(url);
      
      // The full path we need to parse is in the pathname property
      const pathname = urlObj.pathname;

      // Find the '/o/' separator in the path. This is standard for Firebase Storage URLs.
      // The actual file path is the URL-encoded string that follows '/o/'.
      const oIndex = pathname.indexOf('/o/');
      
      if (oIndex !== -1) {
        // Extract the encoded path part, removing any query parameters
        const pathWithQuery = pathname.substring(oIndex + 3); // +3 to skip '/o/'
        const pathOnly = pathWithQuery.split('?')[0];

        // Decode the path to handle characters like '/' (%2F) and spaces (%20)
        const decodedPath = decodeURIComponent(pathOnly);
        
        console.log('Successfully extracted and decoded path:', decodedPath);
        return decodedPath;
      }

      // Fallback for gs:// URLs
      if (url.startsWith('gs://')) {
        const path = url.substring(url.indexOf('/', 5) + 1);
        console.log('Extracted GS path:', path);
        return path;
      }

      // If the URL doesn't match the expected Firebase Storage format,
      // it might be a direct path already. Log a warning and return it.
      console.warn('Could not parse Firebase Storage URL, assuming it is a valid path:', url);
      return url;

    } catch (error) {
      console.error('Error extracting storage path from URL:', url, error);
      // Fallback to the original URL in case of an unexpected error
      return url;
    }
  }

  /**
   * Helper to get the bucket name from the config
   */
  getBucketName(): string {
    // This assumes your firebase config is available. 
    // Replace with your actual bucket name if this doesn't work.
    return storage.app.options.storageBucket || ''
  }
}

export default new AuthenticatedPDFService()

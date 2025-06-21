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
   * Fetch PDF blob with authentication
   */
  async fetchAuthenticatedPDF(pdfPath: string): Promise<Blob> {
    try {
      console.log('Fetching authenticated PDF blob for:', pdfPath)
      
      // Get authenticated URL
      const authenticatedUrl = await this.getAuthenticatedPDFUrl(pdfPath)
      
      // Fetch the PDF with the authenticated URL
      const response = await fetch(authenticatedUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log('PDF blob fetched successfully, size:', blob.size)
      
      return blob
      
    } catch (error) {
      console.error('Error fetching authenticated PDF:', error)
      throw error
    }
  }

  /**
   * Create an object URL for the PDF that can be used in the viewer
   */
  async getPDFObjectUrl(pdfPath: string): Promise<string> {
    try {
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
   * Extract the Firebase Storage path from a full URL
   */
  extractStoragePath(url: string): string {
    try {
      // Handle gs://bucket/path/to/file format
      if (url.startsWith('gs://')) {
        return url.replace(/^gs:\/\/[^/]+\//, '')
      }

      // Handle https://storage.googleapis.com/bucket/path/to/file format
      if (url.includes('googleapis.com')) {
        const urlObj = new URL(url)
        // The pathname is /<bucket>/<path-to-file>. We need to remove the leading slash and the bucket name.
        const pathParts = urlObj.pathname.substring(1).split('/')
        pathParts.shift() // Remove the bucket name from the parts array
        return decodeURIComponent(pathParts.join('/'))
      }
      
      // Handle Firebase download URLs (less common now, but good for robustness)
      if (url.includes('firebaseapp.com') || url.includes('appspot.com')) {
        const urlObj = new URL(url)
        const pathMatch = urlObj.pathname.match(/\/o\/(.+)/)
        if (pathMatch && pathMatch[1]) {
          // The matched path is URL-encoded, so we decode it.
          const decodedPath = decodeURIComponent(pathMatch[1])
          // It might also contain the bucket name if it's a non-standard URL.
          if (decodedPath.startsWith(this.getBucketName())) {
            return decodedPath.replace(this.getBucketName() + '/', '')
          }
          return decodedPath
        }
      }
      
      // If no other format matches, assume the URL is already a valid path.
      console.warn('Could not parse URL, assuming it is a valid path:', url)
      return url
      
    } catch (error) {
      console.error('Error extracting storage path from URL:', url, error)
      return url // Fallback to the original URL
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

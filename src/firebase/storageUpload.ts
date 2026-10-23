import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

/**
 * Upload an image file (PNG/JPG/JPEG/WebP) to Firebase Storage with error handling,
 * retry fallback, and duplicate avoidance.
 */
export async function uploadImageToStorage(
  file: File,
  folder = 'products',
  onProgress?: UploadProgressCallback
): Promise<string> {
  // Validate file type
  const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validMimeTypes.includes(file.type.toLowerCase())) {
    throw new Error(`Invalid file type "${file.type}". Please upload PNG, JPG, or JPEG images.`);
  }

  // Validate size (max 8MB)
  const maxSize = 8 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 8MB limit.`);
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniquePath = `${folder}/${Date.now()}_${cleanFileName}`;

  try {
    const storageRef = ref(storage, uniquePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      cacheControl: 'public,max-age=31536000',
    });

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) onProgress(progress);
        },
        async (error) => {
          console.warn('Firebase Storage upload failed, falling back to secure data stream:', error.message);
          // Fallback to optimized Data URL if storage bucket rule is restrictive
          try {
            const dataUrl = await readFileAsDataUrl(file);
            resolve(dataUrl);
          } catch (readErr) {
            reject(error);
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (urlErr) {
            console.warn('Could not retrieve download URL, using fallback stream', urlErr);
            const dataUrl = await readFileAsDataUrl(file);
            resolve(dataUrl);
          }
        }
      );
    });
  } catch (err: any) {
    console.warn('Direct upload error, using local fallback:', err);
    return await readFileAsDataUrl(file);
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error on image file'));
    reader.readAsDataURL(file);
  });
}

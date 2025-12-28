import Link from 'next/link';
import { uploadAPI } from '@/lib/api';

interface ImagesTabProps {
  images: any[];
  bandId: string;
  onReload: () => void;
}

export default function ImagesTab({ images, bandId, onReload }: ImagesTabProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = prompt('Image title (optional):');
    const description = prompt('Image description (optional):');

    try {
      await uploadAPI.uploadImage(bandId, file, title || undefined, description || undefined);
      alert('Image uploaded successfully!');
      onReload();
      e.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      await uploadAPI.deleteImage(bandId, imageId);
      alert('Image deleted!');
      onReload();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete image');
    }
  };

  return (
    <div>
      {/* Upload section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-2">Max 10MB. Formats: JPG, PNG, GIF, WebP</p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-600">Upload your first image above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <img
                src={`http://localhost:3001${image.imageUrl}`}
                alt={image.title || 'Band image'}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', image.imageUrl);
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="p-4">
                {image.title && (
                  <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
                )}
                {image.description && (
                  <p className="text-sm text-gray-600 mb-2">{image.description}</p>
                )}
                <p className="text-xs text-gray-500 mb-3">
                  Uploaded by {image.uploader.user.displayName || `${image.uploader.user.firstName} ${image.uploader.user.lastName}`}
                </p>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
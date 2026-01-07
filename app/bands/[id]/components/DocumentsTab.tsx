import { uploadAPI } from '@/lib/api';

interface DocumentsTabProps {
  documents: any[];
  bandId: string;
  onReload: () => void;
}

export default function DocumentsTab({ documents, bandId, onReload }: DocumentsTabProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = prompt('Document title (required):');
    if (!title) {
      alert('Title is required for documents');
      e.target.value = '';
      return;
    }

    const description = prompt('Document description (optional):');

    try {
      await uploadAPI.uploadDocument(bandId, file, title, description || undefined);
      alert('Document uploaded successfully!');
      onReload();
      e.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      await uploadAPI.deleteDocument(bandId, documentId);
      alert('Document deleted!');
      onReload();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document');
    }
  };

  return (
    <div>
      {/* Upload section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-earth-900 mb-4">Upload Document</h3>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
          onChange={handleUpload}
          className="w-full px-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent"
        />
        <p className="text-xs text-earth-600 mt-2">Max 10MB. Formats: PDF, DOC, DOCX, TXT, XLSX, XLS, CSV</p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <h3 className="text-lg font-medium text-earth-900 mb-2">No documents yet</h3>
          <p className="text-earth-700">Upload your first document above!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-earth-200">
            <thead className="bg-earth-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-earth-200">
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-earth-900">{doc.title}</div>
                    {doc.description && (
                      <div className="text-sm text-earth-600">{doc.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                    {doc.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                    {(doc.fileSize / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                    {doc.uploader.user.displayName || `${doc.uploader.user.firstName} ${doc.uploader.user.lastName}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <a
                      href={`http://localhost:3001${doc.fileUrl}`}
                      download
                      className="text-rust hover:text-rust-dark"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
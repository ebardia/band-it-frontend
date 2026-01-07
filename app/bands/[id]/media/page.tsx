'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { uploadAPI } from '@/lib/api';
import ImagesTab from '../components/ImagesTab';
import DocumentsTab from '../components/DocumentsTab';

export default function MediaPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [images, setImages] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'images' | 'documents'>('images');

  useEffect(() => {
    const loadMedia = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      if (!bandId) return;

      try {
        const [imagesResponse, documentsResponse] = await Promise.all([
          uploadAPI.getBandImages(bandId).catch(() => ({ data: { images: [] } })),
          uploadAPI.getBandDocuments(bandId).catch(() => ({ data: { documents: [] } })),
        ]);
        
        setImages(imagesResponse.data?.images || []);
        setDocuments(documentsResponse.data?.documents || []);
      } catch (error) {
        console.error('Failed to load media:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [isAuthenticated, router, bandId]);

  const reloadData = async () => {
    try {
      const [imagesResponse, documentsResponse] = await Promise.all([
        uploadAPI.getBandImages(bandId).catch(() => ({ data: { images: [] } })),
        uploadAPI.getBandDocuments(bandId).catch(() => ({ data: { documents: [] } })),
      ]);
      
      setImages(imagesResponse.data?.images || []);
      setDocuments(documentsResponse.data?.documents || []);
    } catch (error) {
      console.error('Failed to reload media:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-earth-900">Media</h1>
          <p className="text-earth-700 mt-1">Images and documents for this band</p>
          
          {/* Tabs */}
          <div className="flex gap-6 mt-4 border-b border-earth-200">
            <button 
              onClick={() => setActiveTab('images')} 
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'images' 
                  ? 'border-rust text-rust' 
                  : 'border-transparent text-earth-600 hover:text-earth-800'
              }`}
            >
              Images ({images.length})
            </button>
            <button 
              onClick={() => setActiveTab('documents')} 
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'documents' 
                  ? 'border-rust text-rust' 
                  : 'border-transparent text-earth-600 hover:text-earth-800'
              }`}
            >
              Documents ({documents.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'images' && (
          <ImagesTab images={images} bandId={bandId} onReload={reloadData} />
        )}
        
        {activeTab === 'documents' && (
          <DocumentsTab documents={documents} bandId={bandId} onReload={reloadData} />
        )}
      </main>
    </div>
  );
}
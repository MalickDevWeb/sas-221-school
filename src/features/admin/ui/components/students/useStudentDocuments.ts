import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Document {
  id: string;
  name: string;
  size: string;
  url: string;
}

export function useStudentDocuments(studentId: string) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/students/${studentId}/documents`);
      setDocs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const upRes = await axios.post('/api/upload', { fileStr: reader.result as string });
        if (upRes.data?.url) {
          const docRes = await axios.post(`/api/admin/students/${studentId}/documents`, {
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} Mo`,
            url: upRes.data.url
          });
          setDocs(docRes.data?.documents || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return { docs, loading, uploading, uploadFile };
}

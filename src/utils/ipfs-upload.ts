const UPLOAD_SERVICE_ENDPOINT = 'https://web3storage-service.vercel.app/upload-file';

interface FileUploadResponse {
    message: string;
    path: string;
}

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(UPLOAD_SERVICE_ENDPOINT, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) throw new Error('File Upload failed');

    const data: FileUploadResponse = await response.json();
    return data.path;
};

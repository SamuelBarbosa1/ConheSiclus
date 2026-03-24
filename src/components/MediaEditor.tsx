import React from 'react';

interface ImageSlot {
  url: string;
  file: File | null;
}

interface MediaEditorProps {
  images: ImageSlot[];
  setImages: (images: ImageSlot[]) => void;
  videoUrls: string[];
  setVideoUrls: (urls: string[]) => void;
  disabled?: boolean;
}

export const MediaEditor: React.FC<MediaEditorProps> = ({
  images,
  setImages,
  videoUrls,
  setVideoUrls,
  disabled,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Fotos (Máximo 5)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 border border-gray-100 rounded-lg bg-gray-50 relative">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-tight flex justify-between items-center">
                Foto {i + 1}
                {(images[i]?.url || images[i]?.file) && (
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...images];
                      newImages[i] = { url: '', file: null };
                      setImages(newImages);
                      const input = document.getElementById(`foto-input-${i}`) as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                    className="text-[10px] text-red-500 hover:text-red-700 font-bold bg-red-50 px-1 rounded"
                  >
                    REMOVER
                  </button>
                )}
              </label>
              <input
                id={`foto-input-${i}`}
                type="file"
                accept="image/*"
                className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  const newImages = [...images];
                  newImages[i] = { url: newImages[i]?.url || '', file };
                  setImages(newImages);
                }}
                disabled={disabled}
              />
              <input
                type="text"
                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Ou cole a URL..."
                value={images[i]?.url || ''}
                onChange={(e) => {
                  const newImages = [...images];
                  newImages[i] = { url: e.target.value, file: newImages[i]?.file || null };
                  setImages(newImages);
                }}
                disabled={disabled || !!images[i]?.file}
              />
              {(() => {
                const imgData = images[i];
                let previewUrl = '';
                if (imgData?.file) {
                  try { previewUrl = URL.createObjectURL(imgData.file); } catch (e) {}
                } else if (imgData?.url) {
                  previewUrl = imgData.url;
                }
                if (!previewUrl) return null;
                const finalSrc = (previewUrl.startsWith('http') || previewUrl.startsWith('/') || previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')) 
                  ? previewUrl 
                  : `https://${previewUrl}`;
                return (
                  <div className="mt-2 h-24 w-full overflow-hidden rounded border border-gray-200 bg-white flex items-center justify-center">
                    <img src={finalSrc} className="max-w-full max-h-full object-contain" alt={`Preview ${i + 1}`} />
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Vídeos YouTube (Máximo 2)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-tight">Link do Vídeo {i + 1}</label>
              <input
                type="text"
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                value={videoUrls[i] || ''}
                onChange={(e) => {
                  const newVideos = [...videoUrls];
                  newVideos[i] = e.target.value;
                  setVideoUrls(newVideos);
                }}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

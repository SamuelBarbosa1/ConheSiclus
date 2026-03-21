import React from 'react';
import { getYoutubeEmbedUrl } from '../lib/utils';
import { Video } from '../types';

interface YoutubePlayerProps {
  videos: Video[];
  submenuNome: string;
}

export const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ videos, submenuNome }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      {videos.map((vid) => {
        const embedUrl = getYoutubeEmbedUrl(vid.url);
        return (
          <div key={vid.id} className="aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-md relative group">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title={`Vídeo para ${submenuNome}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        );
      })}
    </div>
  );
};

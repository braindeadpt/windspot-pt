'use client';

import { useState } from 'react';
import { Camera, ExternalLink, RefreshCw } from 'lucide-react';
import { getTranslation } from '@/lib/i18n';

interface WebcamSectionProps {
  webcamUrl?: string;
  spotName: string;
  locale: string;
}

export default function WebcamSection({ webcamUrl, spotName, locale }: WebcamSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const t = getTranslation(locale as any);

  if (!webcamUrl) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-5 h-5 text-ocean-400" />
          <h3 className="text-lg font-semibold">{t.webcam.live}</h3>
        </div>
        <p className="text-white/50 text-sm">
          {t.webcam.unavailable}
        </p>
        <a 
          href="https://beachcam.meo.pt/livecams/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-3 text-sm text-ocean-400 hover:text-ocean-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          {t.webcam.viewBeachcam}
        </a>
      </div>
    );
  }

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Camera className="w-5 h-5 text-ocean-400" />
          <h3 className="text-lg font-semibold">{t.webcam.live}</h3>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          title={t.webcam.refresh}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black/20">
        {hasError ? (
          <div className="p-8 text-center">
            <p className="text-white/50 mb-3">{t.webcam.unavailable}</p>
            <a 
              href={webcamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-ocean-400 hover:text-ocean-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t.webcam.open}
            </a>
          </div>
        ) : (
          <>
            <iframe
              src={webcamUrl}
              className="w-full h-64 rounded-xl"
              style={{ border: 'none' }}
              loading="lazy"
              onError={() => setHasError(true)}
              sandbox="allow-same-origin allow-scripts"
            />
            <a 
              href={webcamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 text-xs text-white/70 hover:text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all hover:bg-black/70"
            >
              {t.webcam.open} ↗
            </a>
          </>
        )}
      </div>
    </div>
  );
}

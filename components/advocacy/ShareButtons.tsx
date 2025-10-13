'use client';

/**
 * Share Buttons Component
 *
 * Social sharing buttons for advocacy campaigns
 */

import { Twitter, Facebook, Link2 } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  text: string;
}

export function ShareButtons({ url, title, text }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Share:</span>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>

      <button
        onClick={handleShare}
        className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        aria-label="Copy link"
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );
}

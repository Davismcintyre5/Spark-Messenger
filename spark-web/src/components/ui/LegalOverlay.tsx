import React from 'react';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/ui/Spinner';

interface LegalOverlayProps {
  type: 'terms' | 'privacy' | 'cookies' | 'ads_preferences';
  isOpen: boolean;
  onClose: () => void;
}

interface LegalResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    type: string;
    title: string;
    content: string;
    version: number;
    publishedAt: string;
  };
}

const titles: Record<string, string> = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  cookies: 'Cookie Policy',
  ads_preferences: 'Ads Preferences',
};

// Function to format numbered plain text into structured HTML
const formatNumberedContent = (content: string): string => {
  if (!content) return '';
  
  const lines = content.split('\n');
  let html = '';
  let inList = false;
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }
    
    // Main sections (1., 2., 3., etc.)
    if (line.match(/^\d+\.\s+[A-Z]/)) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<div class="legal-section">`;
      html += `<h2 class="section-title">${escapeHtml(line)}</h2>`;
      currentSection = 'section';
    }
    // Subsections (3.1, 4.2, etc.)
    else if (line.match(/^\d+\.\d+\s+/)) {
      html += `<h3 class="subsection-title">${escapeHtml(line)}</h3>`;
    }
    // Numbered list items (4.1, 4.2 without extra spacing)
    else if (line.match(/^\d+\.\d+\s+[A-Za-z]/) && !line.match(/^\d+\.\d+\s+$/)) {
      html += `<div class="subsection-item">${escapeHtml(line)}</div>`;
    }
    // Bullet points
    else if (line.startsWith('-') || line.startsWith('•')) {
      if (!inList) {
        html += '<ul class="bullet-list">';
        inList = true;
      }
      html += `<li>${escapeHtml(line.substring(1).trim())}</li>`;
    }
    // Regular paragraphs
    else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p class="legal-paragraph">${escapeHtml(line)}</p>`;
    }
  }
  
  if (inList) {
    html += '</ul>';
  }
  if (currentSection === 'section') {
    html += `</div>`;
  }
  
  return html;
};

// Helper function to escape HTML special characters
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Function to format specific sections like ACCEPTANCE, ELIGIBILITY, etc.
const enhanceFormatting = (content: string): string => {
  // First apply basic numbering format
  let formatted = formatNumberedContent(content);
  
  // Add special styling for ALL CAPS section headers
  formatted = formatted.replace(
    /<h2 class="section-title">(\d+\.\s+[A-Z\s]+)<\/h2>/g,
    '<h2 class="section-title uppercase-title">$1</h2>'
  );
  
  return formatted;
};

export default function LegalOverlay({ type, isOpen, onClose }: LegalOverlayProps) {
  // 1. Fetch legal content from server
  const { data, isLoading, error } = useQuery<LegalResponse>({
    queryKey: ['legal', type],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/v1/legal/${type}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const result = await response.json();
      console.log('Server response:', result);
      return result;
    },
    enabled: isOpen,
  });

  // 2. Effect hook for keyboard escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 3. EARLY RETURN
  if (!isOpen) return null;

  // 4. Get content from response
  const legalData = data?.data;
  const rawContent = legalData?.content || '';
  const formattedContent = rawContent ? enhanceFormatting(rawContent) : '';

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col">
      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-blue-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 shrink-0">
        <div className="flex flex-col">
          <h1 className="font-bold text-xl text-blue-900 dark:text-blue-400">
            {legalData?.title || titles[type]}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Version {legalData?.version || '1.0'} • Published on{' '}
            {legalData?.publishedAt 
              ? new Date(legalData.publishedAt).toLocaleDateString() 
              : new Date().toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* CONTENT WITH SCROLLBAR */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <Spinner size="lg" className="text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading document...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
              <div className="text-red-500 dark:text-red-400 text-5xl">⚠️</div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Failed to load the document
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Please check your connection and try again
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {legalData && !isLoading && !error && (
            <div className="max-w-4xl mx-auto">
              {/* Document Content */}
              <div className="legal-document prose prose-blue prose-sm dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: formattedContent }}
                  className="formatted-legal-content"
                />
              </div>

              {/* Footer Actions */}
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-950">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
            </div>
          )}

          {!legalData && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
              <div className="text-gray-400 text-5xl mb-2">📄</div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Document not available
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                This document will be available soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
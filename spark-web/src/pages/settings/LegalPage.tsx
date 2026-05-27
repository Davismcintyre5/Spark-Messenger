import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Cookie, BarChart3, Calendar, CheckCircle, Scale, Lock, Info, Printer } from 'lucide-react';
import { legalService, LegalDocument } from '@/services/legalService';
import Spinner from '@/components/ui/Spinner';

const docTypes = [
  { type: 'terms', label: 'Terms & Conditions', icon: <Scale className="w-4 h-4" />, description: 'Legal agreement between you and Spark', color: 'blue' },
  { type: 'privacy', label: 'Privacy Policy', icon: <Lock className="w-4 h-4" />, description: 'How we handle your data', color: 'purple' },
  { type: 'cookies', label: 'Cookie Policy', icon: <Cookie className="w-4 h-4" />, description: 'How we use cookies and tracking', color: 'amber' },
  { type: 'ads_preferences', label: 'Ads Preferences', icon: <BarChart3 className="w-4 h-4" />, description: 'Control your ad experience', color: 'emerald' },
];

const getColorStyles = (color: string) => {
  switch (color) {
    case 'blue': return { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', dark: 'dark:bg-blue-950/30', border: 'border-blue-200', text: 'text-blue-600' };
    case 'purple': return { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', dark: 'dark:bg-purple-950/30', border: 'border-purple-200', text: 'text-purple-600' };
    case 'amber': return { bg: 'from-amber-500 to-amber-600', light: 'bg-amber-50', dark: 'dark:bg-amber-950/30', border: 'border-amber-200', text: 'text-amber-600' };
    case 'emerald': return { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', dark: 'dark:bg-emerald-950/30', border: 'border-emerald-200', text: 'text-emerald-600' };
    default: return { bg: 'from-gray-500 to-gray-600', light: 'bg-gray-50', dark: 'dark:bg-gray-800', border: 'border-gray-200', text: 'text-gray-600' };
  }
};

// Convert plain text with numbering to beautiful HTML
const formatContentToHtml = (content: string): string => {
  if (!content) return '<p class="text-gray-500">Content not available.</p>';
  
  const lines = content.split('\n');
  let html = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    // Main sections: "1. ACCEPTANCE OF TERMS"
    if (line.match(/^\d+\.\s+[A-Z]/)) {
      const match = line.match(/^(\d+)\.\s+(.+)$/);
      if (match) {
        html += `<div class="mt-6 mb-3"><h2 class="text-xl font-bold text-blue-800 dark:text-blue-400 pb-2 border-b border-gray-200 dark:border-gray-700">${match[1]}. ${match[2]}</h2></div>`;
      }
    }
    // Subsections: "3.1 You must provide..."
    else if (line.match(/^\d+\.\d+\s+/)) {
      const match = line.match(/^(\d+\.\d+)\s+(.+)$/);
      if (match) {
        html += `<h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mt-4 mb-2">${match[1]} ${match[2]}</h3>`;
      }
    }
    // Regular paragraphs
    else {
      html += `<p class="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">${line}</p>`;
    }
  }
  
  return html;
};

export default function LegalPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(type || 'terms');

  // Fetch document directly when tab changes
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const doc = await legalService.getByType(activeTab);
        console.log(`Fetched ${activeTab}:`, doc);
        setDocument(doc);
      } catch (error) {
        console.error('Error fetching document:', error);
        setDocument(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [activeTab]);

  useEffect(() => {
    if (type) setActiveTab(type);
  }, [type]);

  const activeDocInfo = docTypes.find((d) => d.type === activeTab);
  const colors = getColorStyles(activeDocInfo?.color || 'blue');
  const formattedContent = document?.content ? formatContentToHtml(document.content) : '<p class="text-gray-500">Content not available.</p>';

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
        <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
          <button onClick={() => navigate('/settings')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg">Legal Center</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-gray-400">Loading legal documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/settings')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-lg bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Legal Center
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">Your privacy and rights matter to us</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="hidden sm:inline">Updated regularly</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${colors.bg} shrink-0`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Shield className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">Trust & Transparency</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{activeDocInfo?.label}</h2>
          <p className="text-sm text-white/80 max-w-md mx-auto">{activeDocInfo?.description}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 pb-2 overflow-x-auto shrink-0">
        <div className="flex gap-2 min-w-max">
          {docTypes.map(({ type: docType, label, icon, color }) => {
            const tabColors = getColorStyles(color);
            return (
              <button
                key={docType}
                onClick={() => navigate(`/settings/legal/${docType}`)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === docType
                    ? `${tabColors.light} ${tabColors.dark} border ${tabColors.border} ${tabColors.text} shadow-sm`
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {icon}
                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Document Header Card */}
          <div className="mb-6 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${colors.bg} px-6 py-4`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {activeDocInfo?.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {activeDocInfo?.label}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {activeDocInfo?.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>Version {document?.version || 1}</span>
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    Published {document?.publishedAt ? new Date(document.publishedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Last updated banner */}
            <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Info className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {document?.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Document Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div 
                className="prose prose-blue prose-sm dark:prose-invert max-w-none legal-content"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Footer */}
          <div className="text-center py-8 mt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-400">Spark Messenger</p>
            <p className="text-xs text-gray-400 mt-0.5">Powered by HDM</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
              <span>© {new Date().getFullYear()} HDM</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
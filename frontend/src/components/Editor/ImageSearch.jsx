import React, { useState } from 'react';
import { Search, Loader2, Plus, ExternalLink, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ImageSearch({ topic, onInsert }) {
  const [query, setQuery] = useState(topic || '');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const search = async (p = 1) => {
    if (!query.trim()) { toast.error('Enter a search term'); return; }
    setIsLoading(true);
    try {
      const { data } = await api.get('/images/search', { params: { q: query, page: p, per_page: 12 } });
      if (p === 1) {
        setImages(data.images || []);
      } else {
        setImages(prev => [...prev, ...(data.images || [])]);
      }
      setPage(p);
    } catch (err) {
      toast.error('Image search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (!selected) { toast.error('Select an image first'); return; }
    onInsert(selected.url, selected.alt);
    setSelected(null);
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="panel-header">
        <ImageIcon size={14} className="text-indigo-400" />
        <span className="panel-title">Image Search</span>
      </div>

      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(1)}
            placeholder="Search images..."
            className="input-field text-xs pl-8 py-2"
          />
        </div>
        <button onClick={() => search(1)} disabled={isLoading} className="btn-primary text-xs py-2 px-3">
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
        </button>
      </div>

      {/* Images grid */}
      {images.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {images.map(img => (
              <div
                key={img.id}
                className={`image-card ${selected?.id === img.id ? 'selected' : ''}`}
                onClick={() => setSelected(img)}
              >
                <img
                  src={img.thumb}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-24 object-cover"
                  onError={e => { e.target.src = `https://picsum.photos/200/150?random=${img.id}`; }}
                />
                <div className="overlay">
                  {selected?.id === img.id ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-500">
                      <Plus size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-black/50">
                      <Plus size={14} className="text-white" />
                    </div>
                  )}
                </div>
                {img.photographer && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.photographer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {selected && (
              <button onClick={handleInsert} className="btn-primary flex-1 justify-center text-xs py-2">
                <Plus size={13} /> Insert Selected
              </button>
            )}
            <button
              onClick={() => search(page + 1)}
              disabled={isLoading}
              className="btn-secondary text-xs py-2 flex-1 justify-center"
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : 'Load More'}
            </button>
          </div>

          {selected && (
            <div className="rounded-xl p-2 text-center"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <img src={selected.thumb} alt={selected.alt} className="w-full h-20 object-cover rounded-lg mb-2" />
              <p className="text-xs text-slate-400 truncate">{selected.alt || 'Selected image'}</p>
              {selected.photographer && (
                <p className="text-xs text-slate-600">by {selected.photographer}</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.1)' }}>
            <ImageIcon size={22} className="text-indigo-400" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Search for images</p>
          <p className="text-xs text-slate-600">
            Uses {topic ? `topic "${topic}"` : 'your search query'}
          </p>
          {topic && !images.length && (
            <button onClick={() => { setQuery(topic); search(1); }}
              className="mt-3 btn-secondary text-xs py-1.5 px-3">
              Search "{topic}"
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-slate-600 text-center">
        Images from Picsum Photos (demo) · Add Unsplash/Pexels API key for better results
      </p>
    </div>
  );
}

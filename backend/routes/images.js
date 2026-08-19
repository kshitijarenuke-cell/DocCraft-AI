const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/images/search?q=query&page=1&source=unsplash
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, per_page = 12, source = 'unsplash' } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query is required' });

    let images = [];

    if (source === 'pexels' && process.env.PEXELS_API_KEY && process.env.PEXELS_API_KEY !== 'your_pexels_api_key_here') {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&page=${page}&per_page=${per_page}`,
        { headers: { Authorization: process.env.PEXELS_API_KEY } }
      );
      if (response.ok) {
        const data = await response.json();
        images = data.photos.map(photo => ({
          id: String(photo.id),
          url: photo.src.large,
          thumb: photo.src.medium,
          alt: photo.alt || q,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          source: 'pexels',
        }));
      }
    } else if (process.env.UNSPLASH_ACCESS_KEY && process.env.UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key_here') {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&page=${page}&per_page=${per_page}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
      );
      if (response.ok) {
        const data = await response.json();
        images = data.results.map(photo => ({
          id: photo.id,
          url: photo.urls.regular,
          thumb: photo.urls.small,
          alt: photo.alt_description || photo.description || q,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          source: 'unsplash',
          color: photo.color,
        }));
      }
    } else {
      // Fallback: Picsum Photos (always works, no API key)
      images = Array.from({ length: parseInt(per_page) }, (_, i) => {
        const seed = Math.abs((q.charCodeAt(0) * 17 + i * 31) % 1000);
        return {
          id: `picsum-${seed}-${i}`,
          url: `https://picsum.photos/seed/${q.replace(/\s+/g, '')}-${i}/800/500`,
          thumb: `https://picsum.photos/seed/${q.replace(/\s+/g, '')}-${i}/400/250`,
          alt: `${q} image ${i + 1}`,
          photographer: 'Picsum Photos',
          photographerUrl: 'https://picsum.photos',
          source: 'picsum',
        };
      });
    }

    res.json({ success: true, images, query: q, page: parseInt(page) });
  } catch (err) {
    console.error('Image search error:', err);
    res.status(500).json({ success: false, message: 'Image search failed' });
  }
});

module.exports = router;

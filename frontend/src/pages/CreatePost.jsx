import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function CreatePost() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  async function handleCreatePost(e) {
    e.preventDefault();
    setPostError('');
    if (!file) {
      setPostError('Choose a photo to post.');
      return;
    }
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      await api.post('/api/posts', fd);
      setCaption('');
      setFile(null);
      e.target.reset();
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed.';
      setPostError(msg);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="feed-page">
      <div className="card feed-composer">
        <h2 className="glow-text">New post</h2>
        <p className="small">Upload a photo and optional caption. It appears in the home feed for you and your friends.</p>
        <form className="feed-composer-form" onSubmit={handleCreatePost}>
          <label className="feed-file-label">
            <span className="btn btn-ghost">Choose image</span>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="feed-file-input"
              onChange={(ev) => setFile(ev.target.files?.[0] || null)}
            />
            {file && <span className="small feed-file-name">{file.name}</span>}
          </label>
          <textarea
            className="feed-caption"
            placeholder="Write a caption…"
            value={caption}
            onChange={(ev) => setCaption(ev.target.value)}
            rows={4}
            maxLength={2200}
          />
          {postError && <div className="feed-form-error">{postError}</div>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={posting}>
              {posting ? 'Posting…' : 'Share'}
            </button>
            <Link to="/" className="btn btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

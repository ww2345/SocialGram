import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});

  const loadFeed = useCallback(async () => {
    setFeedError('');
    setLoading(true);
    try {
      const { data } = await api.get('/api/posts/feed');
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setFeedError('Could not load your feed.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  async function toggleLike(postId) {
    try {
      const { data } = await api.post(`/api/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likeCount: data.likeCount, likedByMe: data.likedByMe }
            : p
        )
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function submitComment(postId) {
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    try {
      const { data } = await api.post(`/api/posts/${postId}/comments`, { text });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), data] }
            : p
        )
      );
      setCommentDrafts((d) => ({ ...d, [postId]: '' }));
    } catch (e) {
      console.error(e);
    }
  }

  const meId = user?._id ? String(user._id) : '';

  return (
    <div className="feed-page">
      <div className="card">
        <h2 className="glow-text">Home</h2>
        <p className="small">Posts from you and people you are friends with.</p>
        <p className="small" style={{ marginTop: 8 }}>
          <Link to="/create-post" className="glow-text" style={{ textDecoration: 'none' }}>
            + New post
          </Link>
        </p>
      </div>

      <div style={{ height: 14 }} />

      {loading && <div className="small">Loading feed…</div>}
      {feedError && <div className="feed-form-error">{feedError}</div>}

      {!loading && posts.length === 0 && !feedError && (
        <div className="card">
          <p className="small">No posts yet. Add friends or create your first post.</p>
          <Link to="/create-post" className="btn btn-primary" style={{ marginTop: 10, display: 'inline-block', textDecoration: 'none' }}>
            New post
          </Link>
        </div>
      )}

      <div className="feed-list">
        {posts.map((post) => {
          const author = post.author;
          const name = author?.username || 'User';
          const avatar = mediaUrl(author?.avatarUrl);
          return (
            <article className="card post-card" key={post._id}>
              <header className="post-header">
                <div className="post-avatar" aria-hidden>
                  {avatar ? (
                    <img src={avatar} alt="" />
                  ) : (
                    <span>{name.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="post-author-name">{name}</div>
                  <div className="small post-time">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleString()
                      : ''}
                  </div>
                </div>
              </header>

              <div className="post-media-wrap">
                <img
                  className="post-media"
                  src={mediaUrl(post.imageUrl)}
                  alt={post.caption ? post.caption.slice(0, 80) : 'Post'}
                />
              </div>

              <div className="post-actions">
                <button
                  type="button"
                  className={`btn post-like-btn ${post.likedByMe ? 'post-like-active' : 'btn-ghost'}`}
                  onClick={() => toggleLike(post._id)}
                  aria-pressed={post.likedByMe}
                >
                  {post.likedByMe ? '♥ Liked' : '♡ Like'}
                </button>
                <span className="small post-like-count">
                  {post.likeCount || 0}{' '}
                  {(post.likeCount || 0) === 1 ? 'like' : 'likes'}
                </span>
              </div>

              {post.caption && <p className="post-caption"><strong>{name}</strong> {post.caption}</p>}

              <div className="post-comments">
                <div className="small post-comments-title">Comments</div>
                <ul className="post-comment-list">
                  {(post.comments || []).map((c) => {
                    const uname = c.author?.username || 'User';
                    const isMine = meId && String(c.author?._id || c.author) === meId;
                    return (
                      <li key={c._id} className="post-comment-item">
                        <span className="post-comment-user">{uname}</span>
                        <span className={isMine ? 'post-comment-text post-comment-mine' : 'post-comment-text'}>
                          {c.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="post-comment-form">
                  <input
                    type="text"
                    className="feed-comment-input"
                    placeholder="Add a comment…"
                    value={commentDrafts[post._id] || ''}
                    onChange={(ev) =>
                      setCommentDrafts((d) => ({ ...d, [post._id]: ev.target.value }))
                    }
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter') {
                        ev.preventDefault();
                        submitComment(post._id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => submitComment(post._id)}
                  >
                    Post
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

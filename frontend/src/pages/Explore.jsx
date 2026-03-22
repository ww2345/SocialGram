import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function avatarUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function Explore() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.get('/api/users/explore');
      setPeople(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Could not load people to explore.');
      setPeople([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function sendRequest(userId) {
    setActionId(userId);
    try {
      await api.post('/api/requests/send', { toUserId: userId });
      setPeople((prev) =>
        prev.map((u) =>
          String(u._id) === String(userId) ? { ...u, relationship: 'requested_by_you' } : u
        )
      );
    } catch (err) {
      window.alert(err.response?.data?.error || 'Could not send request');
    } finally {
      setActionId(null);
    }
  }

  function relationshipLabel(r) {
    switch (r) {
      case 'friend':
        return 'Friends';
      case 'requested_by_you':
        return 'Requested';
      case 'requests_you':
        return 'Wants to connect';
      default:
        return 'Suggested for you';
    }
  }

  return (
    <div className="explore-page">
      <div className="card">
        <h2 className="glow-text">Explore</h2>
        <p className="small">
          Discover people on SocialGram. Suggestions show users you are not friends with yet; friends appear at the end of the list.
        </p>
        <button type="button" className="btn btn-ghost explore-shuffle" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Shuffle list'}
        </button>
      </div>

      <div style={{ height: 14 }} />

      {loading && <div className="small">Finding people…</div>}
      {error && <div className="feed-form-error">{error}</div>}

      {!loading && people.length === 0 && !error && (
        <div className="card">
          <p className="small">No other users yet. Invite friends to sign up.</p>
        </div>
      )}

      <div className="explore-grid">
        {people.map((u) => {
          const name = u.username || 'User';
          const img = avatarUrl(u.avatarUrl);
          const r = u.relationship || 'none';
          return (
            <div className="card explore-card" key={u._id}>
              <div className="explore-card-inner">
                <div className="explore-avatar" aria-hidden>
                  {img ? <img src={img} alt="" /> : <span>{name.slice(0, 1).toUpperCase()}</span>}
                </div>
                <div className="explore-meta">
                  <div className="explore-username">{name}</div>
                  <div className="small explore-relationship">{relationshipLabel(r)}</div>
                  {u.bio ? <div className="small explore-bio">{u.bio}</div> : null}
                </div>
              </div>
              <div className="explore-actions">
                {r === 'none' && (
                  <button
                    type="button"
                    className="btn btn-primary explore-action-btn"
                    disabled={actionId === u._id}
                    onClick={() => sendRequest(u._id)}
                  >
                    {actionId === u._id ? 'Sending…' : 'Add friend'}
                  </button>
                )}
                {r === 'requested_by_you' && (
                  <span className="small explore-pill">Request sent</span>
                )}
                {r === 'requests_you' && (
                  <Link to="/requests" className="btn btn-primary explore-action-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                    Respond
                  </Link>
                )}
                {r === 'friend' && (
                  <span className="small explore-pill explore-pill-friend">Friends</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

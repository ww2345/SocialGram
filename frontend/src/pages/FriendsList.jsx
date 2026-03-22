import React, { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

export default function FriendsList({ user }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfriendId, setUnfriendId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/users/me');
      setFriends(res.data.friends || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function conversationId(a, b) {
    return [String(a), String(b)].sort().join('_');
  }

  const myId = user?._id ? String(user._id) : '';

  async function unfriend(friendId) {
    const ok = window.confirm('Remove this person from your friends? You can send a new request later.');
    if (!ok) return;
    setUnfriendId(friendId);
    try {
      await api.delete(`/api/friends/${friendId}`);
      setFriends((prev) => prev.filter((f) => String(f._id) !== String(friendId)));
    } catch (e) {
      window.alert(e.response?.data?.error || 'Could not unfriend');
    } finally {
      setUnfriendId(null);
    }
  }

  return (
    <div>
      <div className="card">
        <h2 className="glow-text">Your Friends</h2>
        {loading && <div className="small">Loading…</div>}
        <div className="user-list">
          {!loading && friends.length === 0 && (
            <div className="small">You have no friends yet</div>
          )}
          {friends.map((f) => (
            <div className="user-item" key={f._id}>
              <div>
                <div style={{ fontWeight: 700, color: '#e6f7ff' }}>{f.username}</div>
              </div>
              <div className="friends-actions">
                {myId && (
                  <Link to={'/chat/' + conversationId(f._id, myId)}>
                    <button type="button" className="btn btn-primary">
                      Chat
                    </button>
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-ghost friends-unfriend-btn"
                  disabled={unfriendId === f._id}
                  onClick={() => unfriend(f._id)}
                >
                  {unfriendId === f._id ? '…' : 'Unfriend'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

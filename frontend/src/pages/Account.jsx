import React, { useState } from 'react';
import api from '../utils/api';

export default function Account({ onAccountDeleted }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleDeleteAccount(e) {
    e.preventDefault();
    setError('');
    const confirmed = window.confirm(
      'Delete your account permanently? This removes your posts, comments, likes, messages, and friend connections. This cannot be undone.'
    );
    if (!confirmed) return;
    const second = window.confirm('Last chance — really delete your account?');
    if (!second) return;

    setBusy(true);
    try {
      await api.delete('/api/users/me', { data: { password } });
      localStorage.removeItem('token');
      setPassword('');
      if (typeof onAccountDeleted === 'function') onAccountDeleted();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete account');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="card">
        <h2 className="glow-text">Account</h2>
        <p className="small">Manage your SocialGram account.</p>
      </div>

      <div style={{ height: 14 }} />

      <div className="card account-danger">
        <h3 className="glow-text" style={{ fontSize: '1.1rem' }}>
          Delete account
        </h3>
        <p className="small">
          Permanently deletes your profile, all of your posts (and their images), every comment and like you added on others&apos; posts, your chat messages, and friend requests. Friends will no longer see you in their list.
        </p>
        <form className="account-delete-form" onSubmit={handleDeleteAccount}>
          <label className="small" style={{ display: 'block', marginBottom: 6 }}>
            Confirm with your password
          </label>
          <input
            type="password"
            className="feed-comment-input"
            style={{ maxWidth: 320, marginBottom: 10 }}
            placeholder="Current password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            autoComplete="current-password"
          />
          {error && <div className="feed-form-error">{error}</div>}
          <button type="submit" className="btn btn-ghost account-delete-btn" disabled={busy}>
            {busy ? 'Deleting…' : 'Delete my account forever'}
          </button>
        </form>
      </div>
    </div>
  );
}

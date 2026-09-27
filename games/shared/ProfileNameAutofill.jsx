'use client';

export default function ProfileNameAutofill({ name, onSelect }) {
  if (!name?.trim()) return null;
  return (
    <button type="button" className="profile-name-autofill" style={{ display: 'block', margin: '0 auto 10px', padding: '9px 14px', border: '1px solid #c6bbad', borderRadius: 999, background: '#fffaf1', color: '#332c29', font: 'inherit', cursor: 'pointer' }} onClick={() => onSelect(name.trim())}>
      👤 Use my profile: <strong>{name.trim()}</strong>
    </button>
  );
}

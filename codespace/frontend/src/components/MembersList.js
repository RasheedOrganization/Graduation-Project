import React from 'react';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';

const emojis = ['🧑', '👨', '🧔', '👩', '👩‍💻', '👨‍💻'];

export default function MembersList({ members = [] }) {
  return (
    <div>
      {members.map((member, index) => {
        const emoji = emojis[index % emojis.length];
        return (
          <div key={index} className="member-card">
            <span className="emoji">{emoji}</span>
            <span className="id">{member.username}</span>
            {member.micOn ? (
              <MicIcon fontSize="small" style={{ marginLeft: 'auto' }} />
            ) : (
              <MicOffIcon fontSize="small" style={{ marginLeft: 'auto' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';

function ResourceList({ resources, openStatusId, setOpenStatusId, updateStatus, statusOptions }) {
  return (
    <div className="right-resources">
      {resources.map((res) => {
        const statusClass = `status-${res.status.toLowerCase().replace(/ /g, '-')}`;
        const isOpen = openStatusId === res._id;
        return (
          <div
            key={res._id}
            className="resource-card"
            onClick={() => {
              const link =
                res.link.startsWith('http://') || res.link.startsWith('https://')
                  ? res.link
                  : `https://${res.link}`;
              window.open(link, '_blank', 'noopener,noreferrer');
            }}
          >
            <div className="resource-header">
              <h3>{res.name}</h3>
            </div>
            <p className="resource-link">{res.link}</p>
            <div
              className={`status-circle ${statusClass}`}
              title={res.status}
              onClick={(e) => {
                e.stopPropagation();
                setOpenStatusId(isOpen ? null : res._id);
              }}
            ></div>
            {isOpen && (
              <ul className="status-dropdown" onClick={(e) => e.stopPropagation()}>
                {statusOptions.map(({ value, emoji }) => (
                  <li
                    key={value}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(res._id, value);
                      setOpenStatusId(null);
                    }}
                  >
                    <span
                      className={`status-emoji status-${value.toLowerCase().replace(/ /g, '-')}`}
                      role="img"
                      aria-label={value}
                    >
                      {emoji}
                    </span>
                    {value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ResourceList;


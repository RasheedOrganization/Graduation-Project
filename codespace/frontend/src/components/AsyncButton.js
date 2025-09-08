import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AsyncButton = ({ onClick, onSuccess, children, ...props }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button {...props} onClick={handleClick} disabled={loading}>
      {loading ? <CircularProgress size={20} /> : success ? <CheckCircleIcon color="success" /> : children}
    </Button>
  );
};

export default AsyncButton;

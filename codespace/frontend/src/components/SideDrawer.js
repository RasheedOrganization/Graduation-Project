import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Typography from '@mui/material/Typography';

const drawerWidth = '15%';
const closedWidth = 30;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: closedWidth,
  [theme.breakpoints.up('sm')]: {
    width: closedWidth,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const ContentContainer = styled('div')(({ open, theme }) => ({
  marginLeft: open ? drawerWidth : closedWidth,
  transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, padding 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
  flexGrow: 1,
  padding: theme.spacing(10),
}));

const MembersContainer = styled('div')({
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 120px)',
  width: '100%',
  paddingRight: '8px',
});

const emojis = ['🧑', '👨', '🧔', '', '', '', '', '']; // Fill in with your desired emojis

const MemberCard = ({ id , member}) => {
  const index = id % emojis.length;
  const emoji = emojis[index];

  return (
    <div className="member-card">
      <span className="emoji">{emoji}</span>
      <span className="id">{member}</span>
    </div>
  );
};

export default function MiniDrawer({ toggleMic, roomid, members = [] }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Drawer variant="permanent" open={open}>
        <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
          <IconButton
            aria-label="open drawer"
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            edge="start"
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>

          <IconButton variant="contained" color="primary" onClick={toggleMic}>
            <HeadsetMicIcon />
          </IconButton>

          <div style={{flexGrow: 1}}>
            {open ? (
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Members in the room
              </Typography>
            ) : (
              <p></p>
            )}
            <MembersContainer>
              {members.map((member, index) => (
                <MemberCard key={index} id={index} member={member} />
              ))}
            </MembersContainer>
          </div>

          {open && (
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyRoomId}
              sx={{mt: 'auto', mb: 1, mx: 1, whiteSpace: 'normal', textAlign: 'center'}}
            >
              {copied ? 'Copied!' : 'Copy Room ID'}
            </Button>
          )}
        </div>
      </Drawer>
      <ContentContainer open={open} theme={theme}>
        {/* Your main content goes here */}
      </ContentContainer>
    </div>
  );
}

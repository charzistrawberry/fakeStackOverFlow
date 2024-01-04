
import Snackbar from '@mui/material/Snackbar';
import * as React from 'react';
import MuiAlert from '@mui/material/Alert';
export default function ErrorMsg({errorOpen,errorMsg,setErrorOpen}) {
    
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });//MUI ALERT
  
    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        setErrorOpen(false);
      }
  
      setErrorOpen(false);
    };
  
    return (
        <Snackbar open={errorOpen} autoHideDuration={6000} onClose={handleClose}>
    <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
      {errorMsg}
    </Alert>
  </Snackbar>
    );
  }
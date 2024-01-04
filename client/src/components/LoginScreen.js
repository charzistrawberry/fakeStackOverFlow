import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import ErrorMsg from './ErrorMsg.js';
import { AppContext } from '../AppContext.js';
axios.defaults.withCredentials = true;
// TODO remove, this demo shouldn't need to reset the theme.

export default function SignInSide() {
  const {setActivePage,setIsLoggedIn,setCurrentUser} = React.useContext(AppContext);
  const [loginUsernameError,setLoginUSernameError] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [errorOpen, setErrorOpen] = React.useState()


  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    axios.post("http://localhost:8000/loginUser",{
        username: data.get('email'),
        password: data.get('password'),
        email: data.get('email')
      }).then((res)=> {
        if(res.status === 200){
          console.log("Finished submitting")
          setIsLoggedIn(true);
          setErrorMsg("");
          setErrorOpen(false);
          setActivePage("HomePage")
          setCurrentUser(res.data)
        }
        else{
          console.log("failed Login put some kind of error here like with useState similar to old askquestion errors")
        }
      }
      ).catch((err)=>{
        if(err.response.status === 400){
          setErrorMsg(err.response.data.ErrorMsg);
          setErrorOpen(true);
        }
      });
  };

  function handleContinueAsGuest(){
    setActivePage("HomePage");
  }
  function handleSwitchToRegister(){
    setActivePage("SignUp");
  }

  return (
      <Grid container component="main" sx={{ height: '100vh' }}>
        <ErrorMsg errorOpen={errorOpen} errorMsg={errorMsg} setErrorOpen={setErrorOpen}/>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://tenor.com/view/cat-dance-cat-dance-cat-dancing-hey-hey-you-you-gif-10281105765813690669.gif)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: '70% 100%',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address/Account Name"
                name="email"
                autoComplete="email"
                autoFocus
              />
              {loginUsernameError? <p>{loginUsernameError}</p> :<></>}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
              <Grid item xs>
                  <Link component= "button" variant="body2" onClick={handleContinueAsGuest}>
                    {"Login as a Guest"}
                  </Link>
                </Grid>
                <Grid item>
                  <Link component= "button" variant="body2" onClick={handleSwitchToRegister}>
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
  );
}
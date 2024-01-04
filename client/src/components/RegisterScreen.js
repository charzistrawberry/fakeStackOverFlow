import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import axios from "axios";
import { AppContext } from '../AppContext';
import ErrorMsg from './ErrorMsg';
axios.defaults.withCredentials = true;


export default function SignUp() {
  const {setActivePage} = React.useContext(AppContext)
  const [errorOpen, setErrorOpen] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

    const handleSubmit = (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      axios.post("http://localhost:8000/registerUser",{
        username: data.get('username'),
        password: data.get('password'),
        email: data.get('email')
      }).then((res)=> {
        if(res.data.message === "success"){
          setErrorMsg("")
          setActivePage("SignIn");
        }
      }).catch((err) =>{
        if(err.response.status === 400){
          setErrorMsg(err.response.data.ErrorMsg);
          setErrorOpen(true);
        }
      });

    };

    function handleSwitchToLogin(){
      setActivePage("SignIn");
    }
  
    return (
        <Container component="main" maxWidth="xs">
          <ErrorMsg errorOpen={errorOpen} errorMsg={errorMsg} setErrorOpen={setErrorOpen}/>
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address/Account Name"
                    name="email"
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link component= "button" variant="body2" onClick={handleSwitchToLogin}>
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
    );
  }
import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { AppContext } from '../AppContext';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { parseSearchBarInput } from '../AppUtility';
axios.defaults.withCredentials = true;

export default function Header() {
  //Conditional rendering for account circle thing
  const { isLoggedIn, setIsLoggedIn, activePage, setActivePage, currentUser, setCurrentUser, setListOfQuestions, setSearchResultsFound } = useContext(AppContext)
  const [anchorEl, setAnchorEl] = React.useState(null);
  //NOTE NEED TO COMEBACK to modify this perhaps for whatever functioanlity we need
  //like make sure the menu options all have specific functionality for switching to user profile page and logging out
  //maybe logging in if the person is a guest?
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  }
  const handleClickProfle = () => {
    axios.get('http://localhost:8000/loggedin').then(
      res => {
        setAnchorEl(null);
        setCurrentUser({ ...res.data })
        setActivePage("UserProfilePage")
      }
    )
  };
  const handleClickLogout = () => {
    axios.get('http://localhost:8000/logout').then(
      res => {
        setAnchorEl(null);
        //Not sure if we need this maybe we keep them logged in and continue as guest
        setIsLoggedIn(false);
        setCurrentUser(null);
        setActivePage("SignIn");
      }
    )
  }
  const handleClickLogin = () => {
    setAnchorEl(null);
    setActivePage("SignIn")
  }
  const handleSearch = (event) => {
    if (event.key === "Enter" && activePage === "HomePage") {
      console.log(event.target.value); //can still extract info like this
      let fullSearchText = event.target.value;
      let textNtags = parseSearchBarInput(fullSearchText);
      axios.get('http://localhost:8000/posts/questions/search', { params: textNtags })
        .then(res => {
          setListOfQuestions([...res.data]);
          setSearchResultsFound(true);
        })

      event.target.value = ""; // this should clear it after hitting enter
    }
  }

  function UserAccountCircle() {
    //NOTE HERE WE HAVE TO ADD SOME Conditional rendering using the isLoggedIn as the check
    //So the app circle loads differently based on if the person is logged in
    return (
      <div>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {isLoggedIn ? <MenuItem onClick={handleClickProfle}>{currentUser.username + "\'s "} profile</MenuItem> : null}
          {isLoggedIn ? <MenuItem onClick={handleClickLogout}>Logout</MenuItem> : <MenuItem onClick={handleClickLogin}>Login</MenuItem>}
        </Menu>
      </div>
    );
  }
  const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  }));

  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    },
  }));




  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "grey" }}>
      <Toolbar>
        <Typography variant="h6" component="div">
          Fake StackoverFlow
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          {activePage === "HomePage" ? <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            onKeyDown={handleSearch}
          /> : <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            onKeyDown={handleSearch}
            disabled={true}
          />}

        </Search>
        {UserAccountCircle()}
      </Toolbar>
    </AppBar>
  );
};

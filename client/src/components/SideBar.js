import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import LabelIcon from '@mui/icons-material/Label';
import { AppContext } from '../AppContext';
import axios from 'axios';
axios.defaults.withCredentials = true;

export default function SideBar({setListOfQuestions}){
    const {setActivePage,activePage, setSearchResultsFound, setTagResultsFound} = React.useContext(AppContext);
    const [questionsSelected,setQuestionsSelected] = React.useState(true);
    const [tagsSelected,setTagsSelected] = React.useState(false);
   
    React.useEffect(()=>{
        switch(activePage){
            case "HomePage":
                setQuestionsSelected(true);
                setTagsSelected(false);
                break;
            case "TagsPage":
                setQuestionsSelected(false);
                setTagsSelected(true);
                break;
            default:
                setQuestionsSelected(false);
                setTagsSelected(false);
        }

    },[activePage]);
    //Use Effect to refresh questions
        
    function handleQuestionsTab(){
        try{
            axios.get('http://localhost:8000/posts/questions/sorted/allByDate')
            .then(res =>{
                    setListOfQuestions([...res.data]);
                    setSearchResultsFound(false);
                    setTagResultsFound(false);
                    setActivePage("HomePage");
            });
        }
        catch (error){
            console.log(error);
        }
        
    }
    function handleTagsTab(){
        setActivePage("TagsPage");
        setTagResultsFound(true);
        setSearchResultsFound(false);
    }

    return(
        <Drawer
        variant="permanent"
        sx={{
          width: "12%",
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: "12%", boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
          <ListItem  disablePadding>
                <ListItemButton selected = {questionsSelected} onClick={handleQuestionsTab}>
                    <ListItemIcon><QuestionMarkIcon/></ListItemIcon> 
                    <ListItemText>Questions</ListItemText>
                </ListItemButton>
            </ListItem>
            <ListItem  disablePadding>
                <ListItemButton selected= {tagsSelected} onClick={handleTagsTab}>
                    <ListItemIcon><LabelIcon/> </ListItemIcon> 
                    <ListItemText>Tags</ListItemText>
                </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
  );

}
import SideBar from "./SideBar";
import Header from "./Header";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import axios from "axios";
axios.defaults.withCredentials = true;

export default function TagsPage({ setListOfQuestions }) {
    const {activePage,setActivePage,setTagResultsFound} = useContext(AppContext);
    const [listOfTags, setListOfTags] = useState([]);
    

    function TagCard({tag}){
        return (
            <Grid item xs={4}>
            <Card sx={{ minWidth: 275,display: "flex", flexDirection:"column",alignItems:"center",justify:"center" }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {tag.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {tag.numOfQs + " questions"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={()=>{handleTagClick(tag._id)}}>View Questions</Button>
              </CardActions>
            </Card>
            </Grid>
          );
        

    }
    
    //useEffect for retrieving the tags whenever the page switches 
    useEffect(()=>{
        try{
        axios.get('http://localhost:8000/posts/tags')
        .then(res =>{
                setListOfTags([...res.data]);
        });
    }
    catch (error){
        console.log(error);
    }
    },[activePage]);


    function generateTagCards(){
        return listOfTags.map((tag)=>{
            return(
                <TagCard
                key={tag._id}
                tag={tag}
                />
            );
        })

    }
    function handleTagClick(tid){
        axios.get('http://localhost:8000/posts/questions/byTags/' + tid)
        .then(res =>{
            setListOfQuestions([...res.data]);
            setTagResultsFound(true);
            setActivePage("HomePage");
        });
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Header />
            <SideBar setListOfQuestions={setListOfQuestions} />
            <Box sx={{ marginTop: '6%', marginLeft: '15%', display: 'flex', flexDirection: 'column', pl: 2, width: "50%",alignItems:"center",justify:"center" }}>
                <Typography variant="h4" pb={5}>All Tags</Typography>
                <Grid container spacing={5}>
                    {generateTagCards()}
                </Grid>
            </Box>
        </Box>
    );

}
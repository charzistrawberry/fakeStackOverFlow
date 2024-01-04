import { Grid, ListItem, Typography, Box } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Button from '@mui/material/Button';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../AppContext";
axios.defaults.withCredentials = true;

export default function CommentCard({aComment}){
    // const {_id,text,comment_by,up_votes} = aComment;
    const [currentComment, setCurrentComment] = useState(aComment);
    const {currentUser, isLoggedIn} = useContext(AppContext);

    function handleUpVote(){
        const payload = {
            type: "Comment",
            userVoting: currentUser.email,
        }
        axios.post('http://localhost:8000/posts/upvote/' + currentComment._id,payload)
        .then( res =>{
            setCurrentComment({...res.data})
        })
        .catch(error =>{
            console.log(error);
        })

    }

    return(
        <ListItem sx={{borderTop: "1px solid grey", m: 1}}>
            <Grid container sx={{m: 1}}>
                <Grid item sx={{width: "80%", fontSize: 16}}>
                    {currentComment.text}
                </Grid>
                <Grid item>
                    <Typography style={{ color: 'red' }}>{currentComment.comment_by}</Typography>
                    <Typography style={{ color: 'gray' }}><ThumbUpIcon />{currentComment.up_votes + " "} votes</Typography>
                    {isLoggedIn? <Box><Button sx={{color:"green"}} onClick={handleUpVote}><ArrowUpwardIcon/>Up Vote</Button> </Box> : <></>}
                </Grid>
            </Grid>
        </ListItem>
    );
}
import { Grid, ListItem, Typography, TextField, Box } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { formatMetaDataDate } from "../AppUtility";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import CommentCard from "./CommentCard";
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from "axios";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorMsg from "./ErrorMsg";
axios.defaults.withCredentials = true;

export default function AnswerCard({anAnswer,setListOfAnswers,qid,editMode}){
    const {text,comments,ans_by, ans_date_time,up_votes,_id} = anAnswer;
    const {isLoggedIn,currentUser,userToEdit} = useContext(AppContext); 
    const [currentCommentIndex,setCommentIndex] = useState(0);
    const [listOfComments, setListOfComments] = useState(comments);
    const [ansText, setAnsText] = useState(text);
    const [editTextMode, setEditTextMode] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const[commentError, setCommentError] = useState("");

    useEffect(() => {
        try {
            axios.get('http://localhost:8000/posts/answers/' + qid)
                .then(res => {
                    let listoFAns = [...res.data];        
                    if(editMode !==undefined){
                        listoFAns.sort((a,b) =>{
                            if(a.ans_by === userToEdit.username && b.ans_by !== userToEdit.username){
                                return -1;
                            } 
                            else if(a.ans_by !== userToEdit.username && b.ans_by === userToEdit.username){
                                return -1;
                            }
                            else if(a.ans_by === userToEdit.username && b.ans_by === userToEdit.username){
                                return b.ans_date_time - a.ans_date_time;
                            }
                        }); 
                    }
                    setListOfAnswers([...listoFAns]);
                })
        }
        catch {

        }
    }, [listOfComments]);

    function generateCommentCards(){
        const startIndex = currentCommentIndex;
        const endIndex = startIndex + 3;
        let commentsToDisplay = listOfComments;
        commentsToDisplay.sort((a,b)=>{
            return new Date(b.comment_date_time) - new Date(a.comment_date_time);
        })
        
        commentsToDisplay = listOfComments.slice(startIndex, endIndex);

        return commentsToDisplay.map((comment) => {
            return (
                <CommentCard
                    key={anAnswer._id + '-' + comment._id}
                    aComment={comment}
                />
            );
        });

    }
    const handleSubmitComment = (event) => {
        if (event.key === "Enter") {
            //Trigger submition
            let userComment = event.target.value; // get the users text input
            if(userComment.length > 140){
                setCommentError("Comment exceeds 140 characters")
            }
            else {
            // Do a real quick post request
            setCommentError("");
            const commentToSubmit = {
                username: currentUser.username,
                text: userComment,
                fromQuestion: false,
                email: currentUser.email
            }
            axios.post('http://localhost:8000/posts/comment/' + anAnswer._id, commentToSubmit)
                .then((res) => {
                    event.target.value = ""; //clear the input box real quick
                    setErrorMsg("");
                    setErrorOpen(false);
                    
                    setListOfComments(res.data.comments);
                })
                .catch(err =>{
                    event.target.value = ""; //clear the input box real quick
                    setErrorMsg(err.response.data);
                    setErrorOpen(true);
                });
            }

        }
    }
    function handleEdit(newAnstext){
        const payload = {newText: newAnstext, questionId: qid}
        axios.post('http://localhost:8000/posts/answers/edit/'+ anAnswer._id,payload)
        .then( res =>{
            setEditTextMode(false);
            setListOfAnswers([...res.data]);//or just switch out of the page
        })
    }
    function handleDelete(ansId){
        let payload = {aid: ansId, userEmail: currentUser.email};

        axios.delete('http://localhost:8000/posts/answers/' + qid,{data:payload})
        .then(res =>{
            setEditTextMode(false);
            setListOfAnswers([...res.data])
        })
    }
    function handleDownVote(){
        const payload = {
            type: "Answer",
            userVoting: currentUser.email,
            qid: qid
        }
        axios.post('http://localhost:8000/posts/downvote/' + anAnswer._id,payload)
        .then( res =>{
            setErrorMsg("");
            setErrorOpen(false);
            setListOfAnswers([...res.data])
        })
        .catch(error =>{
            setErrorMsg(error.response.data);
            setErrorOpen(true);
        })
    }
    function handleUpVote(){
        const payload = {
            type: "Answer",
            userVoting: currentUser.email,
            qid: qid
        }
        axios.post('http://localhost:8000/posts/upvote/' + anAnswer._id,payload)
        .then( res =>{
            setErrorMsg("");
            setErrorOpen(false);
            setListOfAnswers([...res.data])
        })
        .catch(error =>{
            setErrorMsg(error.response.data);
            setErrorOpen(true);
        })

    }
    if(editTextMode){
        return(
            <ListItem sx={{borderTop: "1px solid grey", m: 1}}>
                <ErrorMsg errorOpen={errorOpen} errorMsg={errorMsg} setErrorOpen={setErrorOpen}/>
                <Grid container sx={{m: 1}}>
                    <Grid item sx={{width: "80%", fontSize: 16}}>
                        <TextField defaultValue={text} onChange={(event)=>{setAnsText(event.target.value)}}/>
                    </Grid>
                    <Grid item>
                        <Typography style={{ color: 'red' }}>{ans_by}</Typography>
                        <Typography style={{ color: 'gray' }}>answered {formatMetaDataDate(new Date(ans_date_time))} </Typography>
                        <Typography style={{ color: 'gray' }}><ThumbUpIcon />{up_votes + " "} votes</Typography>
                        <Button onClick={()=>{handleEdit(ansText)}}>Finish</Button>
                        <Button onClick={()=>{setEditTextMode(false)}}>Cancel</Button>
                    </Grid>
                </Grid>
                <List sx={{ width: "100%" }}>
                            Comments
                            {generateCommentCards()}
                                {currentCommentIndex === 0 ? <Button size="large" disabled={true}><ArrowBackIosIcon />prev</Button> : <Button size="large" onClick={() => { setCommentIndex(currentCommentIndex - 3) }}><ArrowBackIosIcon />prev</Button>}
                                <Button size="large" onClick={() => { let index = (currentCommentIndex + 3) % listOfComments.length; (index < 3||listOfComments.length===0) ? setCommentIndex(0) : setCommentIndex(index) }}>Next <ArrowForwardIosIcon /></Button>
                                {isLoggedIn ? <TextField placeholder="Submit A Comment" multiline variant="outlined" sx={{ width: "100%" }} onKeyDown={handleSubmitComment} /> : <TextField multiline disabled variant="outlined" sx={{ width: "100%" }} />}
                                {commentError ?  <p className="error-message">{commentError}</p> : <></>}
                </List>
            </ListItem>
        );
    }
    else{
        return(
            <ListItem sx={{borderTop: "1px solid grey", m: 1}}>
                <ErrorMsg errorOpen={errorOpen} errorMsg={errorMsg} setErrorOpen={setErrorOpen}/>
                <Grid container sx={{m: 1}}>
                    <Grid item sx={{width: "80%", fontSize: 16}}>
                        {text}
                    </Grid>
                    <Grid item>
                        <Typography style={{ color: 'red' }}>{ans_by}</Typography>
                        <Typography style={{ color: 'gray' }}>answered {formatMetaDataDate(new Date(ans_date_time))} </Typography>
                        <Typography style={{ color: 'gray' }}><ThumbUpIcon />{up_votes + " "} votes</Typography>
                        {isLoggedIn? <Box><Button sx={{color:"green"}} onClick={handleUpVote}><ArrowUpwardIcon/>Up Vote</Button> <Button sx={{color:"red"}} onClick={handleDownVote}><ArrowDownwardIcon/>Down Vote</Button></Box> : <></>}
                        {(editMode!==undefined && userToEdit.username === anAnswer.ans_by) ?<Button onClick={()=>{setEditTextMode(true)}}>Edit</Button>: <></>}
                        {(editMode!==undefined && userToEdit.username === anAnswer.ans_by) ?<Button onClick={()=>{handleDelete(_id)}}>Delete</Button>: <></>}
                    </Grid>
                </Grid>
                <List sx={{ width: "100%" }}>
                            Comments
                            {generateCommentCards()}
                                {currentCommentIndex === 0 ? <Button size="large" disabled={true}><ArrowBackIosIcon />prev</Button> : <Button size="large" onClick={() => { setCommentIndex(currentCommentIndex - 3) }}><ArrowBackIosIcon />prev</Button>}
                                <Button size="large" onClick={() => { let index = (currentCommentIndex + 3) % listOfComments.length; (index < 3||listOfComments.length===0) ? setCommentIndex(0) : setCommentIndex(index) }}>Next <ArrowForwardIosIcon /></Button>
                                {isLoggedIn ? <TextField placeholder="Submit A Comment" multiline variant="outlined" sx={{ width: "100%" }} onKeyDown={handleSubmitComment} /> : <TextField multiline disabled variant="outlined" sx={{ width: "100%" }} />}
                                {commentError ?  <p className="error-message">{commentError}</p> : <></>}
                </List>
            </ListItem>
        );
    }
    
}
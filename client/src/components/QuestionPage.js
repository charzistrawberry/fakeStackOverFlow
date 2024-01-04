import { Box, Grid, Typography, TextField } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { getHyperLinksFromText, formatMetaDataDate } from "../AppUtility";
import Header from "./Header";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentCard from "./CommentCard";
import { AppContext } from "../AppContext";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AnswerCard from "./AnswerCard";
import SideBar from "./SideBar";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorMsg from "./ErrorMsg";

axios.defaults.withCredentials = true;

export default function QuestionPage({ activeQuestion,setListOfQuestions, editMode, setActiveQuestion }) {
    const { currentUser, isLoggedIn, setActivePage, activePage } = useContext(AppContext)
    const [listOfAnswers, setListOfAnswers] = useState(activeQuestion.answers);
    const [listOfComments, setListOfComments] = useState([...activeQuestion.comments.reverse()]);
    const [currentCommentIndex, setCommentIndex] = useState(0);
    const [currentAnswerIndex, setAnswerIndex] = useState(0);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const[commentError, setCommentError] = useState("");

    function generateTags() {
        return activeQuestion.tags.map(tag => {
            return (
                <span className="tags-span" key={activeQuestion._id + "-" + tag._id} >{tag.name}</span>
            );
        });
    }

    function generateCommentCards() {
        const startIndex = currentCommentIndex;
        const endIndex = startIndex + 3;
        let commentsToDisplay = listOfComments;
        commentsToDisplay.sort((a,b)=>{
            return new Date(b.comment_date_time) - new Date(a.comment_date_time);
        })

        commentsToDisplay = commentsToDisplay.slice(startIndex, endIndex);

        return commentsToDisplay.map((comment) => {
            return (
                <CommentCard
                    key={activeQuestion._id + '-' + comment._id}
                    aComment={comment}
                />
            );
        });
    }

    const handleSubmitComment = (event) => {
        if (event.key === "Enter") {
            //Trigger submition
            let userComment = event.target.value; // get the users text input

            //If a new comment is more than 140 characters then do not add it to the database and display an appropriate error message to inform the user.
            if(userComment.length > 140){
                setCommentError("Comment exceeds 140 characters")
            }

            //If a new comment is added by a user with less than 50 reputation, display an appropriate message to inform the user and reject the comment.
            else{
                
                // Do a real quick post request
                const commentToSubmit = {
                    username: currentUser.username,
                    text: userComment,
                    fromQuestion: true,
                    email: currentUser.email
                }
                axios.post('http://localhost:8000/posts/comment/' + activeQuestion._id, commentToSubmit)
                    .then((res) => {
                        event.target.value = ""; //clear the input box real quick
                        setListOfComments(res.data.comments);
                        setCommentError("");
                    })
                    .catch(err =>{
                        event.target.value = ""; //clear the input box real quick
                        setErrorMsg(err.response.data);
                        setErrorOpen(true);
                    });;
            }

        }
    }
    function handleAnswerQuestionButton() {
        setActivePage("AnswerQuestionPage");
    }
    function handleDownVote(){
        const payload = {
            type: "Question",
            userVoting: currentUser.email
        }
        axios.post('http://localhost:8000/posts/downvote/' + activeQuestion._id,payload)
        .then( res =>{
            setErrorMsg("");
            setErrorOpen(false);
            setActiveQuestion({...res.data})
        })
        .catch(error =>{
            setErrorMsg(error.response.data);
            setErrorOpen(true);
        })
    }
    function handleUpVote(){
        const payload = {
            type: "Question",
            userVoting: currentUser.email
        }
        axios.post('http://localhost:8000/posts/upvote/' + activeQuestion._id,payload)
        .then( res =>{
            setErrorMsg("");
            setErrorOpen(false);
            setActiveQuestion({...res.data})
        })
        .catch(error =>{
            setErrorMsg(error.response.data);
            setErrorOpen(true);
        })

    }

    function generateQuestion() {
        let formattedText = getHyperLinksFromText(activeQuestion._id, activeQuestion.text);
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <Grid container spacing={2}>
                    <Grid item xs={3} fontSize={22}>
                        {listOfAnswers.length + " answers "}
                    </Grid>
                    <Grid item xs={5}>
                        <Typography variant="h4"> {activeQuestion.title} </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Button variant="contained" disabled = {!isLoggedIn} onClick={()=>{setActivePage("AskQuestionPage")}}>Ask A Question</Button>
                    </Grid>
                </Grid>
                <ListItem>
                    <Grid container spacing={2}>
                        <Grid item xs={3} sx={{ color: "grey" }}>
                            <VisibilityIcon /> {activeQuestion.views + " views"} <br /> <ThumbUpIcon /> {activeQuestion.up_votes + " votes"}
                        </Grid>
                        <Grid item xs={5} sx={{ fontSize: 22 }}>
                            <div>
                                <Typography>{formattedText.length === 0 ? activeQuestion.text : formattedText} </Typography>
                            </div>
                            <div style={{ display: "flex", flexDirection: "row", columnGap: "10px", marginTop: 5 }} >
                                {generateTags()}
                            </div>
                            <br/>
                            {isLoggedIn? <Box><Button sx={{color:"green"}} onClick={handleUpVote}><ArrowUpwardIcon/>Up Vote</Button> <Button sx={{color:"red"}} onClick={handleDownVote}><ArrowDownwardIcon/>Down Vote</Button></Box> : <></>}
                        </Grid>
                        <Grid item xs={4}>
                            <Typography style={{ color: 'red' }}>{activeQuestion.asked_by}</Typography>
                            <Typography style={{ color: 'gray' }}>asked {formatMetaDataDate(new Date(activeQuestion.ask_date_time))}</Typography>
                        </Grid>
                    </Grid>

                </ListItem>
                <ListItem sx={{ width: "75%", borderBottom: '1px solid grey' }}>
                    <List sx={{ width: "100%" }}>
                        Comments
                        {generateCommentCards()}
                        {currentCommentIndex === 0 ? <Button size="large" disabled={true}><ArrowBackIosIcon />prev</Button> : <Button size="large" onClick={() => { setCommentIndex(currentCommentIndex - 3) }}><ArrowBackIosIcon />prev</Button>}
                        <Button size="large" onClick={() => { let index = (currentCommentIndex + 3) % listOfComments.length; (index < 3 ||listOfComments.length===0) ? setCommentIndex(0) : setCommentIndex(index) }}>Next <ArrowForwardIosIcon /></Button>
                        {isLoggedIn ? <TextField placeholder="Submit A Comment" multiline variant="outlined" sx={{ width: "100%" }} onKeyDown={handleSubmitComment} /> : <TextField multiline disabled variant="outlined" sx={{ width: "100%" }} />}
                        {commentError ?  <p className="error-message">{commentError}</p> : <></>}
                    </List>


                </ListItem>
            </div>
        );
    }

    function generateAnswerCards() {
        const startIndex = currentAnswerIndex;
        const endIndex = startIndex + 5;

        //Slice out only the set of 5 questions we want to see
        let answersToDisplay = listOfAnswers.slice(startIndex, endIndex);

        return answersToDisplay.map((answer) => {
            return (
                <AnswerCard
                    key={answer._id}
                    anAnswer={answer}
                    setListOfAnswers={setListOfAnswers}
                    qid={activeQuestion._id}
                    editMode={editMode}
                />
            );
        })
    }

    useEffect(() => {
        try {
            if(editMode === undefined){
            axios.get('http://localhost:8000/posts/answers/' + activeQuestion._id)
                .then(res => {
                    setListOfAnswers([...res.data]);
                })
            }
        }
        catch {

        }
    }, [activePage]);

    return (
        <div>
            <Box sx={{ display: 'flex' }}>
            <ErrorMsg errorOpen={errorOpen} errorMsg={errorMsg} setErrorOpen={setErrorOpen}/>
                <Header />
                <SideBar setListOfQuestions={setListOfQuestions}/>
                <Box sx={{ flexGrow: 1, display: 'flex', marginTop: '5%', marginLeft: '20', pl: 2, flexDirection: "column" }}>
                    {generateQuestion()}
                    <br />
                    Answers
                    <List sx={{ width: "75%" }}>
                        {generateAnswerCards()}
                        <br/>
                        <Box sx={{ '& button': { m: 1 } }}>
                            {currentAnswerIndex === 0 ? <Button size="large" disabled={true}><ArrowBackIosIcon />prev</Button> : <Button size="large" onClick={() => { setAnswerIndex(currentAnswerIndex - 5) }}><ArrowBackIosIcon />prev</Button>}
                            <Button size="large" onClick={() => { let index = (currentAnswerIndex + 5) % listOfAnswers.length; (index < 5 ||listOfAnswers.length===0) ? setAnswerIndex(0) : setAnswerIndex(index) }}>Next <ArrowForwardIosIcon /></Button>
                        </Box>
                    </List>
                    <Button variant="contained" disabled = {!isLoggedIn} sx={{ width: "10%", m: 2 }} onClick={handleAnswerQuestionButton}>Answer Question</Button>
                </Box>
            </Box>
        </div>
    );
}
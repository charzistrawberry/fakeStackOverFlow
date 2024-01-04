
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Header from './Header';
import SideBar from './SideBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import axios from 'axios';
import { formatListOfTags } from '../AppUtility';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../AppContext';

export default function AskQuestionPage({ aQuestion, setListOfQuestions }) {

    const { currentUser, setActivePage, setTagResultsFound, setSearchResultsFound } = useContext(AppContext);
    const [questionTitle, setQuestionTitle] = useState("");
    const [questionSummary, setQuestionSummary] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [questionTags, setQuestionTags] = useState("");

    const[questionTitleError, setQuestionTitleError] = useState("");
    const[questionSummaryError, setQuestionSummaryError] = useState("");
    const[questionTagsError, setQuestionTagsError] = useState("");
    


    useEffect(()=>{
        if(aQuestion!==undefined)
        {
            setQuestionTitle(aQuestion.title)
            setQuestionText(aQuestion.text)
            setQuestionSummary(aQuestion.summary)
            setQuestionTags(formatListOfTags(aQuestion.tags))
        }

    },[aQuestion]);


    function handleFormSubmit(editMode) {
        let validInput = true;
        
        //A field to enter the question title (max. 50 characters).
        if((questionTitle.length > 50 )|| (questionTitle.trim().length ===0)){
            setQuestionTitleError("Question title exceeds 50 characters or has 0 characters");
            validInput = false;
        }
        else{
            setQuestionTitleError("");
        }

        //A field to enter the question summary (max. 140 characters).
        if((questionSummary.length > 140) || (questionSummary.trim().length ===0)){
            setQuestionSummaryError("Question summary exceeds 140 characters or has 0 characters");
            validInput = false;
        }
        else{
            setQuestionSummaryError("");
        }

        //A new tag name can only be created by a user with at least 50 reputation points.
        const tagArray = questionTags.split(" ");
        let incorrectFormattedTags = [];
        tagArray.forEach((tag) => {
            if (tag.length > 10) {
                validInput = false;
                incorrectFormattedTags.push(tag);
            }
        });
   

        if (validInput) {
            const questionToPost = {
                title: questionTitle,
                text: questionText,
                summary: questionSummary,
                answers: [],
                comments: [],
                tagNames: tagArray,
                asked_by: currentUser.username,
                email: currentUser.email
            }
            //conditional Check here? different post method or add extra info to payload

            if (!editMode) {
                axios.post('http://localhost:8000/posts/questions', questionToPost)
                    .then(res => {
                        //clear the state vars real quick on the form so that we can use it the nedt time we go into this page
                        setQuestionTitle("");
                        setQuestionSummary("");
                        setQuestionText("");
                        setQuestionTags("");
                        setTagResultsFound(false);
                        setSearchResultsFound(false);
                        setActivePage("HomePage");

                        setQuestionTitleError("");
                        setQuestionSummaryError("");
                        setQuestionTagsError("");
                    }).catch((err) =>{
                        if(err.response.status === 400){
                            setQuestionTagsError("Cannot create new tags because user reputation is less than 50");
                        }
                      });

            }
            else{
                axios.post('http://localhost:8000/posts/questionsEdit/' + aQuestion._id, questionToPost)
                    .then(res => {
                        //clear the state vars real quick on the form so that we can use it the nedt time we go into this page
                        setQuestionTitle("");
                        setQuestionSummary("");
                        setQuestionText("");
                        setQuestionTags("");
                        setTagResultsFound(false);
                        setSearchResultsFound(false);
                        setActivePage("HomePage");

                        setQuestionTitleError("");
                        setQuestionSummaryError("");
                        setQuestionTagsError("");
                    }).catch((err) =>{
                        if(err.response.status === 400){
                            setQuestionTagsError("Cannot create new tags because user reputation is less than 50");
                        }
                      });;

            }
        }

    }
    function handleDeleteQuestion(){
        axios.delete('http://localhost:8000/posts/questions/' + aQuestion._id).then(
            res => {
                setQuestionTitle("");
                setQuestionSummary("");
                setQuestionText("");
                setQuestionTags("");
                setTagResultsFound(false);
                setSearchResultsFound(false);
                setActivePage("HomePage");

                setQuestionTitleError("");
                setQuestionSummaryError("");
                setQuestionTagsError("");
            }
        )
    }

    const handleUpdateQuestionTitle = (event) => {
        setQuestionTitle(event.target.value)
    }
    const handleUpdateQuestionSummary = (event) => {
        setQuestionSummary(event.target.value)
    }
    const handleUpdateQuestionText = (event) => {
        setQuestionText(event.target.value)
    }
    const handleUpdateQuestionTags = (event) => {
        setQuestionTags(event.target.value)
    }

    function loadQuestionPage() {
        //might need to double check for null but i think js returns undefined in these cases

        if (aQuestion === undefined) {
            return (
                <>
                    <TextField
                        required
                        id="questionTitle"
                        name="questionTitle"
                        label="Write Question Title Here"
                        fullWidth={true}
                        variant="outlined"
                        onChange={handleUpdateQuestionTitle}
                        sx={{ marginTop: 5 }}
                    />
                    {questionTitleError ? <p className="error-message">{questionTitleError}</p> : <></>}
                    <TextField
                        required
                        multiline
                        id="questionSummary"
                        name="questionSummary"
                        label="Write Question Summary Here"
                        fullWidth={true}
                        variant="outlined"
                        onChange={handleUpdateQuestionSummary}
                        sx={{ marginTop: 5 }}

                    />
                    {questionSummaryError ? <p className="error-message">{questionSummaryError}</p> : <></>}
                    <TextField
                        required
                        multiline
                        minRows={10}
                        id="questionText"
                        name="questionText"
                        label="Write Question Text Here"
                        fullWidth={true}
                        variant="outlined"
                        onChange={handleUpdateQuestionText}
                        sx={{ marginTop: 5 }}
                    />
                    <TextField
                        required
                        multiline
                        id="questionTags"
                        name="question"
                        label="Write Question Tags Here"
                        fullWidth={true}
                        variant="outlined"
                        onChange={handleUpdateQuestionTags}
                        sx={{ marginTop: 5 }}
                    />
                   {questionTagsError ? <p className='error-message'>{questionTagsError}</p>: <></>}
                    <Button variant="contained" sx={{ width: "10%", m: 2 }} onClick={()=>{handleFormSubmit(false);}}>Submit Question</Button>
                </>);
        }
        else {
            //load it in with already existing question data
            return (
                <>
                    <TextField
                        required
                        id="questionTitle"
                        name="questionTitle"
                        label="Write Question Title Here"
                        fullWidth={true}
                        variant="outlined"
                        onChange={handleUpdateQuestionTitle}
                        defaultValue={aQuestion.title}
                        sx={{ marginTop: 5 }}
                    />
                    {questionTitleError ? <p className="error-message">{questionTitleError}</p> : <></>}
                    <TextField
                        required
                        multiline
                        id="questionSummary"
                        name="questionSummary"
                        label="Write Question Summary Here"
                        fullWidth={true}
                        variant="outlined"
                        onChange={handleUpdateQuestionSummary}
                        defaultValue={aQuestion.summary}
                        sx={{ marginTop: 5 }}

                    />
                    {questionSummaryError ? <p className="error-message">{questionSummaryError}</p> : <></>}
                    <TextField
                        required
                        multiline
                        minRows={10}
                        id="questionText"
                        name="questionText"
                        label="Write Question Text Here"
                        fullWidth={true}
                        variant="outlined"
                        onChange={handleUpdateQuestionText}
                        defaultValue={aQuestion.text}
                        sx={{ marginTop: 5 }}
                    />
                    <TextField
                        required
                        multiline
                        id="questionTags"
                        name="question"
                        label="Write Question Tags Here"
                        fullWidth={true}
                        variant="outlined"
                        onChange={handleUpdateQuestionTags}
                        defaultValue={formatListOfTags(aQuestion.tags)}
                        sx={{ marginTop: 5 }}
                    />
                    {/* Check tags errors here for repuatation  */}
                    <Button variant="contained" sx={{ width: "10%", m: 2 }} onClick={()=>{handleFormSubmit(true)}}>Submit Question</Button>
                    <Button variant="contained" sx={{ width: "10%", m: 2 }} onClick={handleDeleteQuestion}>Delete Question</Button>
                </>);
        }
    }



    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <Header />
                <SideBar setListOfQuestions={setListOfQuestions} />
                <Box sx={{ marginTop: '6%', marginLeft: '20', display: 'flex', flexDirection: 'column', pl: 2, width: "50%" }}>
                    <Typography variant="h6" gutterBottom>
                        Ask A Question
                    </Typography>
                    {loadQuestionPage()}
                    
                </Box>

            </Box>
        </>
    );
}
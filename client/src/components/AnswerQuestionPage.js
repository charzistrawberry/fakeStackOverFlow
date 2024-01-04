import * as React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Header from './Header';
import SideBar from './SideBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import axios from 'axios';
import { AppContext } from '../AppContext';
export default function AnswerQuestionPage({activeQuestion,setListOfQuestions,setActiveQuestion}) {

    const {currentUser,setActivePage} = React.useContext(AppContext)
    const [answerText,setAnswerText] = React.useState(""); 

    const handleUpdateAnswerText=(event) =>{
        setAnswerText(event.target.value);
    }

    const handleFormSubmit =()=>{
        //Do some validation here for answer text length, non empty, valid hyperlinks
        //^ these can be done in the front end double check doc for any backend changes    

        let validInput = true;
        
        if(validInput){
            //text comments ans_by
            const answerToPost = {
                text: answerText,
                comment: [],
                ans_by: currentUser.username,
                email: currentUser.email
            }
            axios.post('http://localhost:8000/posts/answer/' + activeQuestion._id,answerToPost)
            .then(res =>{
                setAnswerText("");
                setActiveQuestion(res.data)
                setActivePage("QuestionPage");
            });
        }
    }

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <Header />
                <SideBar setListOfQuestions={setListOfQuestions}/>
                <Box sx={{ marginTop: '6%', marginLeft: '20', display: 'flex', flexDirection: 'column', pl: 2, width: "50%" }}>
                    <Typography variant="h6" gutterBottom>
                        Answer Question
                    </Typography>
                    <TextField
                                required
                                multiline
                                minRows={10}
                                id="answerText"
                                name="answerText"
                                label="Write Answer Text Here"
                                fullWidth = {true}
                                variant="outlined"
                                onChange={handleUpdateAnswerText}
                            />
                    <Button variant="contained" sx={{width:"10%", m:2}} onClick={handleFormSubmit}>Submit Answer</Button>
                </Box>
            </Box>
        </>
    );
}
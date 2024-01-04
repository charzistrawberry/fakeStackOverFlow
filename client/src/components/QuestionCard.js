


//For each question question  title, question summary, list of associated tags, and number of times it has been viewed, and voted,
//Number of answers it has username of questioner and the date it was posted

import { Box, Divider, Link, ListItem, Typography } from "@mui/material";
import { formatMetaDataDate } from "../AppUtility";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../AppContext";
axios.defaults.withCredentials = true;

export default function QuestionCard({aQuestion,setActiveQuestion, isForEdit}){
    const {_id,title,summary,tags,answers,asked_by,ask_date_time,views,up_votes} = aQuestion;
    const {setActivePage} = useContext(AppContext)
    
    
    function generateTags(){
        return tags.map(tag => {
            return(
                <span className = "tags-span" key = {_id +"-" + tag._id} >{tag.name}</span>
            );            
        });
    }

    async function handleClick(){
        
        // aQuestion.views ++;
        // Do axios request here where we modify the active question await axio
        let questionResponse =await axios.post('http://localhost:8000/posts/questions/' + _id);
        if(isForEdit === undefined){
            setActiveQuestion(questionResponse.data); //NOTE that switching the order of when the active qustion is set and when the page is set effects errors and how things get rendered
            setActivePage("QuestionPage"); // good to set the active question first
        }
        else{
            
            setActiveQuestion(questionResponse.data); //NOTE that switching the order of when the active qustion is set and when the page is set effects errors and how things get rendered
            setActivePage("EditAnswerPage"); // good to set the active question first
        }
    }

    return(
        <ListItem style={{ display: 'flex', fontSize: 22, borderBottom: "1px solid grey"}}>
            <Box style={{ color: 'grey', width: "8%" }}>
                {views + " views"}<br/>{answers.length + " answers"}<br/>{up_votes + " votes"}
            </Box>
                
            <Box style={{ marginInline:"8%", width: '70%' }}>
                <Link component="button" onClick={handleClick}>
                    <Typography variant="h6" style={{ color: 'blue' }}>
                    {title}
                    </Typography>
                </Link>   
                <br/>
                {summary}
                <br/>
                <div id = "question-tags">{generateTags()} </div>
            </Box>

            <Box style={{width: "10%"}}>
                <Typography style={{ color: 'red' }}>{asked_by}</Typography>
                <Typography style={{ color: 'gray' }}>asked {formatMetaDataDate(new Date(ask_date_time))}</Typography>
            </Box>
        <Divider/>
        </ListItem>
    );    
}
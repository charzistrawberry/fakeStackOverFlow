import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Header from './Header';
import QuestionCard from './QuestionCard';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { AppContext } from '../AppContext';
import { Grid, Typography } from '@mui/material';
import axios from 'axios';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SideBar from './SideBar';
axios.defaults.withCredentials = true;

export default function HomePage({ listOfQuestions, setListOfQuestions, setActiveQuestion }) {
  axios.defaults.withCredentials = true;
  const { setActivePage, tagResultsFound, searchResultsFound,isLoggedIn } = React.useContext(AppContext)
  const [sortBy, setSortBy] = React.useState("allByDate");
  const [currentIndex, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!tagResultsFound && !searchResultsFound) {
      try {
        axios.get('http://localhost:8000/posts/questions/sorted/' + sortBy)
          .then(res => {
            setListOfQuestions([...res.data]);
            setIndex(0);
          });
      }
      catch (error) {
        console.log(error);
      }
    }
    else {
      //sort through them in here on the front end
      let listOfQuestionsToSort = listOfQuestions;
      if (sortBy === "allByDate") {
        listOfQuestionsToSort.sort((a, b) => {
          if (a.ask_date_time > b.ask_date_time) {
            return -1;
          }
          else {
            return 1;
          }

        })
      }
      else if (sortBy === "allByActive") {
        listOfQuestionsToSort.sort((a, b) => {
          let aAnswers = a.answers;
          let bAnswers = b.answers;
          if (aAnswers.length === 0) {
            return 1;
          }
          if (bAnswers.length === 0) {
            return -1;
          }
          const mostRecentAAnswer = aAnswers.reduce((maxDate, currentAns) => {
            return currentAns.ans_date_time > maxDate ? currentAns.ans_date_time : maxDate;//if current is greater than max return cur otherwise max
          });
          const mostRecentBAnswer = bAnswers.reduce((maxDate, currentAns) => {
            return currentAns.ans_date_time > maxDate ? currentAns.ans_date_time : maxDate;
          })

          if (mostRecentAAnswer > mostRecentBAnswer) {
            return -1;
          }
          else {
            return 1;
          }
        });

      }
      else if (sortBy === "allUnanswered") {
        // listOfQuestionsToSort = listOfQuestionsToSort.filter((question) => (question.answers.length === 0 ? true : false))
      }
      setListOfQuestions([...listOfQuestionsToSort])
    }

  }, [sortBy]); // only triggers when sort by is changed


  //Idea for pages is to do a slice to create a new list and then map the new list
  //either next 5 or until the end of the list
  //Maybe new state variable for current page number/index in the list
  function generateQuestionCards(aListOfQuestions) {
    const startIndex = currentIndex;
    const endIndex = startIndex + 5;

    //Slice out only the set of 5 questions we want to see
    let questionsToDisplay = aListOfQuestions.slice(startIndex, endIndex);
    if(sortBy === "allUnanswered"){
      let unansweredQuestions = aListOfQuestions.filter((question) => (question.answers.length === 0 ? true : false));
      questionsToDisplay = unansweredQuestions.slice(startIndex, endIndex);
    }

    return questionsToDisplay.map(question => {
      return (
        <QuestionCard
          key={question._id}
          aQuestion={question}
          setActiveQuestion={setActiveQuestion}
        />
      );
    })
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <SideBar setListOfQuestions={setListOfQuestions} />
      <Box sx={{ marginTop: '5%', marginLeft: '20', display: 'flex', flexDirection: 'column', pl: 2 }}>
        <Grid container>
          <Grid item>
            <Button variant="contained" sx={{ fontSize: 20 }} disabled = {!isLoggedIn} onClick={()=>{setActivePage("AskQuestionPage")}}>Ask A Question</Button>
          </Grid>
          <Grid item>
            <Typography variant="h4" sx={{ marginInline: 35 }}>{listOfQuestions.length + " "} Questions</Typography>
          </Grid>
          <Grid item>
            <ButtonGroup disableElevation variant="contained" aria-label="Disabled elevation buttons" >
              <Button onClick={() => { setSortBy("allByDate") }}>Newest</Button>
              <Button onClick={() => { setSortBy("allByActive") }}>Active</Button>
              <Button onClick={() => { setSortBy("allUnanswered") }}>Unanswered</Button>
            </ButtonGroup>
          </Grid>
        </Grid>

        <List>
          {generateQuestionCards(listOfQuestions)}
        </List>
        <br />
        <Box sx={{ '& button': { m: 1 } }}>
          {currentIndex === 0 ? <Button size="large" disabled={true}><ArrowBackIosIcon />prev</Button> : <Button size="large" onClick={() => { setIndex(currentIndex - 5) }}><ArrowBackIosIcon />prev</Button>}
          <Button size="large" onClick={() => { let index = (currentIndex + 5) % listOfQuestions.length; (index < 5 || listOfQuestions.length === 0 ||(listOfQuestions.filter((question) => (question.answers.length === 0 ? true : false)).length===0 && sortBy ==="allUnanswered")) ? setIndex(0) : setIndex(index) }}>Next <ArrowForwardIosIcon /></Button>
        </Box>
      </Box>

    </Box>

  );
}
import { useContext, useEffect, useState } from "react";
import SignInSide from "./LoginScreen";
import SignUp from "./RegisterScreen";
import { AppContext } from '../AppContext.js';
import HomePage from "./HomePage.js";
import QuestionPage from "./QuestionPage.js";
import AnswerQuestionPage from "./AnswerQuestionPage.js";
import TagsPage from "./TagsPage.js";
import axios from "axios";
import UserProfilePage from "./UserProfilePage.js";
import AskQuestionPage from "./AskQuestionPage.js";
import AdminEditUser from "./AdminEditUser.js";
axios.defaults.withCredentials = true;

export default function FakeStackOverflow() {

  const appState = useContext(AppContext);
  const {listOfQuestions,setListOfQuestions} = appState;
  // const [listOfQuestions,setListOfQuestions] = useState([]);
  const [activeQuestion,setActiveQuestion] = useState(null);
  const [questionToEdit,setEditQuestion] = useState(null);
  // const [answerToEdit,setAnswerToEdit]
  useEffect(()=>{
    //So far this works when it loaded the page the questions loaded in
    axios.get('http://localhost:8000/posts/questions/sorted/allByDate')
    .then(res => {
      setListOfQuestions(res.data);
    })
  },[]); 



  //Might need to change or update
  function deactivatePagesOtherThanActive(){
    switch (appState.activePage){
      case "SignIn":
        return(
          <SignInSide></SignInSide>
        );
      case "HomePage":
        return(
          <HomePage 
          listOfQuestions={listOfQuestions}
          setListOfQuestions={setListOfQuestions}
          setActiveQuestion = {setActiveQuestion}
          />
        );
      case "SignUp":
        return(
          <SignUp/>
        );
      case "UserProfilePage":
          return(
            <UserProfilePage
            setListOfQuestions={setListOfQuestions}
            setEditQuestion = {setEditQuestion}
            setActiveQuestion = {setActiveQuestion}
            />
          );
      case "QuestionPage":
        return(
          <QuestionPage 
          activeQuestion={activeQuestion}
          setListOfQuestions={setListOfQuestions}
          setActiveQuestion={setActiveQuestion}
          />
        );
      case "AskQuestionPage":
        return(
          <AskQuestionPage
            setListOfQuestions={setListOfQuestions} 
          />
        );
      case "EditQuestionPage":
        return(
          <AskQuestionPage
            setListOfQuestions={setListOfQuestions}
            aQuestion={questionToEdit}
          />
        );
      case "EditAnswerPage":
        return(
          <QuestionPage
          activeQuestion={activeQuestion}
          setListOfQuestions={setListOfQuestions}
          editMode={true}
          />
        );
      case "AnswerQuestionPage":
        return(
          <AnswerQuestionPage
          activeQuestion = {activeQuestion}
          setListOfQuestions={setListOfQuestions}
          setActiveQuestion={setActiveQuestion}
          />
        );
      case "TagsPage":
        return(
          <TagsPage
          setListOfQuestions= {setListOfQuestions}
          />
        );
      case "AdminEditUser":
        return(
          <AdminEditUser
          setListOfQuestions={setListOfQuestions}
            setEditQuestion = {setEditQuestion}
            setActiveQuestion = {setActiveQuestion} />
        )
      default:
        return(
          <HomePage 
          listOfQuestions={listOfQuestions}
          setListOfQuestions={setListOfQuestions}
          setActiveQuestion = {setActiveQuestion}
          />
        );
    }

  }

  return (
    <>
    {
      deactivatePagesOtherThanActive()
    }
    </>
  );
}

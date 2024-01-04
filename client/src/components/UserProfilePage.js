import { Grid, Link, List, ListItem, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Header from "./Header";
import SideBar from "./SideBar";
import Button from '@mui/material/Button';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LabelIcon from '@mui/icons-material/Label';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { formatUserTimeStamp } from "../AppUtility";
import axios from "axios";
import QuestionCard from "./QuestionCard";

axios.defaults.withCredentials = true;

export default function UserProfilePage({ setListOfQuestions, setEditQuestion, setActiveQuestion }) {
    //Note that when adda our onClick Callback to make sure that we make a call to the get loggedIn route
    //We will then get an updated version of the user and use it in the rendering for this page
    const { currentUser, setActivePage,setCurrentUser,setUserToEdit } = useContext(AppContext);
    const [editMode, setEditMode] = useState("None");
    const [tagToEdit, setTagToEdit] = useState(null);
    const [listOfUsers, setListOfUsers] = useState([]);
    const [warningOpen, setWarningOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [currentIndex, setIndex] = useState(0);
    useEffect(()=>{
        if(currentUser.isAdmin){
            axios.get('http://localhost:8000/posts/users')
            .then(res =>{
                let resultList = res.data.filter(user =>{ return user.email !== currentUser.email});
                setListOfUsers([...resultList]);
            });
            
        }
        setUserToEdit({...currentUser})
    },[currentUser])

    const handleClickOpen = () => {
        setWarningOpen(true);
      };
    
    const handleClose = () => {
        setWarningOpen(false);
        setUserToDelete(null);
      };
    function AlertDialog({}) {
        return (
        <>
            <Dialog
              open={warningOpen}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Delete User?"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you would like to delete this user? All their questions, answers, and commment data will also be deleted. 
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={()=>{handleDeleteUser(userToDelete)}} autoFocus>
                  Delete User
                </Button>
              </DialogActions>
            </Dialog>
        </>
        );
      }

    const[tagToDeleteError, setTagToDeleteError] = useState("")

    function generateQuestionTitles(){
        if(currentUser.questions.length === 0){
            return(<h4>No Questions</h4>)
        }
        let questionsToReverse = [...currentUser.questions];
        questionsToReverse.reverse();
        return questionsToReverse.map( question =>{
            return(
            <ListItem key = {"userq-"+question._id} sx={{borderBottom: '1px solid grey', m: 2, p:2 }}>
                <Link component="button" onClick={()=>{handleEditQuestion(question)}}>
                    <Typography variant="h6" style={{ color: 'blue' }}>
                    {question.title}
                    </Typography>
                </Link>
            </ListItem>
            )
        }
        )
    }
    function handleSubmitTagName(tagName,tid){
        //send a user id as the payload.      
        const payload = {newName: tagName, userEmail: currentUser.email}
        axios.post('http://localhost:8000/posts/tags/' + tid,payload)
        .then(res => {
            let curUser = {...currentUser};
            curUser.tags = res.data;
            setCurrentUser(curUser);
            setTagToEdit(null)
        })
    }
    function handleDeleteTag(tid){

        axios.delete('http://localhost:8000/posts/tags/' + tid,{data:{userEmail: currentUser.email}})
        .then(res =>{
            let curUser = {...currentUser};
            curUser.tags = res.data;
            setCurrentUser(curUser);
            setTagToEdit(null);
            setTagToDeleteError("")
        }).catch((error) => {
        if(error.response.status === 400){
            setTagToDeleteError("Cannot delete tag because it is used by others")
        }
        });

    }

    function TagCard({tag}){
        //if its the tag we are editing then render the card one way other wise render it the normal way
        const [tagName, setTagName] = useState(tag.name);//LMAO is  this sketchy or humongous brain move XD

        if(tagToEdit!==null && tag._id === tagToEdit._id){
            return (
                <Grid item xs={4}>
                <Card sx={{ minWidth: 275,display: "flex", flexDirection:"column",alignItems:"center",justify:"center" }}>
                  <CardContent>
                    <TextField id = "tagText" name="tagText" defaultValue={tag.name} onChange={(event)=>{setTagName(event.target.value)}}/>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={()=> {handleSubmitTagName(tagName,tag._id)}}><DoneIcon/>Finish</Button>
                    <Button size="small" onClick={()=>{setTagToEdit(null)}}><ClearIcon/>Cancel</Button>
                  </CardActions>
                </Card>
                </Grid>
              );
        }
        return (
            <Grid item xs={4}>
            <Card sx={{ minWidth: 275,display: "flex", flexDirection:"column",alignItems:"center",justify:"center" }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {tag.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={()=>{setTagToEdit(tag)}}><EditIcon/>Edit</Button>
                <Button size="small" onClick={()=>{handleDeleteTag(tag._id)}}><DeleteIcon/>Delete</Button>
                {tagToDeleteError ?  <p className="error-message">{tagToDeleteError}</p> : <></>}
              </CardActions>
            </Card>
            </Grid>
          );
        

    }
    function generateTagCards(){
        if(currentUser.tags.length === 0){
            return(<h4>No Tags</h4>)
        }
        return currentUser.tags.map((tag)=>{
            return(
                <TagCard
                key={tag._id}
                tag={tag}
                />
            );
        })

    }
    function generateQuestionCards(){
        //These are the cards for when we are going to edit an answer we have for a question
        if(currentUser.questionsAnswered.length ===0){
            return(<h4>No Questions Answered</h4>)
        }
        const startIndex = currentIndex;
        const endIndex = startIndex + 5;

        //Slice out only the set of 5 questions we want to see
        let questionsToDisplay = currentUser.questionsAnswered.slice(startIndex, endIndex);
        return questionsToDisplay.map((question) =>{
            return(
                <QuestionCard
                    key={question._id}
                    aQuestion={question}
                    setActiveQuestion={setActiveQuestion}
                    isForEdit={true}
                />
            )
        })
    }

    function handleEditQuestion(question){
        setEditQuestion(question);
        setActivePage("EditQuestionPage")
    }

    function handleEditTags(){
        if(editMode === "Tags"){
            //basically just toggle it
            setTagToEdit(null);
            setEditMode("None");
        }
        else{
            setTagToEdit(null);
            setEditMode("Tags");
        }
    }
    function handleEditAnswers(){
        if(editMode === "Answers"){
            //basically just toggle it
            // setTagToEdit(null);
            setEditMode("None");
        }
        else{
            // setTagToEdit(null);
            setEditMode("Answers");
        }
    }
    //works similarly to the deactivatePagesOtherThanActive in app entry point so we can switch between edit modes
    function activeEditModes(){
        switch(editMode){
            case "None":
                return(
                    <></>
                );
            case "Tags":
                return(
                    <>
                <Typography variant="h5" pb={5}>Your Created Tags</Typography>
                <Grid container spacing={5}>
                {generateTagCards()}
                </Grid>
                    
                    
                </>
                );
            case "Answers":
                // setUserToEdit({...currentUser});
                return(
                    <>
                    <Typography variant="h5" pb={5}>Your Answered Questions</Typography>
                        <List>
                            {generateQuestionCards()}
                        </List>
                        {currentIndex === 0 ? <Button size="large" disabled={true}><ArrowBackIosIcon />prev</Button> : <Button size="large" onClick={() => { setIndex(currentIndex - 5) }}><ArrowBackIosIcon />prev</Button>}
                        <Button size="large" onClick={() => { let index = (currentIndex + 5) % currentUser.questionsAnswered.length; (index < 5 || currentUser.questionsAnswered.length === 0) ? setIndex(0) : setIndex(index) }}>Next <ArrowForwardIosIcon /></Button>
                    </>
                );

        }
    }
    function handleEditUser(userId){
        axios.get('http://localhost:8000/posts/user/' + userId)
        .then( res =>{
            setUserToEdit({...res.data});
            setActivePage("AdminEditUser");
        });
    }
    function handleDeleteUser(userId){
        axios.delete('http://localhost:8000/posts/users/' + userId)
        .then( res =>{
            let resultList = res.data.filter(user =>{ return user.email !== currentUser.email});
            setListOfUsers([...resultList]);
            setUserToDelete(null);
            handleClose();
        });
    }
    function generateUserCards(){
        if(listOfUsers.length===0){
            return(<h4>No Users</h4>);
        }
        return listOfUsers.map( (user) =>{
            return (
                <Grid item xs={4} key={"user-"+user._id}>
                <Card sx={{ minWidth: 275,display: "flex", flexDirection:"column",alignItems:"center",justify:"center" }}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {user.username}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={()=>{handleEditUser(user._id)}}><EditIcon/>Edit</Button>
                    <Button size="small" onClick={()=>{setUserToDelete(user._id); handleClickOpen()}}><DeleteIcon/>Delete</Button>
                  </CardActions>
                </Card>
                </Grid>
              );

        })
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Header />
            <SideBar setListOfQuestions={setListOfQuestions} />
            <Box sx={{ marginTop: '6%', marginLeft: '15%', display: 'flex', flexDirection: 'column', pl: 2, width: "50%", alignItems: "center", justify: "center" }}>
                <div stlye={{ display: "flex", flexDirection: "column", width: "100%" }}></div>
                <Grid container spacing={5} >
                    <Grid item xs={4}>
                        <Typography variant="h6" color={"green"} pb={5}>{currentUser.username}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6" pb={5}>{"Member Since " + formatUserTimeStamp(new Date(currentUser.timestamp))}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6" pb={5}>{currentUser.reputation + " reputation"}</Typography>
                    </Grid>
                </Grid>
                <Typography variant="h5">Your Submitted Questions <QuestionMarkIcon/></Typography> 
                <List sx={ {width:"100%"}}>
                    {generateQuestionTitles()}
                </List>
                <br/>
                <AlertDialog/>
                {currentUser.isAdmin ? <div><Typography variant="h5">Users <PersonIcon/></Typography> <Grid container spacing={27}>{generateUserCards()}</Grid></div> : <></>}
                <Grid container sx={{fontSize: 38}}>
                        <Grid item xs ={6}><Button variant="text" size="large" onClick={handleEditTags}>Edit Your Tags <LabelIcon sx={{marginLeft: 2}}/> </Button></Grid>
                        <Grid item xs = {6}><Button variant="text" size="large" onClick={handleEditAnswers}>Edit Your Answers <QuestionAnswerIcon sx={{marginLeft: 2}}/></Button></Grid>
                </Grid>
                {activeEditModes()}

            </Box>
        </Box>
    );
}
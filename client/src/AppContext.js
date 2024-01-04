import React, { createContext, useState } from "react";


export const AppContext = createContext();

//This will pretty much encapsulate some of the global stuff that i think all the components might need
//hopefully this should make it easier to retrive things like the current page, logged in user, and if the person is logged in 
//This way in other components we use useContext() to access this stuff

export function AppContextProvider(props){

    const [isLoggedIn,setIsLoggedIn] = useState(false);
    const [activePage, setActivePage] = useState("SignIn"); // HomePage, SignIn, SignUp
    const [currentUser, setCurrentUser] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [searchResultsFound,setSearchResultsFound] = useState(false);
    const [tagResultsFound,setTagResultsFound] = useState(false);
    const [listOfQuestions,setListOfQuestions] = useState([]);

    return(
        <AppContext.Provider value = {
            {isLoggedIn,setIsLoggedIn,
            activePage,setActivePage,
            currentUser,setCurrentUser,
            userToEdit, setUserToEdit,
            searchResultsFound,setSearchResultsFound,
            tagResultsFound,setTagResultsFound,
            listOfQuestions,setListOfQuestions}}
            >
            {props.children}
        </AppContext.Provider>
    )
 }
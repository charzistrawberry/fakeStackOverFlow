const bcrypt = require("bcrypt");
const saltRounds = 10; //How much randomness we sprinkle into the password
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
let router = express.Router();
const auth = require("../authUtility.js")
const tempSecret = "ha you read this loser :3 "
//Here we would call  the things to verify the token for loggedin and sign the token for registering and logging in
//We do so from our auth manager
//in our main router we would need to send it through the auth middle ware first then next it


// move this into another file and have the functions defined ther similar to hw1 model or app utility
router.post("/registerUser",async (req, res) => {
    let userPayload = req.body;

    //No two users can create an account with the same
    // email. The email should have a valid form. The
    // typed password should not contain the username
    // or the email id. 

    //Check if the username already exists
    let existingUser = await User.findOne({email: userPayload.email}).exec(); //want to see if it exists
    if(existingUser){
        //Give some error so front end knows to visually show error
       return res.status(400).json({ErrorMsg:"Cannot register, User email already exists"});
    }
    
    //The email should have a valid form. 
    if (userPayload.email.indexOf("@") === -1){
       return res.status(400).json({ErrorMsg:"Cannot register, User email form is not valid"});
    }

    //The typed password should not contain the username or the email id.
    if(userPayload.password.indexOf(userPayload.username) !== -1){
       return res.status(400).json({ErrorMsg:"Cannot register, User password contains username"});
    }

    let emailName = userPayload.email.substring(0,userPayload.email.indexOf("@"))
    if(userPayload.password.indexOf(emailName) !== -1){
       return res.status(400).json({ErrorMsg:"Cannot register, User password contains email"});
    }

    //Nicely styled feedback must be presented to the user if the account could not be created due to the above reasons or any other reason.
    
    const salt = await bcrypt.genSalt(saltRounds);
    console.log(userPayload)
    let newPasswordHash = await bcrypt.hash(userPayload.password,salt)

    const newUser = new User({
        username: userPayload.username,
        email: userPayload.email,
        passwordHash: newPasswordHash
    });

    await newUser.save();
    res.json({message: "success"})
    //fill in with some kind of helpful status mesage that will let hem know that the user
    //succesfully registered
    //This is only registering the user so dont need to do any jwt stuff here


});


router.post("/loginUser",async (req,res) => {
    
    let userPayload = req.body;
    console.log(userPayload);
    const aUser = await User.findOne({ email: userPayload.email}).exec() // Assuming that email is sent in with the request
    console.log(aUser)
    //Do some inital check here for logging in if user exits
    if(!aUser){
        //Note that these will return an error not let the rest of the then execute on the front end
       return res.status(400).json({ErrorMsg: "User does not exist with this Email/Account Name"});
    }
    
    const passwordMatches = await bcrypt.compare(userPayload.password,aUser.passwordHash);
    //Check if password matches
    if(!passwordMatches){
       return res.status(400).json({ErrorMsg: "Password does not match user with this Email"})
    }
    

    //Sign the token
    const token = jwt.sign({ userId: aUser._id},tempSecret);
    
    await aUser.populate('questions');
    await aUser.populate('questionsAnswered');
    await aUser.populate('tags')

    //send a response as a cookie and sign them in
    res.cookie("token", token,{
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }).status(200).json({
        username: aUser.username,
        email: aUser.email,
        reputation: aUser.reputation,
        timestamp: aUser.createdAt,
        questions: aUser.questions,
        questionsAnswered: aUser.questionsAnswered,
        tags: aUser.tags,
        isAdmin: aUser.isAdmin
    });
    //We can have a status send a long with it if needed

});

//route for signing user out
router.get('/logout', async (req,res)=>{
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
})


//route for getting if they are logged in
router.get("/loggedIn",async (req,res)=>{
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await User.findOne({ _id: userId });
        console.log("loggedInUser: " + loggedInUser);
        await loggedInUser.populate({path:'questions', populate:{path:"tags"}});
        await loggedInUser.populate({
            path:'questionsAnswered', 
            populate: [
                {path:'tags'},
                {path:'answers', populate:{path: 'comments'}},
                {path: 'comments'}
            ]
        });
        // await loggedInUser.populate([path]);
        console.log(loggedInUser.questionsAnswered)
        await loggedInUser.populate('tags');
        
        return res.status(200).json({
            email: loggedInUser.email,
            username: loggedInUser.username,
            reputation: loggedInUser.reputation,
            timestamp: loggedInUser.createdAt,
            questions: loggedInUser.questions,
            questionsAnswered: loggedInUser.questionsAnswered,
            tags:loggedInUser.tags,
            isAdmin: loggedInUser.isAdmin
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
});

module.exports = router


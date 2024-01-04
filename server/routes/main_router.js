const express = require("express")
const auth = require("../authUtility.js")
let router = express.Router()
const User = require("../models/user.js") //not sure if we need this one but imported for now
const Question = require("../models/questions.js")
const Answer = require("../models/answers.js")
const Comment = require("../models/comments.js")
const Tag = require("../models/tags.js")
// const mongoose = require("mongoose")

//ROUTER GET METHODS

//Get All Questions in the order they are sotred in the db I think its oldest first
router.get('/posts/questions', async (req, res) => {
    try {
        // console.log("Tried going in here")
        const questions = await Question.find({})
            .populate({ path: 'answers', populate: { path: 'comments' } })
            .populate("tags")
            .populate("comments")

        res.json(questions); //send it over as a json
    }
    catch (error) {

    }
});

//Get Questions based on some sort criteria: Newest, Active, Unanswered
router.get('/posts/questions/sorted/:sortBy', async (req, res) => {
    try {
        // console.log("Tried going in here")
        if (req.params.sortBy == "allByDate") {
            const questions = await Question.find({}).sort({ ask_date_time: 'desc' })
                .populate({ path: 'answers', populate: { path: 'comments' } })
                .populate("tags")
                .populate("comments");

            res.json(questions);
        }
        else if (req.params.sortBy === "allByActive") {
            const questions = await Question.find({})
                .populate({ path: 'answers', populate: { path: 'comments' } })
                .populate("tags")
                .populate("comments");// Does comment activity now count as being an active question? Might need to check for that

            questions.sort((a, b) => {
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
            res.json(questions);
        }
        else if (req.params.sortBy === "allUnanswered") {
            const questions = await Question.find({ 'answers': [] })
                .sort({ ask_date_time: 'desc' })
                .populate({ path: 'answers', populate: { path: 'comments' } })
                .populate("tags")
                .populate("comments");

            res.json(questions);
        }

    }
    catch (error) {
        console.log(error);
    }
});

//GET for retrieving a set of questions based on search criteria sent thru the front end as an object req.query ={searchText,listOfTags}
router.get('/posts/questions/search', async (req, res) => {
    let searchText = req.query.searchText;
    let tags = req.query.listOfTags;
    if (tags === undefined) {
        tags = [];
    }
    let tagDocs = await Tag.find({ name: { $in: tags } }); //match all the tags that name is in tags(so what we passed in)
    //Essentially it will compare the name with the list of names against the cur name ex: 'react' against ['react, 'java']
    let tagRefs = tagDocs.map((curTag) => {
        return curTag._id;
    });
    // console.log(typeof(tagRefs[1]));
    //NOTE THIS SHOULD PROBABLY BE SORTED BY DATE
    if (searchText.length !== 0 && tags.length !== 0) {
        const questions = await Question.find({
            $or: [
                { title: { $regex: searchText, $options: 'i' } },
                { text: { $regex: searchText, $options: 'i' } },
                { tags: { $in: tagRefs } }
            ],
        }).sort({ ask_date_time: 'desc' })
            .populate({ path: 'answers', populate: { path: 'comments' } })
            .populate("tags")
            .populate("comments");
        res.json(questions);
    }
    else if (tags.length !== 0) {
        const questions = await Question.find({ tags: { $in: tagRefs } }).sort({ ask_date_time: 'desc' })
            .populate({ path: 'answers', populate: { path: 'comments' } })
            .populate("tags")
            .populate("comments");
        res.json(questions);
    }
    else if (searchText.length !== 0) {
        const questions = await Question.find({
            $or: [
                { title: { $regex: searchText, $options: 'i' } },
                { text: { $regex: searchText, $options: 'i' } },
            ],
        }).sort({ ask_date_time: 'desc' })
            .populate({ path: 'answers', populate: { path: 'comments' } })
            .populate("tags")
            .populate("comments");
        res.json(questions);
    }
    return;
});

//GET for getting a list of Questions based on a tag id, get all questions associated with a tag
router.get('/posts/questions/byTags/:id', async (req, res) => {
    try {
        //NOTE TRY TO SORT BY DATE HERE
        const questions = await Question.find({});
        const filteredList = await questions.filter((currentQ) => {
            return (currentQ.tags.includes(req.params.id))
        });
        for (question of filteredList) {
            await question.populate("tags")
            await question.populate("comments")
            await question.populate({ path: 'answers', populate: { path: 'comments' } })
            // .populate({path:'answers',populate: {path:'comments'}})
            // .populate("comments");
        }
        filteredList.sort((a, b) => {
            if (a.ask_date_time > b.ask_date_time) {
                return -1;
            }
            else {
                return 1;
            }

        })
        res.json(filteredList);

    }
    catch (error) {
        console.log(error);
    }
});


//GET for getting a list of answers associated with a question id
router.get('/posts/answers/:_id', async (req, res) => {
    try {
        //NOTE sort by date
        let qObjectRef = req.params._id;
        const question = await Question.findById(qObjectRef)
            .populate({ path: 'answers', populate: { path: 'comments' } })
            .populate('tags');
        question.answers.sort((a, b) => {
            if (a.ans_date_time > b.ans_date_time) {
                return -1;
            }
            else {
                return 1;
            }

        })
        res.json(question.answers);

    }
    catch (error) {
        console.log(error);

    }
});

//GET for retrieving all the tags in the DB with the number of qs associated with them used in tags page
router.get('/posts/tags', async (req, res) => {
    try {
        let tags = await Tag.find({}).lean(); //lean should return a jsObject which lets us modify the object and let it be recogonized
        //apparently this removes some document features tho, should be ok since we just want to add a field
        for (let i = 0; i < tags.length; i++) {
            const questions = await Question.find({});
            const filteredList = await questions.filter((currentQ) => {
                return (currentQ.tags.includes(tags[i]._id))
            });
            tags[i]["numOfQs"] = filteredList.length;
        }
        res.json(tags);
    }
    catch (error) {

    }

});


//GET for retrieving all the users in the application
router.get('/posts/users', auth.verify, async (req, res) => {
    try {
        let users = await User.find({});
        return res.json(users);
    }
    catch (error) {
        console.log(error);
    }
});

//GET to retrive relevant populated fields of User by Id
router.get('/posts/user/:_id', auth.verify, async (req, res) => {
    try {
        let aUser = await User.findById(req.params._id);
        await aUser.populate({ path: 'questions', populate: { path: "tags" } });
        await aUser.populate({
            path: 'questionsAnswered',
            populate: [
                { path: 'tags' },
                { path: 'answers', populate: { path: 'comments' } },
                { path: 'comments' }
            ]
        });
        await aUser.populate('tags');
        return res.status(200).json({
            email: aUser.email,
            username: aUser.username,
            reputation: aUser.reputation,
            timestamp: aUser.createdAt,
            questions: aUser.questions,
            questionsAnswered: aUser.questionsAnswered,
            tags: aUser.tags,
            isAdmin: aUser.isAdmin
        })
    }
    catch (error) {
        console.log(error);
    }
});



//ROUTER POST AND PUT METHODS

//Post a new Question into the DB given some payload in the req body
router.post('/posts/questions', auth.verify, async (req, res) => {
    let newQuestionJson = req.body;

    let tagObjectRefs = [];
    let listOfTagNames = newQuestionJson.tagNames;
    const questionAuthor = await User.findOne({ email: req.body.email }); // find the user with the email


    //NOTE HERE WE NEED TO DO A CHECK FOR IF THE USER HAS ENOUGH REPUTATION to create a tag
    //will leave in here for now because im using postman to create some sample questions
    for (let i = 0; i < listOfTagNames.length; i++) {
        const tagQueryResult = await Tag.findOne({ name: listOfTagNames[i].toLowerCase() }); // look for a tag that has the same name as what was passed in

        if (tagQueryResult) {
            //Then it exists didnt return null or undefined
            tagObjectRefs.push(tagQueryResult);
        }
        else {
            // going to need to create a new one with this name
            if (questionAuthor.reputation < 50 && !questionAuthor.isAdmin) {
                return res.status(400).json("Not Enough Reputation to Create new tags")
            }
            const newTag = new Tag({ name: listOfTagNames[i].toLowerCase(), created_by: req.body.asked_by });
            await newTag.save(); // save the new tag returns a new document so it might be better to save this to a new var/ can revisit if it breaks
            tagObjectRefs.push(newTag);
            questionAuthor.tags.push(newTag);
        }
    }

    const newQuestion = new Question({
        title: req.body.title,
        text: req.body.text,
        summary: req.body.summary,
        tags: tagObjectRefs,
        answers: req.body.answers,
        comments: req.body.comments,
        asked_by: req.body.asked_by,
        userEmail: req.body.email
    });

    questionAuthor.questions.push(newQuestion);
    questionAuthor.save();

    await newQuestion.save();
    res.json({ message: "success" });
});

//POST FOR Editing a preexisting question with the following id, will not create a new question but update the already existing
router.post('/posts/questionsEdit/:_id', auth.verify, async (req, res) => {
    let newQuestionJson = req.body;
    let tagObjectRefs = [];
    let listOfTagNames = newQuestionJson.tagNames;
    const questionAuthor = await User.findOne({ email: req.body.email }); // find the user with the email


    //NOTE HERE WE NEED TO DO A CHECK FOR IF THE USER HAS ENOUGH REPUTATION to create a tag
    //will leave in here for now because im using postman to create some sample questions
    for (let i = 0; i < listOfTagNames.length; i++) {
        const tagQueryResult = await Tag.findOne({ name: listOfTagNames[i].toLowerCase() }); // look for a tag that has the same name as what was passed in

        if (tagQueryResult) {
            //Then it exists didnt return null or undefined
            tagObjectRefs.push(tagQueryResult);
        }
        else {
            // going to need to create a new one with this name
            if (questionAuthor.reputation < 50 && !questionAuthor.isAdmin) {
                return res.status(400).json("Not Enough Reputation to Create new tags")
            }
            const newTag = new Tag({ name: listOfTagNames[i].toLowerCase(), created_by: req.body.asked_by });
            await newTag.save(); // save the new tag returns a new document so it might be better to save this to a new var/ can revisit if it breaks
            tagObjectRefs.push(newTag);
            questionAuthor.tags.push(newTag);
        }
    }
    const questionToEdit = await Question.findOne({ _id: req.params._id })
    questionToEdit.title = req.body.title;
    questionToEdit.text = req.body.text;
    questionToEdit.summary = req.body.summary;
    questionToEdit.tags = tagObjectRefs;
    questionToEdit.answers = req.body.answers;
    questionToEdit.comments = req.body.comments;

    // questionAuthor.questions.push(newQuestion);
    // questionAuthor.save();

    await questionToEdit.save();
    res.json({ message: "success" });
});


//POST for when we want to update the view count of the question with the following id
router.post('/posts/questions/:_id', async (req, res) => {
    //This will be for just updating the view count 
    let question = await Question.findById(req.params._id)
        .populate('tags')
        .populate({ path: 'answers', populate: { path: 'comments' } })
        .populate('comments');
    question.views++;
    question.save();
    res.json(question); //we can use this to our advantage to get the update question and then set it as active question
});

//POST for when we want to update a Question, Answer, or Comments votes and update the user who posted reputation(UPVOTE)
router.post('/posts/upvote/:_id', auth.verify, async (req, res) => {
    const payload = req.body;
    const userVoting = await User.findOne({ email: payload.userVoting }); //person to check reputation

    if (payload.type === "Question") {
        //Check for 50 reputation
        if (userVoting.reputation < 50 && !userVoting.isAdmin) {
            //Then send an error
            return res.status(400).json("Not Enough Reputation to vote");
        }
        const questionToUpdate = await Question.findById(req.params._id); //get the question to update
        questionToUpdate.up_votes++;
        questionToUpdate.save(); // save with the new votes
        const questionAuthor = await User.findOne({ email: questionToUpdate.userEmail });
        questionAuthor.reputation += 5;
        questionAuthor.save();
        await questionToUpdate.populate('tags')
        await questionToUpdate.populate({ path: 'answers', populate: { path: 'comments' } })
        await questionToUpdate.populate('comments');
        return res.json(questionToUpdate);
    }
    else if (payload.type === "Answer") {
        //Check for 50 reputation
        if (userVoting.reputation < 50 && !userVoting.isAdmin) {
            //Then send an error
            return res.status(400).json("Not Enough Reputation to vote");
        }
        const answerToUpdate = await Answer.findById(req.params._id);
        answerToUpdate.up_votes++;
        answerToUpdate.save();
        const answerAuthor = await User.findOne({ email: answerToUpdate.userEmail });
        answerAuthor.reputation += 5;
        answerAuthor.save();
        const parentQuestion = await Question.findById(payload.qid).populate('answers');
        return res.json(parentQuestion.answers)
    }
    else if (payload.type === "Comment") {
        //No need to check for 50 reputation
        const commentToUpdate = await Comment.findById(req.params._id);
        commentToUpdate.up_votes++;
        commentToUpdate.save();
        return res.json(commentToUpdate)
    }
});

//POST for when we want to update a Question, Answer, comments votes and negatively affect repuation(DownVote) 
router.post('/posts/downvote/:_id', auth.verify, async (req, res) => {
    const payload = req.body;
    const userVoting = await User.findOne({ email: payload.userVoting }); //person to check reputation

    if (payload.type === "Question") {
        //Check for 50 reputation
        if (userVoting.reputation < 50 && !userVoting.isAdmin) {
            //Then send an error
            return res.status(400).json("Not Enough Reputation to vote");
        }
        const questionToUpdate = await Question.findById(req.params._id); //get the question to update
        questionToUpdate.up_votes--;
        questionToUpdate.save(); // save with the new votes
        const questionAuthor = await User.findOne({ email: questionToUpdate.userEmail });
        questionAuthor.reputation -= 10;
        questionAuthor.save();
        await questionToUpdate.populate('tags')
        await questionToUpdate.populate({ path: 'answers', populate: { path: 'comments' } })
        await questionToUpdate.populate('comments');
        return res.json(questionToUpdate);
    }
    else if (payload.type === "Answer") {
        //Check for 50 reputation
        if (userVoting.reputation < 50 && !userVoting.isAdmin) {
            //Then send an error
            return res.status(400).json("Not Enough Reputation to vote");
        }
        const answerToUpdate = await Answer.findById(req.params._id);
        answerToUpdate.up_votes--;
        answerToUpdate.save();
        const answerAuthor = await User.findOne({ email: answerToUpdate.userEmail });
        answerAuthor.reputation -= 10;
        answerAuthor.save();
        const parentQuestion = await Question.findById(payload.qid).populate('answers');
        return res.json(parentQuestion.answers)
    }
});

//POST for when we want to create a new Answer for a question with the following id
router.post('/posts/answer/:_id', auth.verify, async (req, res) => {
    const newAnswer = new Answer({
        text: req.body.text,
        comments: req.body.comments,
        ans_by: req.body.ans_by,
        userEmail: req.body.email

    });
    // console.log(req.params._qid);
    let qid = req.params._id;
    let question = await Question.findById(qid);
    let userWhoPosted = await User.findOne({ email: req.body.email });
    userWhoPosted.questionsAnswered.push(question);
    userWhoPosted.save();
    question.answers.push(newAnswer);
    question.save();
    await question.populate('tags')
    await question.populate({ path: 'answers', populate: { path: 'comments' } })
    await question.populate('comments');

    newAnswer.save();
    res.json(question);
});


//POST for when we want to create a new comment for a question or answer with the following id
router.post('/posts/comment/:_id', auth.verify, async (req, res) => {
    //Req body will have 3 fields as is text, username, and if it was for a question
    const userCommenting = await User.findOne({ email: req.body.email })
    if (userCommenting.reputation < 50 && !userCommenting.isAdmin) {
        return res.status(400).json("Cannot post comment reputation is less than 50");
    }
    const newComment = new Comment({
        text: req.body.text,
        comment_by: req.body.username,
        userEmail: req.body.email
    })

    if (req.body.fromQuestion) {
        let question = await Question.findById(req.params._id).populate('comments');
        question.comments.push(newComment)
        question.save()
        newComment.save();
        // question.populate('comments');
        res.json({ comments: question.comments })
    }
    else {
        let answer = await Answer.findById(req.params._id).populate('comments');
        answer.comments.push(newComment)
        answer.save()
        newComment.save();
        // answer.populate('comments')
        res.json({ comments: answer.comments })
    }
})

//POST for when we want to update an Answer passed in answer id into the params 
router.post('/posts/answers/edit/:_id', auth.verify, async (req, res) => {
    const answerToEdit = await Answer.findById(req.params._id);
    answerToEdit.text = req.body.newText;
    answerToEdit.save();

    //Should be ok to just change the text

    //Retrieve the new list of answers
    const updatedQuestion = await Question.findById(req.body.questionId); // retrieve the question given the id in the body/payload
    await updatedQuestion.populate('answers');

    res.json(updatedQuestion.answers)

});


//POST for when we want to update a tag we will throw an exception if the tag is being used by anyone
router.post('/posts/tags/:_id', auth.verify, async (req, res) => {
    const tag = await Tag.findById(req.params._id);
    // const tagObjectId = mongoose.ObjectId(tag._id);

    const questionsWithTag = await Question.find({ tags: tag._id })
    const aUser = await User.findOne({ email: req.body.userEmail }).populate('questions');
    const userQuestionsWithTag = await aUser.questions.filter((currentQ) => {
        return (currentQ.tags.includes(tag._id))
    });

    if (questionsWithTag.length != userQuestionsWithTag.length) {
        console.log("should not be allowed")
    }
    //Im just gonna raw traverse there might be a better way for mongoose to query but wanna get this done

    tag.name = req.body.newName;
    await tag.save();
    await aUser.populate('tags');
    // console.log(aUser);
    res.json(aUser.tags);

});


//DELETE routes to handle stuff for removing stuff from the DB

//DELETE for when we want to remove a question this should be the only delete we need to define as it will also
//delete all the associated comments, answers, and the associated comments of the answers
router.delete('/posts/questions/:_id', auth.verify, async (req, res) => {
    let qid = req.params._id;

    const question = await Question.findById(qid).populate('answers');
    //Loop through all answers in question
    for (const answer of question.answers) {
        await answer.populate('comments'); //get the comments from the answer
        for (const comment of answer.comments) {
            Comment.findByIdAndDelete(comment);
        }
        Answer.findByIdAndDelete(answer._id);
    }
    for (const commentId of question.comments) {
        Comment.findByIdAndDelete(commentId);
    }

    await Question.findByIdAndDelete(qid);

    res.json({});
})

//DELETE for answers for when the user wants to delete an answer they created assuming the question id is passed in in params and aid,userEmail is passed in body
router.delete('/posts/answers/:_id', auth.verify, async (req, res) => {
    const anAnswer = await Answer.findById(req.body.aid);
    const aUser = await User.findOne({ email: req.body.userEmail }) // we need the user so we can remove if from the answers they created aka clean up
    aUser.questionsAnswered = aUser.questionsAnswered.filter(currentQ => { return (String(currentQ) !== req.params._id) });
    aUser.save(); //should get rid of it from the aUser
    for (const commentId of anAnswer.comments) {
        Comment.findByIdAndDelete(commentId); // for username we could also a find() loop through the list only one of them can have the same id since they are unique within the collection
    }
    await Answer.findByIdAndDelete(req.body.aid);
    const questionWithAnswer = await Question.findById(req.params._id);
    questionWithAnswer.answers.filter(currentAns => { return String(currentAns) !== req.body.aid });
    questionWithAnswer.save();
    await questionWithAnswer.populate('answers');
    res.json(questionWithAnswer.answers);

});

//DELETE for tags for when the user wants to delete a tag that they created, but only they use
router.delete('/posts/tags/:_id', auth.verify, async (req, res) => {

    const questionsWithTag = await Question.find({ tags: req.params._id }) // quick query to see if anyone is using this
    const aUser = await User.findOne({ email: req.body.userEmail }).populate('questions');
    const userQuestionsWithTag = await aUser.questions.filter((currentQ) => {
        return (currentQ.tags.includes(req.params._id))
    });
    if (questionsWithTag.length != userQuestionsWithTag.length) {
        console.log("should not be allowed");
        return res.status(400).json("Tag is used by others");

    }
    for (const question of questionsWithTag) {
        question.tags = question.tags.filter(tag => { return String(tag) !== req.params._id });
        question.save();
    }

    aUser.tags = await aUser.tags.filter(tag => {
        return String(tag) !== req.params._id
    });
    aUser.save()
    await aUser.populate('tags')
    Tag.findByIdAndDelete(req.params._id);

    res.json(aUser.tags);
});

//DELETE for user this should only be done if the person is the admin
router.delete('/posts/users/:_id', auth.verify, async (req, res) => {
    const userToDelete = await User.findById(req.params._id); // since emails are tied to the schema this sohuld be easier
    const questionsByUser = await Question.find({ userEmail: userToDelete.email });
    const answersByUser = await Answer.find({ userEmail: userToDelete.email });
    await Comment.deleteMany({ userEmail: userToDelete.email });
    if (questionsByUser) {
        for (const question of questionsByUser) {
            for (const answerId of question.answers) {
                let answer = await Answer.findById(answerId)
                if (answer) {
                    for (const commentId of answer.comments) {
                        await Comment.findByIdAndDelete(commentId)
                    }
                }
                await Answer.findByIdAndDelete(answerId);
            }
            await Question.findByIdAndDelete(question._id);
        }
    }
    if (answersByUser) {
        for (const answerId of answersByUser) {
            let answer = await Answer.findById(answerId)
            for (const commentId of answer.comments) {
                await Comment.findByIdAndDelete(commentId)
            }
            await Answer.findByIdAndDelete(answerId);
        }
    }
    await User.findByIdAndDelete(userToDelete._id);
    allUsers = await User.find({});
    res.json(allUsers)
});


module.exports = router

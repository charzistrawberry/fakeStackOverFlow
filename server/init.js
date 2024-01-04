// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.

let userArgs = process.argv.slice(2);
const bcrypt = require("bcrypt");
const saltRounds = 10; //How much randomness we sprinkle into the password
// if (!userArgs[0].startsWith('mongodb')) {
//     console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
//     return
// }
let adminEmail = 'admin@gmail.com';
let adminUsername = userArgs[0];
let adminPassword = userArgs[1];

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let Comment = require('./models/comments')
let User = require('./models/user')


let mongoose = require('mongoose');
let mongoDB = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let tags = [];
let answers = [];
function tagCreate(name, created_by) {
  let tag = new Tag({ name: name, created_by: created_by });
  return tag.save();
}

function commentCreate(text, comment_by, comment_date_time, userEmail, up_votes){
    commentdetail = { 
        text: text,
        comment_by: comment_by,
        userEmail: userEmail,
    }
    if(comment_date_time != false) commentdetail.comment_by = comment_by;
    if(up_votes != false) commentdetail.up_votes = up_votes;
    let comment = new Comment(commentdetail);
    return comment.save();
}

function answerCreate(text, ans_by, ans_date_time,comments, userEmail,up_votes) {
  answerdetail = {text:text};
  if (ans_by != false) answerdetail.ans_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;
  if (comments != false) answerdetail.comments = comments;
  if (userEmail != false) answerdetail.userEmail = userEmail;
  if (up_votes != false) answerdetail.up_votes = up_votes;

  let answer = new Answer(answerdetail);
  return answer.save();
}

function questionCreate(title, text, tags, answers, asked_by, ask_date_time, views, up_votes, comments, userEmail,summary) {
  qstndetail = {
    title: title,
    text: text,
    tags: tags,
    asked_by: asked_by,
    summary: summary,
    userEmail: userEmail,
  }
  if (answers != false) qstndetail.answers = answers;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if (views != false) qstndetail.views = views;
  if (comments != false) qstndetail.comments = comments;
  if (userEmail != false) qstndetail.userEmail = userEmail;
  if (up_votes != false) qstndetail.up_votes = up_votes;

  let qstn = new Question(qstndetail);
  return qstn.save();
}

function userCreate(email,username, password, reputation, isAdmin, questions, questionsAnswered, tags){
    userdetail = {
        email: email,
        username: username,
        reputation: reputation,
        isAdmin: isAdmin,
    }
    //hash password
    const salt = bcrypt.genSaltSync(saltRounds);
    let newPasswordHash = bcrypt.hashSync(password,salt)
    userdetail.passwordHash = newPasswordHash;
    if(questions != false) userdetail.questions= questions;
    if(questionsAnswered != false) userdetail.questionsAnswered = questionsAnswered;
    if(tags != false) userdetail.tags = tags;

    let user = new User(userdetail);
    return user.save();
}

const populate = async () => {
  

  // Create Tags
  let t1 = await tagCreate('react',adminEmail);
  let t2 = await tagCreate('javascript','Chris');
  let t3 = await tagCreate('android-studio','Sharon');
  let t4 = await tagCreate('shared-preferences','Chris');
  let t5 = await tagCreate('render','Sharon');
  let t6 = await tagCreate('efficiency',adminEmail);
  let t7 = await tagCreate('optimize',adminEmail);

  //Create Answer Comments
  let c1 = await commentCreate('Comment for answer with upvotes', 'Chris', false, 'testUser1@gmail.com', 24); // some upvotes
  let c2 = await commentCreate('Comment for answer with no upvotes', 'Chris', false, 'testUser1@gmail.com', 0); // no upvotes
  let c3 = await commentCreate('Comment for answer with uppvotes', 'Sharon', false, 'testUser2@gmail.com', 2); // no upvotes
  let c4 = await commentCreate('Comment for answer with no upvotes', adminUsername, false, adminEmail, 0); // no upvotes
  
  //Create Question Comments
  let c5 = await commentCreate('Question Comment for question with upvotes', 'Chris', false, 'testUser1@gmail.com', 24);
  let c6 = await commentCreate('Question Comment for question with uppvotes', 'Sharon', false, 'testUser2@gmail.com', 5);
  let c7 = await commentCreate('Question Comment for question with uppvotes', adminUsername, false, adminEmail, 0);

  //Create Answers 
  let a1 = await answerCreate('React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.', 'Chris', false,[c1,c2,c3,c4],'testUser1@gmail.com',2);
  let a2 = await answerCreate('On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.', 'Sharon', false,[],'testUser2@gmail.com',0);
  let a3 = await answerCreate('Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.', 'Sharon', false,[],'testUser2@gmail.com',0);
  let a4 = await answerCreate('YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);', adminUsername, false,[],adminEmail,0);
  let a5 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own. ', adminUsername, false,[],adminEmail,10);
  let a6 = await answerCreate('Use PureComponent: PureComponent automatically implements shouldComponentUpdate with a shallow prop and state comparison, reducing unnecessary renders.', 'Chris', false,[],'testUser1@gmail.com',2);
  let a7 = await answerCreate('Memoization with React.memo: Wrap your functional components with React.memo to memoize the result and prevent re-rendering if props have not changed.', 'Sharon', false,[],'testUser2@gmail.com',0);
  let a8 = await answerCreate('Virtualize Long Lists: Implement virtualization techniques like react-virtualized or react-window for rendering only the items currently visible in the viewport.', 'Chris', false,[],'testUser1@gmail.com',6);
  let a9 = await answerCreate('Optimize Event Handlers: Avoid creating new functions in render methods, as it can lead to unnecessary re-renders. Instead, bind event handlers in the constructor or use arrow functions.', 'Chris', false,[],'testUser1@gmail.com',0);
  let a10 = await answerCreate('Use the React DevTools Profiler: Identify performance bottlenecks by utilizing the React DevTools Profiler to analyze component render times.', 'Sharon', false,[],'testUser2@gmail.com',5);
  let a11 = await answerCreate('PureComponent for Pure Functions: If your component doesn\'t rely on any external state or props, consider making it a pure function using React.memo or PureComponent.', 'Sharon', false,[],'testUser2@gmail.com',0);
  let a12 = await answerCreate('Bundle Splitting: Split your application into smaller chunks using tools like Webpack\'s code splitting to only load the code necessary for the current view.', adminUsername, false,[],adminEmail,10);
  let a13 = await answerCreate('Optimize Images: Compress and lazy-load images to reduce initial load times, and consider using responsive images with the "srcset" attribute.', 'Sharon', false,[],'testUser2@gmail.com',0);
  let a14 = await answerCreate('Memoize Expensive Computations: If your component relies on expensive computations, memoize the results using libraries like Reselect to avoid unnecessary recalculations.', adminUsername, false,[],adminEmail,10);
  let a15 = await answerCreate('Profiling with React Profiler API: Use the React Profiler API to measure the render time of specific components and identify areas for optimization.', 'Chris', false,[],'testUser1@gmail.com',2);
  
  //Create Questions
  let q1 = await questionCreate('Programmatically navigate using React router', 'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.', [t1, t2], [a1, a2], adminUsername, false, false,5,[c5,c6,c7],adminEmail,'Short summary to show for question');
  let q2 = await questionCreate('android studio save string shared preference', 'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.', [t3, t4, t2], [a3, a4, a5], 'Chris', false, 121,0,[],'testUser1@gmail.com', 'short summary to be displayed for second question');
  let q3 = await questionCreate('Optimize Rendering Performance in React', 'How can I optimize rendering performance in a React application?', [t1, t2, t5, t6, t7], [a6, a7, a8, a9, a10, a11, a12, a13, a14, a15], 'Sharon', false, 377,10,[],'testUser2@gmail.com','summary for third question');
  
  //Create Users
  await userCreate(adminEmail,adminUsername,String(adminPassword),0,true,[q1],[q2,q3],[t1,t6,t7]); //admin user
  await userCreate('testUser1@gmail.com','Chris','1234',0,false,[q2],[q1,q3],[t2,t4]); //test user no reputation
  await userCreate('testUser2@gmail.com','Sharon','1234',150,false,[q3],[q1,q2,q3],[t3,t5]); //test user 50+ reputation
  
  if(db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');

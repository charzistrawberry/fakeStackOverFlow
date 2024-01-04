const jwt = require("jsonwebtoken")

//This is to decouple the authentication methods that would verify or sign the token
const tempSecret = "ha you read this loser :3 "

function authUtility() {

    //We'll use the below to send it through this verification first and then send it to
    //The main_router middleware
    verify = (req, res, next) => {
        //this is where we verify the token
        try {
            const token = req.cookies.token;
            //check if it exists and was sent with the request
            if (!token) {
                return res.status(401).json({
                    loggedIn: false,
                    user: null,
                    errorMessage: "Unauthorized"
                })
            }
            //Verify here with the secret
            const decodedToken = jwt.verify(token, tempSecret)
            // console.log("verified.userId: " + verified.userId);
            req.userId = decodedToken.userId; //set the request user id to the verfied user id

            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                loggedIn: false,
                user: null,
                errorMessage: "Unauthorized"
            });
        }
    }
    verifyUser = (req) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return null;
            }

            const decodedToken = jwt.verify(token, tempSecret);
            return decodedToken.userId;
        } catch (err) {
            return null;
        }
    }

    return this;
}

const auth = authUtility();
module.exports = auth;
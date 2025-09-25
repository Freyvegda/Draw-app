import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config";

const app = express();

app.post('/signup', async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    
})

app.post('/signin', async (req, res)=>{
    const userId = 1;
    const token= jwt.sign({
        userId
    }, JWT_SECRET)
})

app.post('/home', async (req, res)=>{

})

app.listen(3002)
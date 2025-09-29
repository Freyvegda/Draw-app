import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SignInSchema } from "@repo/common/types";

const app = express();
app.post('/signup', async (req, res)=>{
    const data  = CreateUserSchema.safeParse(req.body)
    if(!data){
        return res.json({
            msg: "Incorrect Inputs"
        })
    }
    res.json({
        userId : 123
    })
})


app.post('/signin', async (req, res)=>{
    const data = SignInSchema.safeParse(req.body)

    if(!data){
        res.json({
            msg:"Please give correct Sign-in Inputs!"
        })
    }
    const userId = 1;
    const token= jwt.sign({
        userId
    }, JWT_SECRET)
})

app.post('/room',middleware, async (req, res)=>{
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data){
        return res.json({
            msg: "Enter valid Room ID"
        })
    }
    res.json({
        roomId : 123
    })
})

app.listen(3002)
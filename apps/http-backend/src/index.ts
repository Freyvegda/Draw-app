import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SignInSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt"

const app = express();
app.use(express.json())


app.post('/signup', async (req, res)=>{
    const parsedData  = CreateUserSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.json({
        msg: "Incorrect Inputs"
        })
    }
    try{
        const hashedPassword = await bcrypt.hash(parsedData.data.password,10)
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                password: hashedPassword,
                name: parsedData.data.name
            }
        })
        res.json({
            userId : user.id
        })
    }   
    catch(err){
        res.status(411)
        console.error(err);
        res.json({
            msg: "An error occured"
        })
    }
})


app.post('/signin', async (req, res)=>{
    const parsedData = SignInSchema.safeParse(req.body)

    if(!parsedData){
        res.json({
            msg:"Please give correct Sign-in Inputs!"
        })
    }
    try{
        const user =  await prismaClient.user.findUnique({
            where:{
                email : parsedData.data?.email
            }
        })

        if (!parsedData.data?.password || !user?.password) {
            return res.status(401).json({msg: "Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({msg: "Invalid Password"})
        }
        const token= jwt.sign({
            userId : user?.id
        }, JWT_SECRET)
        res.json({msg: token})
    }
    catch(err){
        console.error(err);
        res.status(411);
        res.json({
            msg: "Could Not Sign-in"
        })
    }
})

app.post('/room',middleware, async (req, res)=>{
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData){
        return res.json({
            msg: "Enter valid Room ID"
        })
    }
    const userId = req.userId;
    try{
        if (!parsedData.data?.roomName) {
            return res.status(400).json({ msg: "Room name is required" });
        }
        if (!userId) {
            return res.status(400).json({ msg: "User ID is required" });
        }
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.roomName,
                adminId: userId
            }
        })
        res.json({
            roomId : room.id
        })
    }
    catch(err){
        console.error(err);
        res.status(411).json({
            msg:"Room already exists"
        })
    }
})

app.listen(3002)
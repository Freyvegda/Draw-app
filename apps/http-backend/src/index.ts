import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SignInSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt"
import cors from "cors"

const app = express();
app.use(express.json())
app.use(cors())


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
        }, JWT_SECRET!)
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

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({ msg: "Invalid room data" });
  }

  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    if (!parsedData.data?.roomName) {
      return res.status(400).json({ msg: "Room name is required" });
    }

    // Check if room already exists
    const existingRoom = await prismaClient.room.findFirst({
      where: { slug: parsedData.data.roomName },
    });

    if (existingRoom) {
      return res.status(409).json({ msg: "Room already exists" });
    }

    const room = await prismaClient.room.create({
      data: { slug: parsedData.data.roomName, adminId: userId },
    });

    return res.json({ roomId: room.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/room/create", middleware, async (req, res) => {
  const { roomName } = req.body;
  const userId = req.userId
  
  if (!roomName) return res.status(400).json({ msg: "Room name required" });
  if (!userId) return res.status(401).json({ msg: "User not authorized" });

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: roomName,
        adminId: userId,
      },
    });
    res.json({ roomId: room.id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Room already exists or creation failed" });
  }
});

app.get('/chats/:roomId', async (req, res)=>{
    try{
        const roomId = req.params.roomId;

        const room = await prismaClient.room.findUnique({
            where :{
                id: roomId
            },
            select:{ slug: true}
        })

        const messages = await prismaClient.chat.findMany({
            where:{
                roomId: roomId
            },
            orderBy:{
                id: "asc"
            },
            take: 50
        });
    
        res.json({
            messages,
            roomName: room?.slug || "Untitled Room", // ✅ include name safely
        });
    }
    catch(err){
        console.error(err);
        res.json({messages: [], roomName: "Unknown Room" })
    }
})

// GET /room/:slug
app.get("/room/:slug", middleware, async (req, res) => {
  try {
    const slug = req.params.slug;

    const room = await prismaClient.room.findFirst({ where: { slug } });

    if (!room) {
      // 🔹 Must return JSON + 404
      return res.status(404).json({ msg: "Room not found" });
    }

    return res.json({ room: { id: room.id, slug: room.slug } });
  } catch (err) {
    console.error("Failed to fetch room:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});


app.listen(3002)
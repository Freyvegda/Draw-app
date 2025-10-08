import { RoomCanvas } from "@/components/RoomCanvas";


export default async function CanvasPage({params}:{
    params:{
        roomId : string
    }
}){
    const roomId = (await params).roomId;
    console.log("joining room", roomId);
    
    return <RoomCanvas roomId = {roomId}/>
}
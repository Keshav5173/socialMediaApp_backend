import mongoose from "mongoose";

const connectDb =  async ()=>{
    try{
        await mongoose.connect(`${process.env.DB_URL}/chatApp`);
        console.log("Sucessfully connected to Database");
    }
    catch(err){
        console.log("Error Occured while connecting to Database", err);
    }
}

export default connectDb;
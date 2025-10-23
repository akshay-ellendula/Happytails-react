import mongoose from "mongoose";
const connect_Db = async() => {
    try {
        await mongoose.connect(process.env.DB_STRING);
        console.log('mongoDB connected :', mongoose.connection.host);
    } catch (error) {
        console.error("Error form config_db :", error)
        process.exit(1);
    }
}
export default connect_Db;
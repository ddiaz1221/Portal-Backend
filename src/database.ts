import mongoose from 'mongoose';

// this is to connect to the database
const connectDB = async (): Promise<void> => {
    try{
        // this creates a connString for a process using the definition in the .env file
        const connString = process.env.MONGO_URI;
        
        // if there is no connString then output and error
        if(!connString){
            console.error('Database connection error: MONGO_URI is missing in .env file');
            process.exit(1);
        }

        // this creates a connection to the database from a processes connString
        const conn = await mongoose.connect(connString);
        console.log(`The database has been connected successfully: ${conn.connection.host}`);
    }   
    // This is error protection for the database if the connection failed the process gets terminated so it doesn't
    // affect the data base
    catch (error){
        console.error(`The connection to the database failed: ${(error as Error).message}`);
        process.exit(1);
    }
}

export default connectDB;
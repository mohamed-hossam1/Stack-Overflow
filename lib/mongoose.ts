import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache || {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

const dbConnect = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "devflow",
      family: 4,
      serverSelectionTimeoutMS: 30000,
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};

export default dbConnect;

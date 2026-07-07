import mongoose from "mongoose";
import environment from '../env.config.js';

const baseMongooseOpts = {
    serverSelectionTimeoutMS: 10000,
}

export const connectToMongoDB = async () => {
    try {
        const uri = environment.MONGO_URI;
        if (!uri) {
            console.warn('[DB] No se encontró MONGO_URI. Se omitirá la conexión a MongoDB y se usará almacenamiento en memoria.');
            return false;
        }
        await mongoose.connect(uri, baseMongooseOpts);
        console.log('✅ MongoDB conectado exitosamente.!!');
        return true;
    } catch (error) {
        console.warn('[DB] No se pudo conectar a MongoDB. Se usará almacenamiento en memoria.', error.message);
        return false;
    }
};

export const connectMongoDBAltas = async () => {
    try {
        const uri = environment.MONGO_URI_ATLAS;
        if (!uri) {
            console.warn('[DB] No se encontró MONGO_URI_ATLAS. Se omitirá la conexión a MongoDB Atlas y se usará almacenamiento en memoria.');
            return false;
        }
        await mongoose.connect(uri, baseMongooseOpts)
        console.log('✅ MongoAltas conectado exitosamente.!!')
        return true;
    } catch (error) {
        console.warn('[DB] No se pudo conectar a MongoDB Atlas. Se usará almacenamiento en memoria.', error.message);
        return false;
    }
};

export const connectAuto = async () => {
    const target = (environment.MONGO_TARGET || "LOCAL").toUpperCase();
    if (target === "ATLAS") return connectMongoDBAltas();
    return connectToMongoDB();
}
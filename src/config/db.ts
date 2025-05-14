// src/config/db.ts (solución completa)
import mongoose from 'mongoose';

// Definir el tipo para la caché global de mongoose
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Añadir la declaración global para typescript
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Variable para cachear la conexión
let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null
};

// Guardar la caché en global
if (!global.mongoose) {
  global.mongoose = cached;
}

const connectDB = async (): Promise<typeof mongoose> => {
  // Si ya hay una conexión activa, reutilízala
  if (cached.conn) {
    return cached.conn;
  }

  // Si ya hay una promesa de conexión en curso, espera a que se resuelva
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // Aumentado a 30 segundos
      socketTimeoutMS: 75000, // Aumentado a 75 segundos
      connectTimeoutMS: 30000, // Aumentado a 30 segundos
      maxPoolSize: 10,
      minPoolSize: 1,
      // Añadir para mayor estabilidad
      heartbeatFrequencyMS: 10000, // Verificar conexión cada 10 segundos
      autoIndex: false, // Desactivar indexación automática en producción
    };

    // Crear una nueva promesa de conexión
    cached.promise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rain-fitness', opts)
      .then((mongoose) => {
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        cached.promise = null; // Resetear la promesa en caso de error
        throw err;
      });
  }

  try {
    // Esperar a que la promesa se resuelva y guardar la conexión
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    // Manejar errores
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
};

// Función para manejar el cierre de la conexión
// Útil para scripts y pruebas, no necesario en serverless
export const disconnectDB = async (): Promise<void> => {
  if (cached.conn) {
    await cached.conn.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB Disconnected');
  }
};

export default connectDB;
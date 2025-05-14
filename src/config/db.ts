import mongoose from 'mongoose';

// Interfaz para el objeto de caché
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Variable para cachear la conexión
// En entornos serverless, esta se inicializa en cada invocación en frío,
// pero se reutiliza entre invocaciones posteriores mientras la instancia esté activa
let cached: MongooseCache = global.mongoose;

// Inicializar el caché si no existe
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
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
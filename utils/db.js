import mongoose from 'mongoose';

const connection = {};

const connect = async () => {
  if (connection.isConnected) {
    console.log('DB is already connected');
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;

    if (connection.isConnected === 1) {
      console.log('Use previous connection');
      return;
    }

    await mongoose.disconnect();
  }
  const db = await mongoose.connect(process.env.MONGODB_URI);
  console.log('Database connected successfully!');
  connection.isConnected = db.connections[0].readyState;
}

const disconnect = async () => {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') { // only disconnect in production mode, not development
      await mongoose.disconnect();
      connection.isConnected = false;
      console.log('DB has been disconnected');
    } else {
      console.log('Not disconnected');
    }
  }
}

// fix for serialization error
const convertDocToString = (doc) => {
  doc._id = doc._id.toString();
  doc.createdAt = doc.createdAt.toString();
  doc.updatedAt = doc.updatedAt.toString();

  return doc;
}

const db = { connect, disconnect, convertDocToString };

export default db;
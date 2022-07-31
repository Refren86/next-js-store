import mongoose from 'mongoose';

const connection = {};

const connect = async () => {
  if (connection.isConnected) {
    console.log('Already connected');
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
  console.log('New connection');
  connection.isConnected = db.connections[0].readyState;
}

const disconnect = async () => {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') { // only disconnect in production mode, not development
      await mongoose.disconnect();
      connection.isConnected = false;
    } else {
      console.log('Not disconnected');
    }
  }
}

const db = { connect, disconnect };

export default db;
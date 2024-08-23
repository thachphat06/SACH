const { MongoClient } = require('mongodb');

const url = "mongodb://localhost:27017";
const dbName = 'sach';

async function connectDb() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log('Kết nối thành công đến server');
    return client.db(dbName);
  } catch (error) {
    console.error('Lỗi kết nối cơ sở dữ liệu:', error);
    throw error; // Ném lỗi để router xử lý
  }
}

module.exports = connectDb;

import { MongoClient } from 'mongodb'

const mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING
if (!mongodbConnectionString) throw new Error(`[Missing Env] MONGODB_CONNECTION_STRING is required.`)

export default new MongoClient(mongodbConnectionString)

import redis from 'redis'
import { promisify } from 'util'

export default class RedisCache {
  constructor() {
    this.client = redis.createClient();

    // Promisify Redis commands for easier async/await usage
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  async get(key) {
    try {
      const data = await this.getAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting data from cache:', error);
      return null;
    }
  }

  async set(key, data, expirationInSeconds) {
    try {
      const value = JSON.stringify(data);
      if (expirationInSeconds) {
        await this.setAsync(key, value, 'EX', expirationInSeconds);
      } else {
        await this.setAsync(key, value);
      }
      return true;
    } catch (error) {
      console.error('Error setting data in cache:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.delAsync(key);
      return true;
    } catch (error) {
      console.error('Error deleting data from cache:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.getAsync(key);
      return result !== null;
    } catch (error) {
      console.error('Error checking data existence in cache:', error);
      return false;
    }
  }

  async merge (key, objectToMerge) {
    try {
      const existingArray = await this.get(key) || [];
      existingArray.push(objectToMerge);
      await this.set(key, existingArray);
      return true;
    } catch (error) {
      console.error('Error merging data into array in cache:', error);
      return false;
    }
  }
}

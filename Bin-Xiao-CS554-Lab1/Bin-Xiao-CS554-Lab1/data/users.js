// users.js

import bcrypt from 'bcrypt';
import * as mongoCollection from '../config/mongoCollections.js';
import helpers from '../helpers.js';

const usersCollection = await mongoCollection.users();


const signUpUser = async (name, username, password) => {
  // 1.validation
  const validName = helpers.checkName(name);
  const validUsername = helpers.checkUsername(username);
  const validPassword = helpers.checkPassword(password);
  
  const existingUser = await usersCollection.findOne({ username: validUsername.toLowerCase() });
  if (existingUser) {
    throw new Error(`Username "${validUsername}" is already taken.`);
  }

  // 2. hash password
  const hashedPassword = await bcrypt.hash(validPassword, 16);
  // 3. encapsulate new user
  const newUser = {
    name: validName,
    username: validUsername.toLowerCase(), 
    password: hashedPassword
  };
  // 4. insert new user to db
  const insertInfo = await usersCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error('Could not add user.');
  }

  
  return {
    _id: insertInfo.insertedId.toString(),
    name: validName,
    username: validUsername
  };
};

const loginUser = async (username, password) => {
  // 1. validation
  const validUsername = helpers.checkUsername(username);
  const validPassword = helpers.checkPassword(password);

  const user = await usersCollection.findOne({ username: validUsername.toLowerCase() });
  if (!user) {
    throw new Error('Either the username or password is invalid.');
  }
  // 2.compare password
  const passwordMatch = await bcrypt.compare(validPassword, user.password);
  if (!passwordMatch) {
    throw new Error('Either the username or password is invalid.');
  }

  // return user
  return {
    _id: user._id.toString(),
    name: user.name,
    username: user.username
  };
};

export { signUpUser, loginUser };

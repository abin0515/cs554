//Here you will import route files and export the constructor method as shown in lecture code and worked in previous labs.
import usersRoutes from './users.js';
import postsRoutes from './posts.js';

import { Router } from 'express';

import * as postsData from '../data/posts.js';


const router = Router();
const constructorMethod = (app) => {
  app.use('/', usersRoutes);
  app.use('/posts', postsRoutes);
  

  // query page
  app.get('/feed', async (req, res) => {
    try {
      let page = req.query.page;
      if (!page) page = 1;
      else page = parseInt(page, 10);

      const posts = await postsData.getPostsByPage(page);
      if (posts.length === 0) {
        return res.status(404).json({ error: 'There are no more Posts.' });
      }
      return res.status(200).json(posts);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

  app.use('*', (req, res) => {
    res.status(404).send("Please check you url!");
  });
};

export default constructorMethod;
// route.js
import { Router } from 'express';
import { signUpUser, loginUser } from '../data/users.js';
const router = Router();


router.post('/signup', async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const newUser = await signUpUser(name, username, password);
    res.status(200).json(newUser);
  } catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await loginUser(username, password);

    req.session.user = user; 
    return res.status(200).json(user);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});


router.get('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out.' });
    }
   
    res.status(200).json({ message: 'Logged out successfully' });
  });
});



export default router;

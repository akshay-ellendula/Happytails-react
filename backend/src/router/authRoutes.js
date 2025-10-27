import express from 'express';
import { logout, signin, signup, eventManagersignin, eventManagersignup, adminSignin, adminSignup,verifyAuth } from '../controller/authControllers.js'
const router = express.Router();
router.route('/signup').post(signup);
router.route('/signin').post(signin);
router.route('/logout').post(logout);
router.route('/eventManagerSignup').post(eventManagersignup);
router.route('/eventManagerSignin').post(eventManagersignin);
router.route('/adminSignup').post(adminSignup);
router.route('/adminSignin').post(adminSignin);
router.get('/verify', verifyAuth);
export default router;
import express from 'express';
import passport from '../config/passport.js';
import {
    logout, signin, signup, eventManagersignin, eventManagersignup, adminSignin, adminSignup, verifyAuth, storePartnerSignup, storePartnerSignin, forgotPassword, // Import this
    resetPassword, googleAuth, googleAuthCallback, getGoogleAuthUrl
} from '../controller/authControllers.js'
const router = express.Router();
router.route('/signup').post(signup);
router.route('/signin').post(signin);
router.route('/logout').post(logout);
router.route('/eventManagerSignup').post(eventManagersignup);
router.route('/eventManagerSignin').post(eventManagersignin);
router.route('/adminSignup').post(adminSignup);
router.route('/adminSignin').post(adminSignin);
router.route('/storeSignup').post(storePartnerSignup);
router.route('/storeSignin').post(storePartnerSignin);
router.get('/verify', verifyAuth);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resetToken').put(resetPassword);
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);
router.get('/google/url', getGoogleAuthUrl);
export default router;
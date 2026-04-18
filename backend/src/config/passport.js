import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Customer from '../models/customerModel.js';
import EventManager from '../models/eventManagerModel.js';
import Vendor from '../models/vendorModel.js';
import jwt from 'jsonwebtoken';

export const configureGoogleStrategy = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
                passReqToCallback: true,
                proxy: true, // IMPORTANT: Allows HTTPS callback URLs when deployed on Render/Vercel
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    console.log('Full Google profile:', JSON.stringify(profile, null, 2));
                    
                    // Extract email - make sure we get the first verified email
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    if (!email) {
                        throw new Error('No email found from Google profile');
                    }
                    
                    // Extract name properly - Google returns name as an object
                    let userName = '';
                    if (profile.name) {
                        // If name is an object with givenName and familyName
                        if (typeof profile.name === 'object') {
                            const givenName = profile.name.givenName || '';
                            const familyName = profile.name.familyName || '';
                            userName = `${givenName} ${familyName}`.trim();
                        } else if (typeof profile.name === 'string') {
                            userName = profile.name;
                        }
                    }
                    
                    // Fallback to displayName if name is not available
                    if (!userName && profile.displayName) {
                        userName = profile.displayName;
                    }
                    
                    // If still no name, use email username
                    if (!userName) {
                        userName = email.split('@')[0];
                    }
                    
                    console.log('Extracted user data:', { email, userName });
                    
                    const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
                    const googleId = profile.id;
                    
                    // Get role from query parameters or state
                    const role = req.query.role || req.query.state || 'customer';
                    console.log('Role from query:', role);
                    
                    let user;
                    let Model;
                    
                    // Select model based on role
                    switch(role) {
                        case 'eventManager':
                            Model = EventManager;
                            break;
                        case 'vendor':
                        case 'storePartner':
                            Model = Vendor;
                            break;
                        default:
                            Model = Customer;
                    }
                    
                    console.log('Using model for role:', role);
                    
                    // Check if user exists with this email
                    user = await Model.findOne({ email });
                    
                    if (!user) {
                        console.log('Creating new user with role:', role);
                        const userData = {
                            email,
                            userName: userName,
                            profilePic: picture || `https://avatar-api-theta.vercel.app/${Math.floor(Math.random() * 100) + 1}.png`,
                            googleId,
                            isGoogleLogin: true,
                        };
                        
                        // Add role-specific fields
                        if (role === 'eventManager') {
                            userData.companyName = '';
                            userData.phoneNumber = '';
                        } else if (role === 'vendor' || role === 'storePartner') {
                            userData.name = userName;
                            userData.store_name = '';
                            userData.contact_number = '';
                            userData.store_location = '';
                        }
                        
                        // Use new Model() + save({ validateBeforeSave: false }) so that
                        // Mongoose's conditional "required" validators (which check this.googleId)
                        // are not triggered — Model.create() validates before googleId is fully
                        // attached to the document context, causing spurious validation errors.
                        user = new Model(userData);
                        await user.save({ validateBeforeSave: false });
                        console.log('User created successfully');
                    } else {
                        console.log('Existing user found');
                        // Update existing user with googleId if not present
                        if (!user.googleId) {
                            user.googleId = googleId;
                            user.isGoogleLogin = true;
                            await user.save({ validateBeforeSave: false });
                            console.log('Updated user with Google ID');
                        }
                    }
                    
                    // Generate JWT token
                    const tokenPayload = {};
                    let idField;
                    
                    if (role === 'customer') {
                        idField = 'customerId';
                        tokenPayload[idField] = user._id;
                    } else if (role === 'eventManager') {
                        idField = 'eventManagerId';
                        tokenPayload[idField] = user._id;
                    } else if (role === 'vendor') {
                        idField = 'vendorId';
                        tokenPayload[idField] = user._id;
                    }
                    
                    tokenPayload.role = role === 'vendor' ? 'vendor' : role;
                    
                    const token = jwt.sign(
                        tokenPayload,
                        process.env.JWT_SECRET_KEY,
                        { expiresIn: '7d' }
                    );
                    
                    console.log('JWT token generated for role:', role);
                    return done(null, { user, token, role });
                } catch (error) {
                    console.error('Google Strategy Error:', error);
                    return done(error, null);
                }
            }
        )
    );
    
    passport.serializeUser((userData, done) => {
        done(null, userData);
    });
    
    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
    
    return passport;
};

export default passport;
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const googleAuth = {
  signIn: async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    return {
      email: cred.user.email ?? '',
      name: cred.user.displayName ?? '',
      id: cred.user.uid,
    };
  },

  signOut: async () => {
    await signOut(auth);
    return true;
  },
};

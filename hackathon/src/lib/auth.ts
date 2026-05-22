import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { User, UserRole } from '@/types/medical';

function roleFromEmail(email: string, hint?: string): UserRole {
  if (hint === 'doctor' || email.includes('doctor')) return 'DOCTOR';
  if (hint === 'pharmacy' || email.includes('pharmacy')) return 'PHARMACY';
  return 'PATIENT';
}

function toAppUser(fbUser: FirebaseUser, role: UserRole): User {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    role,
    verified: fbUser.emailVerified,
  };
}

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const storedRole = (sessionStorage.getItem('userRole') as UserRole) || 'PATIENT';
        this.currentUser = toAppUser(fbUser, storedRole);
        sessionStorage.setItem('isLoggedIn', 'true');
        this.notifyListeners();
      } else {
        // Only clear session if there's no demo user stored
        // (demo users are not real Firebase users so fbUser will be null)
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          // Keep the demo session intact
          this.currentUser = JSON.parse(storedUser);
        } else {
          this.currentUser = null;
          sessionStorage.clear();
        }
        this.notifyListeners();
      }
    });
  }

  async login(email: string, password: string, role?: 'patient' | 'doctor' | 'pharmacy' | 'admin'): Promise<User> {
    if (!email || !password) throw new Error('Email and password required');

    const userRole = roleFromEmail(email, role);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = toAppUser(cred.user, userRole);
      this.currentUser = user;
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userRole', userRole);
      this.notifyListeners();
      return user;
    } catch (firebaseError: any) {
      // Fallback: allow demo credentials to work without a real Firebase project
      const demoCreds: Record<string, UserRole> = {
        'doctor@hospital.com': 'DOCTOR',
        'doctor@swasth.ai': 'DOCTOR',
        'doctor@test.com': 'DOCTOR',
        'pharmacy@store.com': 'PHARMACY',
        'pharmacy@swasth.ai': 'PHARMACY',
        'pharmacy@test.com': 'PHARMACY',
        'patient@email.com': 'PATIENT',
        'patient@swasth.ai': 'PATIENT',
        'patient@test.com': 'PATIENT',
      };
      const demoPwds = ['password123', 'demo123', 'doctor123', 'patient123', 'pharmacy123'];
      if (demoCreds[email] && demoPwds.includes(password)) {
        const mockUser: User = {
          id: 'demo_' + email,
          email,
          role: demoCreds[email],
          verified: true,
        };
        this.currentUser = mockUser;
        sessionStorage.setItem('user', JSON.stringify(mockUser));
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userRole', demoCreds[email]);
        this.notifyListeners();
        return mockUser;
      }
      throw new Error(firebaseError.message || 'Login failed');
    }
  }

  async loginWithGoogle(): Promise<User> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = toAppUser(cred.user, 'PATIENT');
      this.currentUser = user;
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userRole', 'PATIENT');
      this.notifyListeners();
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = sessionStorage.getItem('user');
      this.currentUser = stored ? JSON.parse(stored) : null;
    }
    return this.currentUser;
  }

  onUserChange(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }

  isDoctor(): boolean {
    return this.getCurrentUser()?.role === 'DOCTOR';
  }

  requireDoctor(): void {
    if (!this.isDoctor()) throw new Error('UNAUTHORIZED: Doctor access required');
  }

  async logout(): Promise<void> {
    await signOut(auth);
    this.currentUser = null;
    sessionStorage.clear();
    localStorage.clear();
    this.notifyListeners();
  }

  isAuthenticated(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true' && this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    return sessionStorage.getItem('isAdmin') === 'true';
  }
}

export const authService = new AuthService();

import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword as fbUpdatePassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { deleteApp } from 'firebase/app';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, createSecondaryAuthApp } from '../firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import { UserProfile, UserRole } from '../types';
import { usernameToInternalEmail } from '../utils/formatters';
import { logAuditEvent } from './auditService';

const USERS_PATH = 'users';

// Sign in with username and password
export async function loginWithUsername(usernameInput: string, passwordInput: string): Promise<UserProfile> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  if (!cleanUsername) {
    throw new Error('Silakan masukkan username Anda.');
  }
  if (!passwordInput) {
    throw new Error('Silakan masukkan password Anda.');
  }

  const internalEmail = usernameToInternalEmail(cleanUsername);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, internalEmail, passwordInput);
    const user = userCredential.user;

    // Fetch user profile from Firestore
    const userDocRef = doc(db, USERS_PATH, user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      // Check if this is the default super admin 'ulurtangan' logging in for the first time
      if (cleanUsername === 'ulurtangan') {
        const adminProfile: UserProfile = {
          uid: user.uid,
          username: 'ulurtangan',
          fullName: 'Super Administrator YIUT',
          department: 'PIMPINAN_DAN_OPERASIONAL',
          role: 'SUPER_ADMIN',
          isActive: true,
          mustChangePassword: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, adminProfile);
        await logAuditEvent('LOGIN_USER', `Super Admin ulurtangan berhasil masuk ke sistem`, 'User', user.uid);
        return adminProfile;
      }
      await signOut(auth);
      throw new Error('Profil pengguna tidak ditemukan dalam database YIUT.');
    }

    const profile = userSnap.data() as UserProfile;

    // Check if account is active
    if (!profile.isActive) {
      await signOut(auth);
      throw new Error('Akun Anda saat ini dinonaktifkan. Silakan hubungi Super Admin Yayasan.');
    }

    await logAuditEvent('LOGIN_USER', `Pengguna ${profile.fullName} (${profile.username}) berhasil masuk`, 'User', user.uid);
    return profile;
  } catch (error: any) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('auth/invalid-credential') || errorMsg.includes('auth/user-not-found') || errorMsg.includes('auth/wrong-password')) {
      throw new Error('Username atau password salah. Silakan periksa kembali.');
    }
    if (errorMsg.includes('auth/too-many-requests')) {
      throw new Error('Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.');
    }
    throw error;
  }
}

// Bootstrap Super Admin if not yet registered in Firebase Auth
export async function bootstrapSuperAdmin(passwordInput: string): Promise<void> {
  const cleanUsername = 'ulurtangan';
  const internalEmail = usernameToInternalEmail(cleanUsername);

  if (passwordInput.length < 12) {
    throw new Error('Password Super Admin minimal 12 karakter sesuai standar keamanan YIUT.');
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, internalEmail, passwordInput);
    const adminProfile: UserProfile = {
      uid: cred.user.uid,
      username: 'ulurtangan',
      fullName: 'Super Administrator YIUT',
      department: 'PIMPINAN_DAN_OPERASIONAL',
      role: 'SUPER_ADMIN',
      isActive: true,
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, USERS_PATH, cred.user.uid), adminProfile);
    await logAuditEvent('BOOTSTRAP_SUPER_ADMIN', 'Akun Super Admin ulurtangan berhasil diinisialisasi', 'User', cred.user.uid);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Akun Super Admin ulurtangan sudah ada di Firebase Auth. Silakan langsung masuk dengan password Anda.');
    }
    throw error;
  }
}

// Create new staff account using Secondary Auth without logging out Super Admin
export async function createStaffAccount(
  username: string,
  fullName: string,
  department: string,
  role: UserRole,
  temporaryPassword: string,
  phoneNumber?: string
): Promise<string> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) throw new Error('Username wajib diisi');
  if (temporaryPassword.length < 12) throw new Error('Password minimal 12 karakter');

  // Verify username uniqueness in Firestore
  const q = query(collection(db, USERS_PATH), where('username', '==', cleanUsername));
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan oleh staf lain.`);
  }

  const internalEmail = usernameToInternalEmail(cleanUsername);
  const { secondaryApp, secondaryAuth } = createSecondaryAuthApp();

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, internalEmail, temporaryPassword);
    const newUid = cred.user.uid;

    const newProfile: UserProfile = {
      uid: newUid,
      username: cleanUsername,
      fullName,
      department,
      role,
      phoneNumber: phoneNumber || '',
      isActive: true,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, USERS_PATH, newUid), newProfile);

    await logAuditEvent(
      'BUAT_AKUN_STAF',
      `Super Admin membuat akun staf baru: ${fullName} (${cleanUsername}) - Role: ${role}`,
      'User',
      newUid
    );

    return newUid;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error(`Username "${cleanUsername}" sudah terdaftar di sistem autentikasi.`);
    }
    throw error;
  } finally {
    try {
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
    } catch (e) {
      // Ignore secondary app teardown cleanup error
    }
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const path = `${USERS_PATH}/${uid}`;
  try {
    await updateDoc(doc(db, USERS_PATH, uid), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await logAuditEvent('UPDATE_PROFIL_PENGGUNA', `Profil akun ${uid} diperbarui`, 'User', uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
  const path = `${USERS_PATH}/${uid}`;
  try {
    await updateDoc(doc(db, USERS_PATH, uid), {
      isActive,
      updatedAt: new Date().toISOString(),
    });
    await logAuditEvent(
      isActive ? 'AKTIFKAN_AKUN' : 'NONAKTIFKAN_AKUN',
      `Status akun ${uid} diubah menjadi ${isActive ? 'Aktif' : 'Nonaktif'}`,
      'User',
      uid
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function changeUserPassword(newPassword: string): Promise<void> {
  if (!auth.currentUser) throw new Error('Sesi pengguna tidak valid');
  if (newPassword.length < 12) throw new Error('Password baru minimal 12 karakter');

  try {
    await fbUpdatePassword(auth.currentUser, newPassword);
    // Mark mustChangePassword as false
    await updateDoc(doc(db, USERS_PATH, auth.currentUser.uid), {
      mustChangePassword: false,
      updatedAt: new Date().toISOString(),
    });
    await logAuditEvent('GANTI_PASSWORD', `Pengguna memperbarui kata sandi mandiri`, 'User', auth.currentUser.uid);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Untuk alasan keamanan, silakan keluar dan masuk kembali sebelum mengganti password.');
    }
    throw error;
  }
}

export function subscribeAllUsers(
  onUpdate: (users: UserProfile[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, USERS_PATH), orderBy('fullName', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const users: UserProfile[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as UserProfile),
        }));
        onUpdate(users);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, USERS_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_PATH);
  }
}

export async function logoutUser(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await logAuditEvent('LOGOUT_USER', `Pengguna keluar dari sistem`, 'User', user.uid);
  }
  await signOut(auth);
}

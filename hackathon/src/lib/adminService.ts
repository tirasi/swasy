export const adminService = {
  isAdmin: (userId: string) => {
    return localStorage.getItem('isAdmin') === 'true';
  },
  
  setAdmin: (userId: string, isAdmin: boolean) => {
    localStorage.setItem('isAdmin', isAdmin.toString());
  }
};
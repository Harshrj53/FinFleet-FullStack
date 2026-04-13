import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const PLANS = {
  FREE: 'FREE',
  PRO: 'PRO',
  ELITE: 'ELITE',
  PRIME: 'ELITE PRIME'
};

const INITIAL_MOCK_USERS = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', plan: PLANS.ELITE, chatCount: 3 },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', plan: PLANS.FREE, chatCount: 0 },
  { id: 3, name: 'Charlie Day', email: 'charlie@example.com', plan: PLANS.PRIME, chatCount: 42 }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(PLANS.FREE);
  const [chatCount, setChatCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Global Mock DB instances
  const [usersList, setUsersList] = useState(INITIAL_MOCK_USERS);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Load mock data on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedPlan = localStorage.getItem('plan');
    const savedCount = localStorage.getItem('chatCount');
    const savedAdmin = localStorage.getItem('isAdmin');
    const savedUsers = localStorage.getItem('usersList');
    const savedCoupons = localStorage.getItem('coupons');
    const savedAppliedCoupon = localStorage.getItem('appliedCoupon');
    const savedNotifications = localStorage.getItem('notifications');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedPlan) setPlan(savedPlan);
    if (savedCount) setChatCount(parseInt(savedCount));
    if (savedAdmin) setIsAdmin(savedAdmin === 'true');
    
    if (savedUsers) {
      setUsersList(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('usersList', JSON.stringify(INITIAL_MOCK_USERS));
    }

    if (savedCoupons) setCoupons(JSON.parse(savedCoupons));
    if (savedAppliedCoupon) setAppliedCoupon(JSON.parse(savedAppliedCoupon));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
  }, []);

  const login = (userData, userPlan = PLANS.FREE) => {
    setUser(userData);
    setPlan(userPlan);
    
    const isUserAdmin = userData.email === 'admin@finfleet.com';
    setIsAdmin(isUserAdmin);

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('plan', userPlan);
    localStorage.setItem('isAdmin', isUserAdmin.toString());

    // Add user to mock database if not exists and not admin
    if (!isUserAdmin) {
      const existingUser = usersList.find(u => u.email === userData.email);
      if (!existingUser) {
        const newUser = {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          plan: userPlan,
          chatCount: 0
        };
        const updatedList = [...usersList, newUser];
        setUsersList(updatedList);
        localStorage.setItem('usersList', JSON.stringify(updatedList));
        
        // Welcome notification
        const welcomeNotif = {
           id: Date.now() + 1,
           userEmail: userData.email,
           message: `Welcome to FinFleet Academy, ${userData.name}!`,
           date: new Date().toISOString(),
           read: false
        };
        const updatedNotifs = [...notifications, welcomeNotif];
        setNotifications(updatedNotifs);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifs));

      } else {
        // Inherit state from DB if they already exist
        setPlan(existingUser.plan);
        setChatCount(existingUser.chatCount);
        localStorage.setItem('plan', existingUser.plan);
        localStorage.setItem('chatCount', existingUser.chatCount.toString());
      }
    }
  };

  const logout = () => {
    setUser(null);
    setPlan(PLANS.FREE);
    setIsAdmin(false);
    setAppliedCoupon(null);
    localStorage.removeItem('user');
    localStorage.removeItem('plan');
    localStorage.removeItem('chatCount');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('appliedCoupon');
  };

  const updateChatCount = () => {
    const newCount = chatCount + 1;
    setChatCount(newCount);
    localStorage.setItem('chatCount', newCount.toString());
    
    // Sync with mock DB
    if (user && !isAdmin) {
      const updatedList = usersList.map(u => u.email === user.email ? { ...u, chatCount: newCount } : u);
      setUsersList(updatedList);
      localStorage.setItem('usersList', JSON.stringify(updatedList));
    }
  };

  const upgradePlan = (newPlan) => {
    setPlan(newPlan);
    localStorage.setItem('plan', newPlan);

    // Sync with mock DB
    if (user && !isAdmin) {
      const updatedList = usersList.map(u => u.email === user.email ? { ...u, plan: newPlan } : u);
      setUsersList(updatedList);
      localStorage.setItem('usersList', JSON.stringify(updatedList));
    }
  };

  // Admin Methods 
  const adminUpdateUserPlan = (userId, newPlan) => {
    const updatedList = usersList.map(u => u.id === userId ? { ...u, plan: newPlan } : u);
    setUsersList(updatedList);
    localStorage.setItem('usersList', JSON.stringify(updatedList));

    if (user && user.email === updatedList.find(u => u.id === userId)?.email) {
      setPlan(newPlan);
      localStorage.setItem('plan', newPlan);
    }
  };

  const adminCancelSubscription = (userId) => {
    adminUpdateUserPlan(userId, PLANS.FREE);
  };

  const adminCreateCoupon = (code, discountPercent) => {
    const newCoupon = { code: code.toUpperCase(), discountPercent: parseInt(discountPercent) };
    const updatedCoupons = [...coupons, newCoupon];
    setCoupons(updatedCoupons);
    localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
  };

  const adminDeleteCoupon = (code) => {
    const updatedCoupons = coupons.filter(c => c.code !== code);
    setCoupons(updatedCoupons);
    localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
    
    if (appliedCoupon?.code === code) {
      setAppliedCoupon(null);
      localStorage.removeItem('appliedCoupon');
    }
  };

  const adminSendNotification = (userEmail, message) => {
    const newNotif = {
      id: Date.now(),
      userEmail,
      message,
      date: new Date().toISOString(),
      read: false
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifs));
  };

  // User Methods
  const validateAndApplyCoupon = (code) => {
    const validCoupon = coupons.find(c => c.code === code.toUpperCase());
    if (validCoupon) {
      setAppliedCoupon(validCoupon);
      localStorage.setItem('appliedCoupon', JSON.stringify(validCoupon));
      return { success: true, message: `Coupon applied! ${validCoupon.discountPercent}% off.` };
    }
    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('appliedCoupon');
  };

  const markNotificationRead = (notifId) => {
    const updatedNotifs = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
    setNotifications(updatedNotifs);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifs));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      plan, 
      chatCount,
      isAdmin,
      usersList,
      coupons,
      appliedCoupon,
      notifications,
      login, 
      logout, 
      updateChatCount,
      upgradePlan,
      adminUpdateUserPlan,
      adminCancelSubscription,
      adminCreateCoupon,
      adminDeleteCoupon,
      adminSendNotification,
      validateAndApplyCoupon,
      removeCoupon,
      markNotificationRead,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

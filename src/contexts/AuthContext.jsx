import axios from 'axios';
import { SHA1 } from 'crypto-js';
import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

const encryptePWD = (pwd) => {
  var encryptedPWD = SHA1(pwd).toString();
  var shuffledString = '';
  for (let i = 0; i < encryptedPWD.length; i += 8) {
    var subString = encryptedPWD.slice(i, i + 8);
    shuffledString += subString.charAt(6) + subString.charAt(7);
    shuffledString += subString.charAt(4) + subString.charAt(5);
    shuffledString += subString.charAt(2) + subString.charAt(3);
    shuffledString += subString.charAt(0) + subString.charAt(1);
  }
  return shuffledString.toUpperCase();
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [getAC, setGetAC] = useState({});
  const navigate = useNavigate(); 

  const initAuth = async () => {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_PUBLIC_AuthURL}/MA.asmx/getAC?_accountName=byc-deploy`);
      setGetAC(response);
      localStorage.setItem('apiUrl', response.data.record.api);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    initAuth();
    fetchData();
  }, []);

const handleLogin = async (params, errorCallback) => {
  try {
    const getUS2 = await axios.get(`${getAC.data.record.api}/SY.asmx/getUS2?_email=${params.email}`, {
      headers: {
        accountId: JSON.parse(getAC.data.record.accountId),
        dbe: JSON.parse(getAC.data.record.dbe),
        dbs: JSON.parse(getAC.data.record.dbs),
      },
    });
    if (getUS2.data.record === null) {
      throw new Error(`User ${params.email} not found`);
    }
    const signIn3Params = `_email=${params.email}&_password=${encryptePWD(params.password)}&_accountId=${
      getAC.data.record.accountId
    }&_userId=${getUS2.data.record.recordId}`;
    const signIn3 = await axios.get(`${import.meta.env.VITE_PUBLIC_AuthURL}/MA.asmx/signIn3?${signIn3Params}`, {
      headers: {
        accountId: JSON.parse(getAC.data.record.accountId),
        dbe: JSON.parse(getAC.data.record.dbe),
        dbs: JSON.parse(getAC.data.record.dbs),
      },
    });
    const defaultSettings = await axios.get(`${getAC.data.record.api}/SY.asmx/getDE?_key=dateFormat`, {
      headers: {
        Authorization: 'Bearer ' + signIn3.data.record.accessToken,
        'Content-Type': 'multipart/form-data',
      },
    });
    const defaultSet = {
      dateFormat: defaultSettings.data.record?.value ? defaultSettings.data.record?.value : 'dd/MM/yyyy',
    };
    localStorage.setItem('default', JSON.stringify(defaultSet));
    const loggedUser = {
      accountId: getAC.data.record.accountId,
      userId: getUS2.data.record.recordId,
      username: getUS2.data.record.username,
      languageId: getUS2.data.record.languageId,
      userType: getUS2.data.record.userType,
      employeeId: getUS2.data.record.employeeId,
      fullName: getUS2.data.record.fullName,
      dashboardId: getUS2.data.record.dashboardId,
      role: 'admin',
      // expiresAt: jwt(signIn3.data.record.accessToken).exp,
      ...signIn3.data.record,
    };
    localStorage.setItem('languageId', loggedUser.languageId);
    EnableLogin(loggedUser);
    
  } catch (error) {
    console.log(error)
    if (errorCallback) errorCallback(error);
  }
};

const EnableLogin = (loggedUser) => {
  setUser(loggedUser);
  sessionStorage.setItem('userData', JSON.stringify(loggedUser));
  navigate('/');
};

const handleLogout = async () => {
  setUser(null);
  localStorage.removeItem('userData');
  sessionStorage.removeItem('userData');
  navigate('/login');
  initAuth();
  fetchData();
};

const getAccessToken = async () => {
  return new Promise((resolve) => {
    if (user && user.expiresAt !== null) {
      const dateNow = new Date();
      if (user.expiresAt < Math.trunc(dateNow.getTime() / 1000)) {
        const bodyFormData = new FormData();
        bodyFormData.append(
          'record',
          JSON.stringify({
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
          })
        );
        axios
          .post(`${process.env.REACT_APP_AUTH_URL}/MA.asmx/newAT`, bodyFormData, {
            headers: {
              authorization: 'Bearer ' + user.accessToken,
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((res) => {
            const newUser = {
              ...user,
              accessToken: res.data.record.accessToken,
              refreshToken: res.data.record.refreshToken,
              expiresAt: jwt(res.data.record.accessToken).exp,
            };
            const storage = localStorage.getItem('userData') ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(newUser));
            resolve(res.data.record.accessToken);
          })
          .catch(() => resolve('error getting new Access Token'));
      } else {
        resolve(user.accessToken);
      }
    } else {
      resolve(null);
    }
  });
};

  const values = {
    encryptePWD,
    getAccessToken,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };

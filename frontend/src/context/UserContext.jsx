import { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  startNotificationScheduler,
  stopNotificationScheduler,
  seedTodayIfNeeded,
  seedGenericImmediate,
} from "../services/notifications";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem("lpa-username") || "");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs so scheduler closures always read the latest values
  const profileRef  = useRef(profileData);
  const usernameRef = useRef(username);

  // Keep refs in sync
  useEffect(() => {
    profileRef.current  = profileData;
    usernameRef.current = username;

    // Seed today's inbox for THIS user when their profile loads
    if (username && profileData?.profile) {
      seedTodayIfNeeded(username, profileData.profile);
    }
  }, [profileData, username]);

  // Restart the scheduler whenever the username changes
  useEffect(() => {
    if (!username) {
      stopNotificationScheduler();
      return;
    }
    // Immediately populate inbox with generic tips — no API wait needed
    seedGenericImmediate(username);
    // Pass both refs so scheduled callbacks write to the correct user's inbox
    startNotificationScheduler(profileRef, usernameRef);
    return () => stopNotificationScheduler();
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const setUser = (name) => {
    setUsername(name);
    setProfileData(null); // clear stale data so dashboard re-fetches
    localStorage.setItem("lpa-username", name);
  };

  const clearUser = () => {
    setUsername("");
    setProfileData(null);
    stopNotificationScheduler();
    localStorage.removeItem("lpa-username");
  };

  return (
    <UserContext.Provider value={{
      username, setUser, clearUser,
      profileData, setProfileData,
      loading, setLoading,
      error, setError,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

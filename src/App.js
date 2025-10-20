import React, { useEffect, useState } from "react";
import Login from "./Login";
import "./App.css";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Feed from "./Feed";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, selectUser } from "./features/userSlice";
import { auth } from "./firebase";
import Widgets from "./Widgets";

function App() {
  const [recentSearch, setRecentSearch] = useState([]);
  const [recentSearchTerms, setrecentSearchTerms] = useState(() => {
    // ✅ Load from localStorage on mount
    const saved = localStorage.getItem("recentSearchTerms");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchInput, setSearchInput] = useState(""); //✅ new shared state

  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        // ✅ user logged in
        dispatch(
          login({
            email: userAuth.email,
            uid: userAuth.uid,
            displayName: userAuth.displayName,
            photoUrl: userAuth.photoURL,
          })
        );
      } else {
        // ✅ user logged out
        dispatch(logout());
        setRecentSearch([]); // 🧹 clear searches when logged out
      }
    });

    return unsubscribe;
  }, [dispatch]);

  // ✅ Handle when a recent search is clicked in the Sidebar
  const handleSelectSearch = (term) => {
    // Optional: toggle filter if same term clicked again
    setRecentSearch((prev) => (prev[0] === term ? [] : [term]));
    setSearchInput(`#${term}`);
  };

  useEffect(() => {
    localStorage.setItem(
      "recentSearchTerms",
      JSON.stringify(recentSearchTerms)
    );
  }, [recentSearchTerms]);

  return (
    <div className="app">
      <Header
        setRecentSearch={setRecentSearch}
        setrecentSearchTerms={setrecentSearchTerms}
        selectedSearchTerm={searchInput}
      />

      {!user ? (
        <Login />
      ) : (
        <div className="app_body">
          <Sidebar
            recentSearch={recentSearch}
            recentSearchTerms={recentSearchTerms}
            onSelectSearch={handleSelectSearch}
          />
          <Feed recentSearch={recentSearch} />
          <Widgets />
        </div>
      )}
    </div>
  );
}

export default App;

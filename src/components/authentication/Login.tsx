import React, { useState, useEffect, useContext } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { io } from "socket.io-client";
import { Link, useNavigate } from "react-router-dom";
import urls from "../../utils/authURL";
import { userContext } from "../../utils/context";
import SmallLoader from "../../UI/SmallLoader";
import { ERROR_DATA, UserContextType } from "../../utils/customTypes";
import Loader from "../../UI/Loader";

const serverUrl: string =
  "http://localhost:5000" || "https://minicloud.onrender.com";

const socket = io(serverUrl);

function Login() {
  const { user, setUser, isLogIn } = useContext<UserContextType>(userContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isLogIn && user?._id) {
      navigate("/user/dashboard");
    }
  }, [user?._id, navigate]);

  const [error, setError] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });

  const [userLoginData, setUserLoginData] = useState({
    email: "",
    password: "",
  });
  function getUserLoginData(event: React.ChangeEvent<HTMLInputElement>) {
    const { name } = event.target;
    const { value } = event.target;
    setUserLoginData((prevData) => {
      return { ...prevData, [name]: value.trimEnd() };
    });
  }

  const handleLogin = async () => {
    setIsLoading(true);
    setError({ isError: false, errorMsg: "" });
    try {
      const response = await axios.post(
        `${urls.authURL}/login`,
        userLoginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response);

      socket.emit("add-user", response?.data?.user?.email);
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        if (
          error?.response?.data.status === 500 ||
          error?.response?.status === 500
        ) {
          return setError({
            isError: true,
            errorMsg: "something occured. try again",
          });
        }
        setError({ isError: true, errorMsg: error?.response?.data?.message });
      } else {
        setError({ isError: true, errorMsg: "something occured. try again" });
      }
    }
  };

  const { data, mutate: login } = useMutation(handleLogin);

  useEffect(() => {
    setUser(data && data.data.user);
  }, [setUser, data]);

  if (isLogIn) {
    return <Loader />;
  }

  return (
    <section className="login-section">
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault(), login();
        }}
      >
        <h3>Sign In</h3>
        <div className="input-container">
          <label>Email</label>
          <input
            type="email"
            placeholder="Your Email"
            name="email"
            value={userLoginData.email}
            onChange={getUserLoginData}
          />
        </div>
        <div className="input-container">
          <label>Password</label>
          <input
            type="password"
            placeholder="Your Password"
            name="password"
            value={userLoginData.password}
            onChange={getUserLoginData}
          />
        </div>
        {error.isError && <p className="login-error">{error.errorMsg}</p>}
        <div className="button">
          <button>{isLoading ? <SmallLoader /> : "Login"}</button>
        </div>
        <div className="options-container">
          <Link to="/auth/forgot-password">forgot password?</Link>
          <p className="signup-option">
            Don't have an account? <Link to="/auth/register">signup</Link>
          </p>
        </div>
      </form>
    </section>
  );
}

export default Login;

import React from 'react';
import AuthForm from '../components/AuthForm';
import { Link } from "react-router-dom";
import './forgot-password.css';

const Login = () => {
  return (
    <div className="login-container">
      <AuthForm isSignup={false} />
      <p className="forgot-password text-center" >
        Forgot your password? <Link to="/forgot-password" >Click here</Link>
      </p>
    </div>
  );
};

export default Login;

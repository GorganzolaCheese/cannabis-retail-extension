import React from 'react';
import { useState, useEffect } from 'react';
import secrets from '../../../secrets';
import { createClient } from '@supabase/supabase-js';
import './Popup.css';
import Home from './components/Home';
import SignIn from './components/SignIn';
import logo from '../../assets/img/itwo_logo.png';

const Popup = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const supabase = createClient(
    secrets.SUPABASE_URL,
    secrets.SUPABASE_KEY
  );

  useEffect(() => {
    supabase.auth.getSession().then(
      ({ data }) => {
        if (data.session) {
          setIsSignedIn(true);
          console.log(data)
        } else {
          console.log('Not signed in');
          console.log(data)
          setIsSignedIn(false);
        }
      }
    );
  }, [])

  return (
    <div className="App">
      <section className="App-body">
        {isSignedIn ? <Home supabase={supabase} setIsSignedIn={setIsSignedIn} /> : <SignIn supabase={supabase} setIsSignedIn={setIsSignedIn} />}
      </section>
    </div>
  );
};

export default Popup;

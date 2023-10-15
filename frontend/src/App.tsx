import './App.css'
import { setupOauthClientApi } from './api/events';
import { apiUrl } from './env';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import MyCalendar from './components/MyCalendar';

const AuthHandle = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const navigate = useNavigate();
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) { return; }

    isMounted.current = true;
    if (code) {
      setupOauthClientApi(code).then(() => {
        // Note: It is necessary to navigate to home page only when server has
        // finished setting up OAuth client.
        navigate('/')
      });
    }
  }, [code, navigate])
  return <div>{code}</div>
}

function App() {
  return (
    <>
      <h1 style={{ textAlign: 'center' }}>Google Calendar Extended</h1>

      {/* Navigation Menu */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0px 25px' }}>
        <a href="/">HOME </a>
        <span style={{ padding: '0px 10px' }}>|</span>
        <a href={`${apiUrl}/auth`}>AUTHENTICATE</a>
      </div>

      <Routes>
        <Route path="/" element={<MyCalendar />} />
        <Route path="/auth/callback" element={<AuthHandle />} />
      </Routes>

    </>
  )
}

export default App

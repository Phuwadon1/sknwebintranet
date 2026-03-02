import { Suspense } from 'react';
import { ConfigProvider, Spin } from "antd";
import thTH from "antd/locale/th_TH";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

import Main from './Pages/Main';

function App() {


  return (
    <Suspense fallback={<Spin className="px-[50%] py-[20%]" />}>
      <ConfigProvider
        locale={thTH}
        theme={{
          token: {
            fontFamily: `'Noto Sans Thai', sans-serif, Kanit`,
          },
        }}
      >
        <ToastContainer />
        <Main />

      </ConfigProvider>
    </Suspense>
  )
}

export default App

import React, { useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import { authProtectedRoutes, publicRoutes } from "./Routes/allRoutes";
import { Route, Routes } from "react-router-dom";
import VerticalLayout from "./Layouts/VerticalLayout";
import HorizontalLayout from "./Layouts/HorizontalLayout/index";
import "./assets/scss/theme.scss";
import "react-toastify/dist/ReactToastify.css";
import NonAuthLayout from "./Layouts/NonLayout";

//constants
import { LAYOUT_MODE_TYPES, LAYOUT_TYPES } from "./Components/constants/layout";

import { useSelector } from "react-redux";
import AuthProtected from "./Routes/AuthProtected";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "styled-components";
import { darkTheme, lightTheme } from "utils/theme";
import { LayoutSelector } from "selectors";

const getLayout = (layoutType: any) => {
  let Layout = VerticalLayout;
  switch (layoutType) {
    case LAYOUT_TYPES.VERTICAL:
      Layout = VerticalLayout;
      break;
    case LAYOUT_TYPES.HORIZONTAL:
      Layout = HorizontalLayout;
      break;
    default:
      break;
  }
  return Layout;
};

function App() {

  const { layoutTypes, layoutModeType } = useSelector(LayoutSelector);
  const Layout = getLayout(layoutTypes);

  useEffect(() => {
    // Create a new web worker
    const myWorker = new Worker(new URL('./workers/processImageData.ts', import.meta.url), { type: 'module' });
    // Save the worker instance to state
    myWorker.postMessage('start');
    // Set up event listener for messages from the worker
    myWorker.onmessage = function (event) {
      console.log('Received result from imageData worker:', event.data);
      window.imageData = event.data
    };

    // Clean up the worker when the component unmounts
    return () => {
      myWorker.terminate();
    };
  }, []);

  useEffect(() => {
    // Create a new web worker
    const myWorker = new Worker(new URL('./workers/processGeoJson.ts', import.meta.url), { type: 'module' });
    // Save the worker instance to state
    myWorker.postMessage('start');
    // Set up event listener for messages from the worker
    myWorker.onmessage = function (event) {
      console.log('Received result from geoJson worker:', event.data);
      window.mainGeoJson = event.data
    };

    // Clean up the worker when the component unmounts
    return () => {
      myWorker.terminate();
    };
  }, []);

  return (
    <React.Fragment>
      <React.Suspense fallback={<div className="d-flex justify-content-center align-items-center">FMS Live</div>}>
        <Routes>
          {publicRoutes.map((route, idx) => (
            <Route
              path={route.path}
              key={idx}
              element={<NonAuthLayout>{route.component}</NonAuthLayout>}
            ></Route>
          ))}
          {authProtectedRoutes.map((route, idx) => (
            <Route
              path={route.path}
              key={idx}
              element={
                <React.Fragment>
                  <AuthProtected>
                    <ThemeProvider
                      theme={
                        layoutModeType === LAYOUT_MODE_TYPES.LIGHT
                          ? lightTheme
                          : darkTheme
                      }
                    >
                      <Layout>{route.component}</Layout>
                    </ThemeProvider>
                  </AuthProtected>
                </React.Fragment>
              }
            />
          ))}
        </Routes>
        <ToastContainer />
      </React.Suspense>
    </React.Fragment>
  );
}

export default App;

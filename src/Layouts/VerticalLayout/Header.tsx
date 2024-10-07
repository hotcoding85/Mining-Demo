import React, { useState } from "react";

import { Link } from "react-router-dom";

// Reactstrap

// Import menuDropdown
import LanguageDropdown from "../../Components/Common/LanguageDropdown";
import NotificationDropDown from "../../Components/CommonForBoth/NotificationDropDown";
import ProfileMenu from "../../Components/CommonForBoth/TopBarDropDown/ProfileMenu";

import logo from "../../assets/images/logo.svg";
import logoLightSvg from "../../assets/images/logo-light.svg";

//i18n
import { withTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { changeLayoutMode, changeUnits } from "slices/thunk";
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { Switch, Tooltip } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { LayoutSelector } from "selectors";

const Header = () => {

  const [fullscreen, setFullScreen] = useState<string>("bx bx-fullscreen");

  const toggleFullscreen = () => {
    let document: any = window.document;
    document.body.classList.add("fullscreen-enable");
    if (
      !document.fullscreenElement &&
      /* alternative standard method */ !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      setFullScreen("bx bx-exit-fullscreen")
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      setFullScreen("bx bx-fullscreen")
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
    // handle fullscreen exit
    const exitHandler = () => {
      if (
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      )
        document.body.classList.remove("fullscreen-enable");
    };
    document.addEventListener("fullscreenchange", exitHandler);
    document.addEventListener("webkitfullscreenchange", exitHandler);
    document.addEventListener("mozfullscreenchange", exitHandler);
  };

  function tToggle() {
    var body = document.body;
    if (window.screen.width <= 998) {
      body.classList.toggle("sidebar-enable");
    } else {
      body.classList.toggle("vertical-collpsed");
      body.classList.toggle("sidebar-enable");
    }
  }

  const dispatch = useDispatch<any>();

  const { layoutModeType, units } = useSelector(LayoutSelector);

  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box d-lg-none d-md-block">
              <Link to="/" className="logo logo-dark">
                <span className="logo-sm">
                  <img src={logo} alt="" height="22" />
                </span>
              </Link>

              <Link to="/" className="logo logo-light">
                <span className="logo-sm">
                  <img src={logoLightSvg} alt="" height="22" />
                </span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => tToggle()}
              className="btn btn-sm px-3 font-size-16 header-item "
              id="vertical-menu-btn"
            >
              <i className="fa fa-fw fa-bars" />
            </button>

          </div>
          <div className="d-flex">

            <div className="dropdown d-none d-lg-inline-block align-self-center" style={{marginRight:'128px'}}>
              {/* <Tooltip title="Not available at the moment">
                <span style={{ marginRight: '4px', fontSize: '18px', color: 'rgb(247, 179, 26)', display: 'block' }}>Dispatch A.I</span>
              </Tooltip> */}
              <span style={{color: 'rgb(247, 179, 26)', marginRight: '4px', fontWeight:'500', fontSize:'16px'}}>Dispatch A.I</span>
              <Tooltip title="Not available at the moment">
                <Switch defaultValue={false} checkedChildren="ON" unCheckedChildren="OFF" disabled />
              </Tooltip>
            </div>

            <div className="dropdown d-none d-lg-inline-block align-self-center">
              <Tooltip title="Display Units">
                {/* <span style={{ marginRight: '4px', color: 'white' }}>Display Units</span> */}
                <Switch value={units == "t"} checkedChildren="Tonnes" unCheckedChildren="BCM" onChange={(checked: boolean) => {
                  if (checked) {
                    dispatch(changeUnits("t"))
                  } else {
                    dispatch(changeUnits("m3"))
                  }
                }} />
              </Tooltip>
            </div>

            <LanguageDropdown />

            <div className="dropdown d-none d-lg-inline-block align-self-center">
              <Tooltip title={layoutModeType == LAYOUT_MODE_TYPES.DARK ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                <Switch checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />} value={layoutModeType == LAYOUT_MODE_TYPES.DARK} onChange={(checked: boolean) => {
                  if (checked) {
                    dispatch(changeLayoutMode(LAYOUT_MODE_TYPES.DARK));
                  } else {
                    dispatch(changeLayoutMode(LAYOUT_MODE_TYPES.LIGHT));
                  }
                }} />
              </Tooltip>
            </div>

            <div className="dropdown d-none d-lg-inline-block mr-1">
              <button
                type="button"
                onClick={() => {
                  toggleFullscreen();
                }}
                className="btn header-item noti-icon "
                data-toggle="fullscreen"
              >
                <Tooltip title="Fullscreen">
                  <i className={fullscreen} />
                </Tooltip>
              </button>
            </div>

            <NotificationDropDown />

            <ProfileMenu />

          </div>
        </div>
      </header>
    </React.Fragment>
  );
};


export default withTranslation()(Header);

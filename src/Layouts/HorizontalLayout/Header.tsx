import React, { useState } from "react";

import { Link } from "react-router-dom";

// reactstrap
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, Input, FormGroup, Label } from "reactstrap";

// Import menuDropdown
import LanguageDropdown from "../../Components/Common/LanguageDropdown";
import NotificationDropDown from "../../Components/CommonForBoth/NotificationDropDown";
import ProfileMenu from "../../Components/CommonForBoth/TopBarDropDown/ProfileMenu";

import logo from "../../assets/images/logo.svg";
import logoLight from "../../assets/images/logo-light.png";
import logoLightSvg from "../../assets/images/logo-light.svg";
import logoDark from "../../assets/images/logo-dark.png";

//i18n
import { withTranslation } from "react-i18next";
import { changeLayoutMode } from "slices/thunk";
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { useDispatch, useSelector } from "react-redux";
import { LayoutSelector } from "selectors";

const Header = (props: any) => {

  function toggleFullscreen() {
    let document: any = window.document;
    if (
      !document.fullscreenElement &&
      /* alternative standard method */ !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          //   Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  const dispatch = useDispatch<any>();

  const { layoutModeType } = useSelector(LayoutSelector);

  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box">
              <Link to="/" className="logo logo-dark">
                <span className="logo-sm">
                  <img src={logo} alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src={logoDark} alt="" height="32" />
                </span>
              </Link>

              <Link to="/" className="logo logo-light">
                <span className="logo-sm">
                  <img src={logoLightSvg} alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src={logoLight} alt="" height="22" />
                </span>
              </Link>
            </div>

            <button
              type="button"
              className="btn btn-sm px-3 font-size-16 d-lg-none header-item"
              data-toggle="collapse"
              onClick={props.toggleLeftmenu}
              data-target="#topnav-menu-content"
            >
              <i className="fa fa-fw fa-bars" />
            </button>

          </div>

          <div className="d-flex">

            <LanguageDropdown />

            <div className="dropdown d-none d-lg-inline-block ms-1 align-self-center">
              <FormGroup switch>
                <Input type="switch" className="border border-primary" checked={layoutModeType === LAYOUT_MODE_TYPES.DARK} role="switch" onClick={(e: any) => {
                  if (e.target.checked) {
                    dispatch(changeLayoutMode(LAYOUT_MODE_TYPES.DARK));
                  } else {
                    dispatch(changeLayoutMode(LAYOUT_MODE_TYPES.LIGHT));
                  }
                }} />
              </FormGroup>
            </div>

            <div className="dropdown d-none d-lg-inline-block ms-1">
              <button
                type="button"
                className="btn header-item noti-icon "
                onClick={() => {
                  toggleFullscreen();
                }}
                data-toggle="fullscreen"
              >
                <i className="bx bx-fullscreen" />
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

export default (withTranslation()(Header));


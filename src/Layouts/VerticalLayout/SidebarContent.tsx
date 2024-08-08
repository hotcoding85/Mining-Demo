import React, { useEffect, useRef, useCallback } from "react";
//Import Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";

import { Link } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";
import withRouter from "../../Components/Common/withRouter";

const SidebarContent = (props: any) => {
  const ref = useRef<any>();
  const activateParentDropdown = useCallback((item: any) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = process.env.PUBLIC_URL + props.router.location.pathname;
    let matchingMenuItem = null;
    const ul: any = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [props.router.location.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item: any) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  return (
    <React.Fragment>
      <SimpleBar className="h-100" ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-home-circle"></i>
                <span>{props.t("Dashboards")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/fleet-status">{props.t("Fleet Status")}</Link>
                </li>
                <li>
                  <Link to="/map">{props.t("Map")}</Link>
                </li>
                <li>
                  <Link to="/">{props.t("Trucking Summary")}</Link>
                </li>
                <li>
                  <Link to="/">{props.t("Digging Summary")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-pulse"></i>
                <span>{props.t("Production")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/daily-production">{props.t("Daily Production")}</Link>
                </li>
                <li>
                  <Link to="/digging-performance">{props.t("Digging Performance")}</Link>
                </li>
                <li>
                  <Link to="/telemetry">{props.t("Trucking Trip Summary")}</Link>
                </li>
                <li>
                  <Link to="/ore-tracker">{props.t("ROM & Waste Summary")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-analyse"></i>
                <span>{props.t("Operations")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/dispatch">{props.t("Dispatch")}</Link>
                </li>
                <li>
                  <Link to="/shiftrosters">{props.t("Shift Roster")}</Link>
                </li>
                <li>
                  <Link to="/fleet-timeline">{props.t("Time Utilization Model")}</Link>
                </li>
                <li>
                  <Link to="/route-replay">{props.t("Route Replay")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-radar"></i>
                <span>{props.t("Ore Tracker")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/benches">{props.t("Benches")}</Link>
                </li>
                <li>
                  <Link to="/materials">{props.t("Materials")}</Link>
                </li>
                <li>
                  <Link to="/geofences">{props.t("Geofences")}</Link>
                </li>
                <li>
                  <Link to="/material-inventory">{props.t("Material Inventory")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/" >
                <i className="bx bx-checkbox-square"></i>
                <span>{props.t("Dynamic Dispatch")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/">{props.t("Fleet Optimization")}</Link>
                  {/*
                    plan with trucks, diggers and operators
                  */}
                </li>
                <li>
                  <Link to="/">{props.t("Auto Routing")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/" >
                <i className="bx bx-checkbox-square"></i>
                <span>{props.t("Telemetry ")}</span>
              </Link>
            </li>
            <li>
              <Link to="/maintenance" >
                <i className="bx bx-cog"></i>
                <span>{props.t("Fleet Maintenance")}</span>
              </Link>
            </li>

            <li>
              <Link to="http://thingsboard.cloud" target="_blank" rel="noopener noreferrer">
                <i className="bx bx-chip"></i>
                <span>{props.t("Asset Insights")}</span>
              </Link>
            </li>

            <li>
              <Link to="/reports">
                <i className="bx bx-bar-chart-square"></i>
                <span>{props.t("Reports")}</span>
              </Link>
            </li>

          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};
export default withRouter(withTranslation()(SidebarContent));

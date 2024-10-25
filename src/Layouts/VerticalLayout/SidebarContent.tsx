import React, { useEffect, useRef, useCallback, useMemo } from "react";
//Import Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";

import { Link } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";
import withRouter from "../../Components/Common/withRouter";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useDispatch } from "react-redux";
import { getMenuSettings } from "slices/menuSettings/thunk";

const SidebarContent = (props: any) => {
  const ref = useRef<any>();
  const dispatch: any = useDispatch();

  const { data: menuSettings } = useSelector(
    createSelector(
      (state: any) => state.MenuSettings,
      (layout) => ({
        data: layout.data,
      })
    )
  );

  useEffect(() => {
    if (dispatch) {
      dispatch(getMenuSettings());
    }
  }, []);

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
      if (items[i].pathname === "/") continue;
      const pathNameMatch = pathName.match(/\/([^\\/]+)/);
      const itemPathNameMatch = items[i].pathname.match(/\/([^\\/]+)/);

      if (
        pathNameMatch?.[1] &&
        itemPathNameMatch?.[1] &&
        pathNameMatch[1] === itemPathNameMatch[1]
      ) {
        activateParentDropdown(items[i]);
        break;
      }
      if (matchingMenuItem) {
        activateParentDropdown(matchingMenuItem);
      }
    }
  }, [props.router.location.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, [menuSettings]);

  useEffect(() => {
    new MetisMenu("#side-menu");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const sortedMenu = useMemo(() => {
    const data = structuredClone(menuSettings);
    data?.sort((a, b) => a.order - b.order);
    return data || [];
  }, [menuSettings]);

  return (
    <React.Fragment>
      <SimpleBar className="h-100" ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            {sortedMenu.map((menu) => (
              <li key={menu.title}>
                <Link
                  to={menu?.router || "/#"}
                  target={menu?.router?.includes("http") ? "_blank" : "_self"}
                  className={!!menu.children?.length ? "has-arrow" : ""}
                >
                  {menu.icon && <i className={menu.icon}></i>}
                  <span>{menu.title}</span>
                </Link>

                {!!menu?.children?.length && (
                  <ul className="sub-menu">
                    {menu.children?.map((subMenu) => (
                      <li key={subMenu.title}>
                        <Link to={subMenu?.router || "/#"}>
                          {subMenu.icon && <i className={subMenu.icon}></i>}
                          {subMenu.title}
                        </Link>
                      </li>
                    ))}
                    {/* {
                      menu.title == 'Mine Control' && 
                      <li>
                        <Link to="/roster-scheduler">
                          {props.t("Roster Scheduler")}
                        </Link>
                      </li>
                    }
                    {
                      menu.title == 'Production' && 
                      <li>
                        <Link to="/trucking-trip-summary">
                          {props.t("Trucking Trip Summary")}
                        </Link>
                      </li>
                    } */}
                  </ul>
                )}
              </li>
            ))}
            {/* <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-home-circle"></i>
                <span>{props.t("Dashboards")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/fleet-status">{props.t("Fleet Status")}</Link>
                </li>
                <li>
                  <Link to="/realtime-postioning">
                    {props.t("Real-time Positioning")}
                  </Link>
                </li>
                <li>
                  <Link to="/trucking">
                    {props.t("Trucking Plan vs Actual")}
                  </Link>
                </li>
                <li>
                  <Link to="/digging">{props.t("Digging Plan vs Actual")}</Link>
                </li>
                <li>
                  <Link to="/equipment-gantt">
                    {props.t("Equipment Activity Gantt")}
                  </Link>
                </li>
                <li>
                  <Link to="/operator-report">
                    {props.t("Operator Report")}
                  </Link>
                </li>
                <li>
                  <Link to="/fuel-dashboard">{props.t("Fuel Dashboard")}</Link>
                </li>
                 <li>
                  <Link to="/telemetry-report">{props.t("Telemetry Report")}</Link>
                </li> 
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-pulse"></i>
                <span>{props.t("Mine Control")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/dispatch-live">{props.t("Dispatch Live")}</Link>
                </li>
                <li>
                  <Link to="/gantt-scheduler">
                    {props.t("Gantt Scheduler")}
                  </Link>
                </li>
                <li>
                  <Link to="/shift-planner">{props.t("Shift Planner")}</Link>
                </li>
                <li>
                  <Link to="/ore-spotter">{props.t("Ore Spotter")}</Link>
                </li>
                <li>
                  <Link to="/fuel-scheduler">{props.t("Fuel Dispatcher")}</Link>
                </li>
                <li>
                  <Link to="/targets">{props.t("Production Targets")}</Link>
                </li>
                <li>
                  <Link to="/rom-mill-targets">
                    {props.t("ROM/Mill Targets")}
                  </Link>
                </li>
                <li>
                  <Link to="/preshift-info">
                    {props.t("Pre Shift Information (PSI)")}
                  </Link>
                </li>
                <li>
                  <Link to="/waste-dump-management">
                    {props.t("Waste Dump Management")}
                  </Link>
                </li>
                <li>
                  <Link to="/rom-management">{props.t("ROM Management")}</Link>
                </li>
                <li>
                  <Link to="/message-centre">{props.t("Message Centre")}</Link>
                </li>
                <li>
                  <Link to="/blend-plans">{props.t("Blend Plans")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-shape-circle"></i>
                <span>{props.t("Production")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/daily-production">
                    {props.t("Daily Snapshot")}
                  </Link>
                </li>
                <li>
                  <Link to="/digging-performance">
                    {props.t("Digging Performance")}
                  </Link>
                </li>
                <li>
                  <Link to="/trucking-performance">
                    {props.t("Trucking Performance")}
                  </Link>
                </li>
                <li>
                  <Link to="/rom-waste-summary">
                    {props.t("ROM & Waste Summary")}
                  </Link>
                </li>
                <li>
                  <Link to="/descrepencies">
                    {props.t("Carryback Discrepency")}
                  </Link>
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
                  <Link to="/fleet-timeline">{props.t("Fleet Timeline")}</Link>
                </li>
                <li>
                  <Link to="/route-replay">
                    {props.t("GPS Fleet Tracking")}
                  </Link>
                </li>
                <li>
                  <Link to="/geofences">{props.t("Geofences")}</Link>
                </li>
                <li>
                  <Link to="/operations-fuel-scheduler">
                    {props.t("Fuel Dispatcher")}
                  </Link>
                </li>
                <li>
                  <Link to="/fuel-status">{props.t("Fuel Status")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bxs-component"></i>
                <span>{props.t("Ore Tracker")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/benches">{props.t("Benches")}</Link>
                </li>
                <li>
                  <Link to="/dig-blocks">{props.t("Dig Block Layout")}</Link>
                </li>
                <li>
                  <Link to="/materials">{props.t("Materials")}</Link>
                </li>
                <li>
                  <Link to="/material-inventory">
                    {props.t("Material Inventory")}
                  </Link>
                </li>
                <li>
                  <Link to="/material-movement">
                    {props.t("Material Movement")}
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/3d-pit-view">
                <i className="bx bxs-map"></i>
                <span>{props.t("3D Pit View")}</span>
              </Link>
            </li>
            <li>
              <Link to="/" className="has-arrow">
                <i className="bx bx-bolt-circle"></i>
                <span>{props.t("Mine Dynamics")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/auto-routing">
                    {props.t("Haul Route Management")}
                  </Link>
                </li>
                <li>
                  <Link to="/truck-load-optimisation">
                    {props.t("Truck Load Optimisation")}
                  </Link>
                </li>
                <li>
                  <Link to="/digging-optimisation">
                    {props.t("Digging Optimisation")}
                  </Link>
                </li>
                <li>
                  <Link to="/sic">{props.t("Short Interval Control")}</Link>
                </li>
                <li>
                  <Link to="/haul-road-optimisation">
                    {props.t("Haul Road Optimization")}
                  </Link>
                </li>
                <li>
                  <Link to="/haul-truck-intelligence">
                    {props.t("Haul Truck Intelligence")}
                  </Link>
                </li>
                <li>
                  <Link to="/payload-optimisation">
                    {props.t("Payload Optimisation")}
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/telemetry-report">
                <i className="bx bx-checkbox-square"></i>
                <span>{props.t("Telemetry Live")}</span>
              </Link>
            </li>
            <li>
              <Link to="/" className="has-arrow">
                <i className="bx bx-cog"></i>
                <span>{props.t("Fleet Maintenance")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/maintenance-status">
                    {props.t("Maintenance Status")}
                  </Link>
                </li>
                <li>
                  <Link to="/maintenance-scheduler">
                    {props.t("Maintenance Scheduler")}
                  </Link>
                </li>
                <li>
                  <Link to="/maintenance-fuel-scheduler">
                    {props.t("Fuel Dispatcher")}
                  </Link>
                </li>
                <li>
                  <Link to="/maintenance-fuel-status">
                    {props.t("Fuel Status")}
                  </Link>
                </li>
                <li>
                  <Link to="/oil-analysis">{props.t("Oil Analysis")}</Link>
                </li>
                <li>
                  <Link to="/pre-starts">{props.t("Pre Starts")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link
                to="http://thingsboard.cloud"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bx-chip"></i>
                <span>{props.t("Asset Insights")}</span>
              </Link>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bxs-user-badge"></i>
                <span>{props.t("Managers Centre")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/kpi">{props.t("Manager KPI's")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/reports" className="has-arrow">
                <i className="bx bxs-bar-chart-square"></i>
                <span>{props.t("Reports")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/reports/shift-report">
                    {props.t("Shift Report")}
                  </Link>
                </li>
                <li>
                  <Link to="/reports/timeline-report">
                    {props.t("Timeline Report")}
                  </Link>
                </li>
              </ul>
            </li> */}
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};
export default withRouter(withTranslation()(SidebarContent));

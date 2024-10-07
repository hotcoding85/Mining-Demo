import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Row } from "antd";
import { Container } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useDispatch } from "react-redux";
import { Tree } from "antd";
import type { TreeDataNode, TreeProps } from "antd";
import {
  DownOutlined,
  MinusCircleOutlined,
  MinusSquareOutlined,
  PlusCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import FormModal from "Components/Common/FormModal";
import { UserRoleOptions } from "common/options";
import * as Yup from "yup";
import "./index.scss";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import {
  addMenuSettings,
  getMenuSettings,
  removeMenuSetting,
} from "slices/menuSettings/thunk";
import { CiUndo } from "react-icons/ci";
import { FaUndoAlt } from "react-icons/fa";
import { MdUndo } from "react-icons/md";

export type MenuItemType = {
  id?: string;
  title: string;
  router: string;
  order?: string;
  icon?: string;
  access: string[];
  children?: MenuItemType[];
};

const ADD_NEW_MENU = "add-new-menu";
const DEFAULT_FORM_VALUES = {
  title: "",
  router: "",
  access: [],
};

const MenuSettings = (props: any) => {
  document.title = "Menu Settings | FMS Live";

  const dispatch: any = useDispatch();

  const [menuData, setMenuData] = useState<MenuItemType[]>([]);
  const [deletedIds, setDeleteIds] = useState<string[]>([]);

  const [selectedMenu, setSelectedMenu] = useState<TreeDataNode | null>(null);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [initializeChanges, setInitializeChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

  useEffect(() => {
    const data = structuredClone(menuSettings);
    data.sort((a, b) => a.order - b.order);
    setMenuData(data);
  }, [menuSettings]);

  const isEdit = useMemo(
    () => selectedMenu?.key !== ADD_NEW_MENU,
    [selectedMenu?.key]
  );

  const removeMenuByKey = async (key: string) => {
    // Deep clone the menuData to avoid modifying immutable objects directly
    const data = structuredClone(menuData);

    setInitializeChanges(true);

    const loop = (
      data: MenuItemType[],
      key: string,
      callback: (index: number, arr: MenuItemType[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].title === key) {
          callback(i, data); // Call callback to handle removal
          return;
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback); // Recursively search in children
        }
      }
    };

    // Perform the removal
    loop(data, key, async (index, arr) => {
      const removedItem = arr.splice(index, 1)[0]; // Remove the item

      // If the item has an id, remove it from the database
      if (removedItem?.id) {
        setDeleteIds((prev) => [...prev, removedItem.id || ""]);
      }
    });

    // Update the menuData state after removal
    setMenuData(data);
  };

  // Helper function to find the parent of a submenu
  const findParentMenu = (
    data: MenuItemType[],
    submenuKey: string
  ): MenuItemType | null => {
    for (let item of data) {
      if (item.children) {
        if (item.children.some((child) => child.title === submenuKey)) {
          return item; // Found the parent menu
        }
        const foundInChildren = findParentMenu(item.children, submenuKey);
        if (foundInChildren) {
          return foundInChildren; // Recursively search in children
        }
      }
    }
    return null;
  };

  const gData: any = useMemo(
    () =>
      menuData.map((item) => {
        const mapChildrens = (children: MenuItemType[] | undefined) => {
          if (!children) return [];
          return children.map((child) => ({
            key: child.title,
            title: child.title,
            children: mapChildrens(child.children),
            icon: ({ selected }) =>
              selected || !child.icon ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMenuByKey(child.title);
                  }}
                  onDoubleClick={(e) => e.stopPropagation()}
                  title="Delete this menu"
                >
                  <MinusCircleOutlined />
                </button>
              ) : (
                <i className={child.icon}></i>
              ),
          }));
        };

        return {
          key: item.title,
          title: item.title,
          icon: ({ selected }) =>
            selected || !item.icon ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeMenuByKey(item.title);
                }}
                onDoubleClick={(e) => e.stopPropagation()}
                title="Delete this menu"
              >
                <MinusCircleOutlined />
              </button>
            ) : (
              <i className={item.icon}></i>
            ),
          children: mapChildrens(item.children),
        };
      }),
    [menuData]
  );

  const handleCloseModal = useCallback(() => {
    setIsOpenModal(false);
    setSelectedMenu(null);
  }, []);

  const onDrop: TreeProps["onDrop"] = async (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split("-");
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    setInitializeChanges(true);
    // Deep clone the menuData to avoid modifying immutable objects
    const data = structuredClone(menuData); // If structuredClone is not available, use JSON.parse(JSON.stringify(menuData));

    const loop = async (
      data: MenuItemType[],
      key: React.Key,
      callback: (node: MenuItemType, i: number, data: MenuItemType[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].title === key) {
          return await callback(data[i], i, data);
        }
        if (data[i].children) {
          await loop(data[i].children!, key, callback); // Recursively search in children
        }
      }
    };

    // Find the dragged object
    let dragObj: MenuItemType = {
      title: "",
      router: "",
      access: [],
    };

    await loop(data, dragKey, async (item, index, arr) => {
      arr.splice(index, 1); // Remove the dragged item

      if (item?.id) {
        setDeleteIds((prev) => [...prev, item.id || ""]);
      }

      dragObj = {
        title: item.title,
        access: item.access,
        router: item.router,
        children: item.children,
      }; // Create a shallow copy of the dragged object
    });

    if (!info.dropToGap) {
      // Drop inside the node (as a child)
      await loop(data, dropKey, (item) => {
        item.children = item.children ? [...item.children] : []; // Ensure children is an array
        item.children.push(dragObj); // Add dragged object as a child
      });
    } else {
      let ar: MenuItemType[] = [];
      let i: number = 0;
      await loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj); // Drop at the top of the node
      } else {
        ar.splice(i + 1, 0, dragObj); // Drop at the bottom of the node
      }
    }

    // Update the state with the modified deep clone of menuData
    setMenuData(data);
  };

  const handleDbClickMenu = (e, node) => {
    setSelectedMenu(node);
    setIsOpenModal(true);
  };

  const handleOnSubmit = (values, { resetForm }) => {
    const updatedMenu = {
      ...values,
      router: !!values.router ? values.router : undefined,
      icon: !!values.icon ? values.icon : undefined,
      children: [],
    };

    if (selectedMenu?.key === ADD_NEW_MENU) {
      setMenuData((prev) => [...prev, updatedMenu]);
    } else {
      const newData = [...menuData];
      const updateNode = (data: MenuItemType[], key: any) => {
        data.forEach((item) => {
          if (item.title === key) {
            item.title = updatedMenu.title;
            item.router = !!updatedMenu.router ? updatedMenu.router : undefined;
            item.icon = !!updatedMenu.icon ? updatedMenu.icon : undefined;
            item.access = updatedMenu.access;
          }
          if (item.children) {
            updateNode(item.children, key);
          }
        });
      };
      updateNode(newData, selectedMenu?.key);
      setMenuData(newData);
    }

    resetForm();
    handleCloseModal();
    setInitializeChanges(true);
  };

  const fields = [
    {
      id: "title",
      name: "title",
      label: "Title",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "router",
      name: "router",
      label: "Router",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "icon",
      name: "icon",
      label: "Icon Classnames",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "access",
      name: "access",
      label: "Access",
      type: "select",
      allowMultiple: true,
      options: UserRoleOptions,
    },
  ];

  const findMenuItem = useCallback(
    (key: any, data: MenuItemType[]): MenuItemType | undefined => {
      for (const item of data) {
        if (item.title === key) {
          return item;
        }
        if (item.children) {
          const foundInChildren = findMenuItem(key, item.children);
          if (foundInChildren) {
            return foundInChildren;
          }
        }
      }
      return undefined;
    },
    []
  );

  const selectedMenuItem = useMemo(() => {
    if (selectedMenu?.key) {
      return findMenuItem(selectedMenu?.key, menuData) || DEFAULT_FORM_VALUES;
    }

    return DEFAULT_FORM_VALUES;
  }, [selectedMenu?.key, menuData, findMenuItem]);

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(2, "Menu item title must be at least 2 characters")
      .required("Please enter menu item title")
      .test(
        "unique",
        "Menu item with this name already exists",
        function (value) {
          if (value && value.length >= 2) {
            const filteredItem = findMenuItem(value, menuData);
            if (filteredItem?.title === selectedMenuItem?.title) {
              return true;
            }
            return !filteredItem;
          }
          return true;
        }
      ),
    router: Yup.string(),
    icon: Yup.string(),
    access: Yup.array().required("Please select access permissions"),
  });

  const data = useMemo(() => {
    return [
      ...gData,
      {
        title: "Add new menu",
        key: "add-new-menu",
        icon: <PlusCircleOutlined />,
      },
    ];
  }, [gData]);

  const getRequireMenuSetting = (menuData: any[]) => {
    if (menuData?.length === 0) return [];
    return menuData.map((item) => ({
      id: item?.id || undefined,
      title: item.title,
      access: item.access,
      router: item?.router || undefined,
      icon: item?.icon || undefined,
      children: getRequireMenuSetting(item?.children),
    }));
  };

  const onSave = async () => {
    if (menuData?.length > 0) {
      setIsSaving(true);
      const normalizeMenuData = getRequireMenuSetting(menuData).map(
        (item, index) => ({
          ...item,
          order: index,
        })
      );

      await dispatch(addMenuSettings(normalizeMenuData, deletedIds));
      setDeleteIds([]);
      setInitializeChanges(false);
      setIsSaving(false);
    }
  };

  const UndoChanges = () => {
    const data = structuredClone(menuSettings);
    data.sort((a, b) => a.order - b.order);
    setMenuData(data);
    setInitializeChanges(false);
    setDeleteIds([]);
  };

  return (
    <React.Fragment>
      <div className="page-content menu-settings-page">
        <Container fluid>
          <Breadcrumb title="Menu Settings" breadcrumbItem="Menu Settings" />
        </Container>
        <Row
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            padding: "0px 16px",
            gap: "8px",
          }}
        >
          <Button
            type="default"
            icon={<MdUndo />}
            onClick={UndoChanges}
            disabled={!initializeChanges}
          >
            Undo Changes
          </Button>
          <Button
            type="default"
            icon={<SaveOutlined />}
            disabled={!initializeChanges}
            loading={isSaving}
            onClick={onSave}
          >
            Save
          </Button>
        </Row>
        <Row
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
          }}
        >
          <Tree
            className="draggable-tree"
            draggable
            blockNode
            defaultExpandAll
            showIcon
            showLine
            onDrop={onDrop}
            treeData={data}
            switcherIcon={<DownOutlined />}
            onDoubleClick={handleDbClickMenu}
          />
        </Row>
        {selectedMenu && (
          <FormModal
            modalOpen={isOpenModal}
            isEdit={isEdit}
            fields={fields}
            resource={"Menu Item"}
            initialValues={selectedMenuItem}
            schema={validationSchema}
            handleOnSubmit={handleOnSubmit}
            handleOnCancel={handleCloseModal}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default MenuSettings;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Row } from "antd";
import { Container } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useDispatch } from "react-redux";
import { Tree } from "antd";
import type { TreeDataNode, TreeProps } from "antd";
import { DownOutlined, PlusCircleOutlined, SaveOutlined } from "@ant-design/icons";
import FormModal from "Components/Common/FormModal";
import { UserRoleOptions } from "common/options";
import * as Yup from "yup";
import "./index.scss";

export type MenuItemType = {
  id?: string;
  title: string;
  router: string;
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

  const [selectedMenu, setSelectedMenu] = useState<TreeDataNode | null>(null);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const isEdit = useMemo(
    () => selectedMenu?.key !== ADD_NEW_MENU,
    [selectedMenu?.key]
  );

  const gData = useMemo(
    () =>
      menuData.map((item) => {
        const mapChildrens = (childrens: MenuItemType[] | undefined) => {
          if (!childrens) return [];
          return childrens.map((child) => ({
            key: child.title,
            title: child.title,
            children: mapChildrens(child.children),
          }));
        };

        return {
          key: item.title,
          title: item.title,
          children: mapChildrens(item.children),
        };
      }),
    [menuData]
  );

  const handleCloseModal = useCallback(() => {
    setIsOpenModal(false);
    setSelectedMenu(null);
  }, []);

  const onDrop: TreeProps["onDrop"] = (info) => {
    if (info.dragNode.key === ADD_NEW_MENU) return;

    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split("-");
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (
      data: MenuItemType[],
      key: React.Key,
      callback: (node: MenuItemType, i: number, data: MenuItemType[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].title === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback);
        }
      }
    };

    const data = [...menuData]; // Copy the current menu data

    // Find dragObject
    let dragObj: MenuItemType = {
      title: "",
      router: "",
      access: [],
    };
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1); // Remove the dragged item from the original position
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop inside the node (as a child)
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj); // Insert the dragged item at the top of the children
      });
    } else {
      let ar: MenuItemType[] = [];
      let i: number = 0;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        // Drop at the top of the node
        ar.splice(i, 0, dragObj);
      } else {
        // Drop at the bottom of the node
        ar.splice(i + 1, 0, dragObj);
      }
    }

    setMenuData(data); // Update the menuData with the new structure
  };

  const handleDbClickMenu = (e, node) => {
    setSelectedMenu(node);
    setIsOpenModal(true);
  };

  const handleOnSubmit = (values, { resetForm }) => {
    const updatedMenu = { ...values, childrens: [] };

    if (selectedMenu?.key === ADD_NEW_MENU) {
      setMenuData((prev) => [...prev, updatedMenu]);
    } else {
      const newData = [...menuData];
      const updateNode = (data: MenuItemType[], key: any) => {
        data.forEach((item) => {
          if (item.title === key) {
            item.title = updatedMenu.title;
            item.router = updatedMenu.router;
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
    router: Yup.string().required("Please enter the router path"),
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
          }}
        >
          <Button type="default" icon={<SaveOutlined />}>Save</Button>
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

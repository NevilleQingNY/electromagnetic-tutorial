import React from 'react';
import { Outlet } from 'react-router-dom';
import TabsMenu from '../../components/TabsMenu';

const MainLayout = () => {
  return (
    <div>
      <TabsMenu />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../pages/MainLayout';
import Home from '../pages/Home';
import Demos from '../pages/Demos';
import Tutorials from '../pages/Tutorials';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="demos/*" element={<Demos />} />
        <Route path="tutorials/*" element={<Tutorials />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

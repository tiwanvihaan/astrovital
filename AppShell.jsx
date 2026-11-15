import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from './SideNav';
import MobileNav from './MobileNav';
import TopBar from './TopBar';
import ReminderWatcher from '@/components/reminders/ReminderWatcher';
import ReminderAlertHost from '@/components/reminders/ReminderAlertHost';
import TourHost from '@/components/tour/TourHost';
import TypographySync from '@/components/typography/TypographySync';

export default function AppShell() {
  return (
    <div className="min-h-screen">
      <SideNav />
      <div className="lg:pl-[236px]">
        <TopBar />
        <main className="mx-auto w-full max-w-[1320px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-10 lg:pb-16">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <ReminderWatcher />
      <ReminderAlertHost />
      <TourHost />
      <TypographySync />
    </div>
  );
}
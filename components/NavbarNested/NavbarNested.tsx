'use client';

import { NavLink, Stack } from '@mantine/core';
import {
  IconDashboard,
  IconNews,
  IconCalendar,
  IconChartLine,
  IconFileText,
  IconSettings,
  IconShield,
  IconBuildingFactory,
  IconFileAnalytics,
  IconBox,
} from '@tabler/icons-react';
import { useState } from 'react';
import Link from 'next/link';

const data = [
  { icon: IconDashboard, label: 'Dashboard',link:'/dashboard' },
  { icon: IconBuildingFactory, label: 'Manage Suppliers',link:'/supplier' },
  { icon: IconBox, label: 'Manage Products',
    links: [
      { label: 'RCR', link: '/rcr' },
      { label: 'Product Components', link: '/component' },

      // { label: 'Forecasts', link: '/news/forecasts' },
      // { label: 'Outlook', link: '/news/outlook' },
      // { label: 'Real time', link: '/news/real-time' },
    ],
  },
  {
    icon: IconFileAnalytics,
    label: 'Reports',
    links: [
      { label: 'Payment method', link: '/news/overview' },
      { label: 'Forecasts', link: '/news/forecasts' },
      { label: 'Outlook', link: '/news/outlook' },
      { label: 'Real time', link: '/news/real-time' },
    ],
  },
  // {
  //   icon: IconCalendar,
  //   label: 'Releases',
  //   links: [
  //     { label: 'Upcoming', link: '/releases/upcoming' },
  //     { label: 'Past', link: '/releases/past' },
  //   ],
  // },
  // { icon: IconChartLine, label: 'Analytics' },
  // { icon: IconFileText, label: 'Contracts' },
  // { icon: IconSettings, label: 'Settings' },
  // { icon: IconShield, label: 'Security' },
 

];

export function NavbarNested() {

const [active, setActive] = useState('Dashboard');
const items = data.map((item) => {
    // 2. Check if the item has sub-links
    const hasLinks = Array.isArray(item.links);
    // const nestedLinks = item.links?.map((link) => (
    //   <NavLink
    //     key={link.label}
    //     label={link.label}
    //     href={link.link}
    //   />
    // ));
    const nestedLinks = item.links?.map((link) => (
      <NavLink
        component={Link}
        href={link.link}
        key={link.label}
        label={link.label}
      />
    ));
    
    // return (
    //   <NavLink
    //     key={item.label}
    //     label={item.label}
    //     leftSection={<item.icon size="1.2rem" stroke={1.5} />}
    //     childrenOffset={28}
    //     active={item.label === active}
    //     variant="light"
    //   >
    //     {hasLinks && nestedLinks}
    //   </NavLink>
    // );

    // if (item.link) {
    //   return (
    //     <NavLink
    //       component={Link}
    //       href={item.link}
    //       key={item.label}
    //       label={item.label}
    //       leftSection={<item.icon size="1.2rem" stroke={1.5} />}
    //       active={item.label === active}
    //       onClick={() => setActive(item.label)}
    //       variant="light"
    //     />
    //   );
    // }

    // return (
    //   <NavLink
    //     key={item.label}
    //     label={item.label}
    //     leftSection={<item.icon size="1.2rem" stroke={1.5} />}
    //     childrenOffset={28}
    //     active={item.label === active}
    //     variant="light"
    //   >
    //     {hasLinks && nestedLinks}
    //   </NavLink>
    // );
   // PATH 1: It is a direct link (e.g., Dashboard, Manage Suppliers)
    if (item.link) {
      return (
        <NavLink
          component={Link}
          href={item.link}
          key={item.label}
          label={item.label}
          leftSection={<item.icon size="1.2rem" stroke={1.5} />}
          active={item.label === active}
          onClick={() => setActive(item.label)}
          variant="light"
        />
      );
    }

    // PATH 2: It is a Dropdown folder (e.g., Manage Products, Reports)
    return (
      <NavLink
        key={item.label}
        label={item.label}
        leftSection={<item.icon size="1.2rem" stroke={1.5} />}
        childrenOffset={28}
        active={item.label === active}
        variant="light"
      >
        {hasLinks && nestedLinks}
      </NavLink>
    );
  });

  return <Stack gap={0}>{items}</Stack>;
}
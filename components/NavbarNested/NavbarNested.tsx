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
} from '@tabler/icons-react';
import { useState } from 'react';

const data = [
  { icon: IconDashboard, label: 'Dashboard' },
  {
    icon: IconNews,
    label: 'Market news',
    links: [
      { label: 'Overview', link: '/news/overview' },
      { label: 'Forecasts', link: '/news/forecasts' },
      { label: 'Outlook', link: '/news/outlook' },
      { label: 'Real time', link: '/news/real-time' },
    ],
  },
  {
    icon: IconCalendar,
    label: 'Releases',
    links: [
      { label: 'Upcoming', link: '/releases/upcoming' },
      { label: 'Past', link: '/releases/past' },
    ],
  },
  { icon: IconChartLine, label: 'Analytics' },
  { icon: IconFileText, label: 'Contracts' },
  { icon: IconSettings, label: 'Settings' },
  { icon: IconShield, label: 'Security' },
  { icon: IconBuildingFactory, label: 'Manage Suppliers' },

];

export function NavbarNested() {
    // Optional: keep track of the active main link if you want highlight states
const [active, setActive] = useState('Dashboard');
const items = data.map((item) => {
    // 2. Check if the item has sub-links
    const hasLinks = Array.isArray(item.links);
    const nestedLinks = item.links?.map((link) => (
      <NavLink
        key={link.label}
        label={link.label}
        href={link.link}
      />
    ));

    return (
    <NavLink
        key={item.label}
        label={item.label}
        leftSection={<item.icon size="1.2rem" stroke={1.5} />}
        active={item.label === active}
        onClick={() => !hasLinks && setActive(item.label)} // Only set active if it's a direct link
        variant="light"
        childrenOffset={28} // This controls the indent of the sub-menu items
    >
        {/* If nestedLinks exists, Mantine automatically makes this a dropdown! */}
        {nestedLinks}
    </NavLink>
    );
  });

  return <Stack gap={0}>{items}</Stack>;
}
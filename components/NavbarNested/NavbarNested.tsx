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
  IconReceipt2,
} from '@tabler/icons-react';
import { useState } from 'react';

const data = [
  { icon: IconDashboard, label: 'Dashboard',link:'/dashboard' },
  { icon: IconBuildingFactory, label: 'Manage Suppliers',link:'/supplier' },
  { icon: IconBox, label: 'Manage Products',
    links: [
      { label: 'RCR', link: '/rcr' },
      { label: 'Product Components', link: '/component' },
      { label: 'Product Overview', link: '/overview' },
    ],
  },
    { 
    icon: IconReceipt2, // or IconListSearch
    label: 'Manage Orders', 
    link: '/orders'     // You will build the page at app/(main)/orders/page.tsx
  },
  {
    icon: IconFileAnalytics,
    label: 'Reports',
    links: [
      { label: 'Tender report', link: '/tender' },
      { label: 'Payments report', link: '/tender_details' },
      { label: 'Scheme report', link: '/schemes' },
      { label: 'Left-over report', link: '/left_over' },
      { label: 'Rebate report', link: '/rebate' },


    ],
  },
];

export function NavbarNested() {

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
        href={item.link}
    >
        {nestedLinks}
    </NavLink>
    );
  });

  return <Stack gap={0}>{items}</Stack>;
}
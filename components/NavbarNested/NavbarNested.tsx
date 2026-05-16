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
  IconTag,
} from '@tabler/icons-react';
import { useState } from 'react';

import { useAuthStore } from '../../store/useAuthStore'

const data = [
  { icon: IconDashboard, label: 'Dashboard',link:'/dashboard' },
  { icon: IconBuildingFactory, label: 'Manage Suppliers',link:'/supplier' },
  { icon: IconBox, label: 'Manage Products',
    links: [
      { label: 'RCR', link: '/rcr' },
      { label: 'Product Components', link: '/component' },
      { label: 'Product Overview', link: '/overview' },
      { label: 'Print Barcodes', link: '/barcode' },
    ],
  },
  { 
    icon: IconReceipt2, // or IconListSearch
    label: 'Manage Orders', 
    link: '/orders'     // You will build the page at app/(main)/orders/page.tsx
  },
  { 
    icon: IconReceipt2, // or IconListSearch
    label: 'Manage Load', 
    link: '/load'     // You will build the page at app/(main)/load/page.tsx
  },
  { 
    icon: IconTag, // or IconListSearch
    label: 'Promotions',
    links: [
      { label: 'Clearance Sale', link: '/clearance_sale' },
    ],
  },
  {
    icon: IconFileAnalytics,
    label: 'Reports',
    links: [
      { label: 'Sales Report per tender', link: '/tender' },
      { label: 'Sales Report per transaction', link: '/tender_details' },
      { label: 'Products & Schemes', link: '/schemes' },
      { label: 'Rebate report', link: '/rebate' },
      { label: 'SKU report', link: '/sku' },

    ],
  },
];

// export function NavbarNested() {
//   const user = useAuthStore((state) => state.user);

// const [active, setActive] = useState('Dashboard');
// const items = data.map((item) => {
//     // 2. Check if the item has sub-links
//     const hasLinks = Array.isArray(item.links);
//     const nestedLinks = item.links?.map((link) => (
//       <NavLink
//         key={link.label}
//         label={link.label}
//         href={link.link}
//       />
//     ));

//     return (
//     <NavLink
//         key={item.label}
//         label={item.label}
//         leftSection={<item.icon size="1.2rem" stroke={1.5} />}
//         active={item.label === active}
//         onClick={() => !hasLinks && setActive(item.label)} // Only set active if it's a direct link
//         variant="light"
//         childrenOffset={28} // This controls the indent of the sub-menu items
//         href={item.link}
//     >
//         {nestedLinks}
//     </NavLink>
//     );
//   });

//   return <Stack gap={0}>{items}</Stack>;
// }
export function NavbarNested() {
  const user = useAuthStore((state) => state.user);
  const [active, setActive] = useState('Dashboard');

  // 1. Filter the data based on department
  const visibleNavData = data.filter((item) => {
    // Check if department is 'marketing' (case-insensitive for safety)
    if (user?.department?.toLowerCase() === 'marketing') {
      return item.label === 'Reports';
    }
    // If not marketing, show everything (or add other role logic here)
    return true;
  });

  // 2. Map through the filtered results
  const items = visibleNavData.map((item) => {
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
        onClick={() => !hasLinks && setActive(item.label)}
        variant="light"
        childrenOffset={28}
        href={item.link}
      >
        {nestedLinks}
      </NavLink>
    );
  });

  return <Stack gap={0}>{items}</Stack>;
}
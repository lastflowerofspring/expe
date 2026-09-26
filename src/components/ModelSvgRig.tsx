import React from 'react';

// Exact 15 vector paths extracted directly from model.svg (4096 x 4096 coordinate space)
export const MODEL_SVG_PATHS = {
  // Path 0: Hijab silhouette (X: 382-3706, Y: 462-3808)
  hijab:
    'M898 3201C801 3129 757 3080 693 2978 619 2863 561 2739 519 2609 416 2292 416 1959 412 1629 411 1611 409 1593 407 1576 394 1468 382 1358 390 1250 449 492 1425 462 1997 475 2270 485 2545 505 2811 568 3097 636 3433 765 3533 1071 3582 1221 3568 1372 3556 1525 3548 1625 3564 1721 3547 1821 3501 2093 3397 2353 3360 2626 3346 2726 3352 2813 3376 2910 3384 2951 3380 2995 3370 3034 3355 3096 3325 3150 3288 3201 3279 3213 3237 3257 3234 3266 3237 3294 3244 3329 3249 3357L3277 3503 3313 3699C3319 3734 3326 3775 3333 3808H774C796 3706 817 3604 838 3501L860 3390C863 3377 870 3350 871 3337 871 3323 894 3219 898 3201Z',

  // Path 1: Dark Shirt (X: 774-3706, Y: 3203-3808)
  shirt:
    'M901 3203C1047 3302 1213 3370 1380 3426 1668 3520 1966 3578 2267 3600 2363 3606 2485 3609 2580 3594 2683 3579 2805 3534 2899 3491 2970 3459 3053 3411 3116 3365 3144 3344 3170 3322 3196 3299 3204 3292 3226 3268 3234 3266 3237 3294 3244 3329 3249 3357L3277 3503 3313 3699C3319 3734 3326 3775 3333 3808H774C796 3706 817 3604 838 3501L860 3390C863 3377 870 3350 871 3337 880 3317 896 3228 901 3203Z',

  // Path 2: Face Skin Base (X: 716-3228, Y: 929-2763)
  faceSkin:
    'M768 1545L758 1546C769 1530 767 1522 774 1506 785 1480 796 1446 808 1422 869 1300 978 1195 1095 1127 1177 1080 1264 1043 1356 1019 1686 929 2160 944 2491 1031 2748 1097 2994 1234 3129 1471 3134 1478 3155 1517 3153 1523 3180 1553 3211 1672 3220 1715 3228 1751 3213 1798 3214 1835 3212 1845 3210 1857 3208 1866L3224 1873C3220 1943 3196 2018 3166 2081 3155 2104 3135 2138 3125 2160 3112 2199 3093 2235 3071 2270 2933 2488 2712 2619 2463 2675 2072 2763 1451 2672 1113 2457 926 2339 773 2163 724 1943L730 2097C716 2054 718 1928 716 1879 717 1868 716 1855 718 1841 718 1827 719 1776 724 1764 724 1753 725 1745 726 1734 730 1717 731 1696 734 1679 737 1658 741 1637 742 1616L744 1613C746 1583 750 1569 768 1545Z',

  // Path 3: Shadows Under Hijab (X: 716-3224, Y: 929-2763)
  shadowsUnderHijab:
    'M718 1841C718 1863 717 1893 721 1914 724 1931 748 1959 759 1973 811 2038 880 2091 951 2132 960 2137 978 2149 988 2149 1007 2160 1027 2170 1047 2180 1394 2353 2052 2388 2442 2343 2551 2330 2658 2308 2762 2273 2884 2232 3000 2172 3090 2079 3133 2033 3158 1992 3185 1937 3195 1918 3204 1886 3208 1866L3224 1873C3220 1943 3196 2018 3166 2081 3155 2104 3135 2138 3125 2160 3112 2199 3093 2235 3071 2270 2933 2488 2712 2619 2463 2675 2072 2763 1451 2672 1113 2457 926 2339 773 2163 724 1943L730 2097C716 2054 718 1928 716 1879 717 1868 716 1855 718 1841ZM768 1545C765 1546 763 1548 760 1549L758 1546C769 1530 767 1522 774 1506 785 1480 796 1446 808 1422 869 1300 978 1195 1095 1127 1177 1080 1264 1043 1356 1019 1686 929 2160 944 2491 1031 2748 1097 2994 1234 3129 1471 3134 1478 3155 1517 3153 1523 3115 1499 3075 1475 3035 1454 3008 1440 2980 1427 2953 1414L2960 1406C2860 1344 2743 1302 2627 1281 2596 1276 2564 1270 2532 1270 2512 1260 2384 1236 2353 1231 1986 1172 1585 1170 1229 1286 1063 1339 894 1424 768 1545Z',

  // Path 4: Right Cheek Linear Gradient (X: 2672-3224, Y: 1866-2506)
  cheekGrad:
    'M3208 1866L3224 1873C3220 1943 3196 2018 3166 2081 3155 2104 3135 2138 3125 2160 3109 2181 3094 2205 3077 2226 2984 2341 2860 2432 2723 2488 2711 2493 2684 2506 2672 2505 2680 2497 2700 2492 2711 2488 2903 2411 3067 2264 3148 2072 3159 2046 3196 1963 3185 1937 3195 1918 3204 1886 3208 1866Z',

  // Path 5: Chin Wrap Overlap (X: 717-988, Y: 1765-2149)
  chinWrap:
    'M718 1841C718 1827 719 1776 724 1765 725 1778 723 1790 723 1803 723 1832 722 1862 725 1891 786 1986 846 2057 941 2118 949 2123 984 2144 988 2149 978 2149 960 2137 951 2132 880 2091 811 2038 759 1973 748 1959 724 1931 721 1914 717 1893 718 1863 718 1841Z',

  // Path 6: Face Light Base (X: 719-3253, Y: 1372-2023)
  faceLightBase:
    'M1028 1424C1069 1412 1111 1400 1154 1393 1272 1372 1439 1377 1553 1417 1658 1446 1797 1523 1831 1633 1854 1624 1905 1607 1930 1608L1933 1608C1983 1596 2064 1612 2112 1629 2165 1499 2343 1417 2476 1399 2566 1380 2673 1380 2764 1392 2773 1393 2805 1398 2812 1400 2842 1405 2873 1414 2902 1423 2935 1435 2977 1450 3006 1469 3054 1490 3114 1542 3142 1586 3253 1763 3076 1910 2919 1962 2801 2001 2645 2023 2521 2000 2511 2000 2490 1996 2480 1994 2467 1992 2454 1989 2441 1986 2285 1952 2060 1838 2106 1645 2017 1616 1924 1607 1837 1651 1838 1661 1841 1675 1841 1685 1844 1872 1603 1971 1451 1993 1447 1993 1444 1994 1441 1994 1407 2001 1355 2004 1321 2005 1175 2007 1022 1979 898 1898 786 1826 719 1703 802 1580L809 1570C814 1562 821 1555 827 1548 831 1543 837 1538 841 1533L864 1513C887 1494 902 1484 927 1469 949 1456 976 1445 999 1435L1028 1424Z',

  // Path 7: Forehead Highlight (X: 1370-2172, Y: 1402-1656)
  foreheadHighlight:
    'M1807 1645L1788 1628C1782 1602 1760 1583 1745 1559L1748 1554C1645 1452 1508 1418 1370 1404 1377 1402 1382 1402 1391 1402 1431 1403 1498 1419 1538 1430 1636 1463 1745 1514 1794 1612 1799 1622 1804 1634 1807 1645ZM2172 1577C2171 1584 2157 1606 2157 1607 2151 1625 2156 1639 2143 1656 2142 1651 2143 1652 2144 1647L2135 1645C2145 1616 2153 1601 2172 1577Z',

  // Path 8: Left & Right Eye Sockets (fill="#7B6360")
  eyeSocketLeft:
    'M1266 1595C1315 1578 1410 1586 1457 1610 1462 1613 1477 1621 1481 1624 1492 1632 1496 1635 1506 1645 1560 1716 1492 1773 1426 1790 1415 1793 1404 1796 1392 1799 1319 1808 1235 1803 1178 1749 1104 1678 1196 1611 1266 1595Z',
  eyeSocketRight:
    'M2597 1595C2664 1585 2754 1606 2799 1660 2804 1668 2807 1673 2811 1682 2819 1723 2799 1757 2762 1775 2752 1785 2734 1791 2721 1795 2718 1797 2714 1798 2711 1799 2638 1819 2559 1814 2492 1778 2469 1763 2441 1739 2440 1710 2435 1631 2537 1601 2597 1595Z',

  // Path 9: Left & Right Lashes & Pupils (fill="#604439")
  eyeLashesLeft:
    'M1178 1749C1104 1678 1196 1611 1266 1595L1241 1640C1222 1671 1203 1701 1185 1732 1182 1738 1182 1747 1178 1749ZM1481 1624C1492 1632 1496 1635 1506 1645 1488 1674 1431 1760 1426 1790 1415 1793 1404 1796 1392 1799 1386 1798 1386 1799 1381 1796 1385 1786 1396 1778 1400 1770 1423 1722 1454 1679 1477 1632 1478 1630 1478 1628 1481 1624Z',
  eyeLashesRight:
    'M2492 1778C2469 1763 2441 1739 2440 1710 2435 1631 2537 1601 2597 1595L2492 1778ZM2721 1795L2718 1792C2738 1750 2771 1708 2791 1665 2792 1661 2795 1661 2799 1660 2804 1668 2807 1673 2811 1682 2819 1723 2799 1757 2762 1775 2752 1785 2734 1791 2721 1795Z',

  // Path 10: Left & Right Eyebrows (fill="#580D2B")
  eyebrowLeft:
    'M1454 1269C1535 1261 1638 1276 1708 1319 1676 1315 1646 1308 1613 1304 1479 1290 1372 1299 1243 1332 1211 1340 1180 1349 1148 1359 1127 1367 1057 1396 1046 1396 1053 1388 1088 1372 1100 1367 1207 1315 1335 1278 1454 1269Z',
  eyebrowRight:
    'M2953 1414C2930 1401 2897 1388 2872 1377 2735 1318 2594 1294 2445 1300 2419 1302 2393 1304 2367 1307 2350 1310 2331 1314 2313 1315L2313 1313C2322 1303 2337 1299 2350 1295 2409 1273 2469 1269 2532 1270 2564 1270 2596 1276 2627 1281 2743 1302 2860 1344 2960 1406L2962 1409C2958 1414 2960 1412 2953 1414Z',

  // Path 11: Wire Glasses Frames (fill="#580D2B")
  glasses:
    'M802 1580C807 1584 810 1592 811 1598 812 1602 812 1606 813 1610 744 1756 863 1869 988 1926 1104 1978 1229 1994 1355 1987 1375 1986 1396 1983 1416 1982L1421 1988 1417 1993C1424 1993 1434 1993 1441 1994 1407 2001 1355 2004 1321 2005 1175 2007 1022 1979 898 1898 786 1826 719 1703 802 1580ZM1028 1424C1069 1412 1111 1400 1154 1393 1272 1372 1439 1377 1553 1417 1560 1423 1566 1426 1571 1431 1568 1430 1542 1429 1538 1430 1498 1419 1431 1403 1391 1402 1304 1386 1132 1403 1050 1436 1039 1433 1039 1429 1028 1424ZM827 1548C831 1543 837 1538 841 1533 853 1540 852 1539 853 1553L841 1566 831 1580C824 1590 819 1599 813 1610 812 1606 812 1602 811 1598 810 1592 807 1584 802 1580L809 1570C814 1562 821 1555 827 1548ZM864 1513C887 1494 902 1484 927 1469L942 1484C924 1495 909 1505 892 1517 877 1516 876 1524 864 1513ZM927 1469C949 1456 976 1445 999 1435L1001 1441C998 1445 996 1448 995 1452L996 1456C978 1465 960 1474 942 1484L927 1469ZM1028 1424C1039 1429 1039 1433 1050 1436 1032 1442 1014 1449 996 1456L995 1452C996 1448 998 1445 1001 1441L999 1435 1028 1424ZM841 1533L864 1513C876 1524 877 1516 892 1517 880 1528 864 1541 853 1553 852 1539 853 1540 841 1533ZM2476 1399C2486 1405 2483 1401 2492 1402 2529 1403 2671 1384 2698 1402 2525 1395 2342 1420 2205 1540 2195 1548 2179 1566 2172 1577 2153 1601 2145 1616 2135 1645 2087 1817 2280 1925 2418 1963 2428 1966 2438 1969 2448 1971 2442 1971 2440 1971 2434 1973L2433 1976 2436 1979C2438 1982 2439 1982 2441 1986 2285 1952 2060 1838 2106 1645 2017 1616 1924 1607 1837 1651 1838 1661 1841 1675 1841 1685 1844 1872 1603 1971 1451 1993 1447 1993 1444 1994 1441 1994 1434 1993 1424 1993 1417 1993 1421 1990 1420 1992 1421 1988L1416 1982C1562 1959 1746 1902 1804 1749 1816 1719 1816 1676 1807 1645 1804 1634 1799 1622 1794 1612 1745 1514 1636 1463 1538 1430 1542 1429 1568 1430 1571 1431 1566 1426 1560 1423 1553 1417 1658 1446 1797 1523 1831 1633 1854 1624 1905 1607 1930 1608L1933 1608C1983 1596 2064 1612 2112 1629 2165 1499 2343 1417 2476 1399ZM1930 1608L1933 1608C1942 1609 1952 1608 1963 1610 1956 1616 1938 1618 1930 1612L1930 1608ZM3006 1469C3054 1490 3114 1542 3142 1586 3253 1763 3076 1910 2919 1962 2801 2001 2645 2023 2521 2000 2529 1999 2540 1999 2547 1999L2546 1998 2551 1997 2555 1998 2555 1998C2546 1994 2541 1992 2533 1986 2727 2006 2997 1973 3118 1797 3181 1705 3140 1593 3060 1529 3030 1505 3005 1492 2972 1471 2989 1472 2990 1480 3006 1469ZM2476 1399C2566 1380 2673 1380 2764 1392 2773 1393 2805 1398 2812 1400 2842 1405 2873 1414 2902 1423 2935 1435 2977 1450 3006 1469 2990 1480 2989 1472 2972 1471 2962 1468 2952 1463 2943 1459 2907 1443 2869 1432 2832 1422 2818 1420 2789 1413 2774 1411 2748 1407 2724 1404 2698 1402 2671 1384 2529 1403 2492 1402 2483 1401 2486 1405 2476 1399ZM2448 1971L2504 1982C2512 1983 2525 1984 2533 1986 2541 1992 2546 1994 2555 1998L2555 1998 2551 1997 2546 1998 2547 1999C2540 1999 2529 1999 2521 2000 2511 2000 2490 1996 2480 1994 2467 1992 2454 1989 2441 1986 2439 1982 2438 1982 2436 1979L2433 1976 2434 1973C2440 1971 2442 1971 2448 1971Z',

  // Path 12: Authentic Coral Smile (fill="#E5605F")
  smile:
    'M2186 1966C2192 1965 2192 1965 2198 1967L2199 1970C2183 1994 2125 2019 2098 2025 1993 2048 1866 2041 1772 1988 1761 1982 1756 1979 1749 1969 1752 1968 1789 1984 1796 1986 1927 2032 2055 1995 2186 1966Z',

  // Path 13: Left Cheek Fold (fill="#604439")
  foldCheekLeft:
    'M711 1813C711 1802 720 1731 723 1722L725 1723 726 1734C725 1745 724 1753 724 1765 719 1776 718 1827 718 1841 716 1855 717 1868 716 1880 718 1928 716 2054 730 2097 731 2114 735 2135 738 2152 789 2475 967 2754 1268 2894 1309 2912 1350 2929 1393 2943 1410 2949 1440 2956 1455 2963 1443 2963 1430 2958 1418 2955 867 2808 681 2350 711 1813Z',

  // Path 13: Torso Chest Crease (fill="#604439")
  foldChest:
    'M1427 2716C1431 2716 1528 2758 1546 2765 1724 2834 1922 2906 2115 2906 2144 2906 2191 2898 2220 2890 2276 2876 2352 2849 2390 2802 2405 2783 2408 2772 2418 2754 2421 2758 2420 2756 2419 2763 2404 2848 2281 2894 2207 2908 2000 2949 1778 2857 1586 2786 1549 2773 1458 2736 1427 2716Z',

  // Path 13: Right Cheek Crease (fill="#604439")
  foldCheekRight:
    'M3214 1835L3214 1833C3221 1805 3223 1768 3226 1739L3227 1739C3230 1764 3232 1852 3224 1873 3218 1881 3220 1877 3218 1887L3217 1889 3218 1893C3217 1886 3216 1878 3213 1871L3211 1871 3209 1878 3208 1866C3210 1857 3212 1845 3214 1835Z',

  // Path 14: Chest Drape Fold (fill="url(#fld-m)")
  foldChestGrad:
    'M2830 2875C2833 2877 2831 2876 2833 2880 2788 3110 2550 3237 2332 3247 2304 3248 2276 3248 2248 3248L2246 3247 2246 3245C2264 3243 2300 3245 2322 3244 2376 3241 2430 3232 2482 3216 2616 3175 2711 3093 2781 2973 2800 2939 2811 2910 2828 2877L2830 2875Z',
};

export interface ModelSvgRigProps {
  def: any;
  showBones?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ModelSvgRig: React.FC<ModelSvgRigProps> = ({ def, showBones, className, style }) => {
  const mouthCenterX = 1974;
  const mouthCenterY = 2006 + (def.mouthY || 0);
  const smileVal = def.smileFrown || 0;
  const lipScale = def.lipStretch || 1.0;
  const jawAperture = Math.max(0, def.jawOpen || 0);

  return (
    <div
      className={`relative flex items-center justify-center select-none mx-auto ${className || ''}`}
      style={{
        aspectRatio: '2377 / 4096',
        height: '100%',
        maxHeight: '460px',
        width: 'auto',
        maxWidth: '100%',
        ...style,
      }}
    >
      <svg
        viewBox="0 0 4096 4096"
        width="2377"
        height="4096"
        preserveAspectRatio="none"
        className="w-full h-full select-none drop-shadow-2xl"
        style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
      >
        <defs>
          {/* Authentic Gradient from model.svg */}
          <linearGradient id="chk-m" x1="3179" y1="2215" x2="2710" y2="2160" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#58413E" />
            <stop offset="1" stopColor="#775E59" />
          </linearGradient>

          {/* Authentic Chest Fold Gradient from model.svg */}
          <linearGradient id="fld-m" x1="2593" y1="3175" x2="2524" y2="3046" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#553E3A" />
            <stop offset="1" stopColor="#80615E" />
          </linearGradient>

          {/* Speech Oral Cavity Depth */}
          <linearGradient id="oral-depth-m" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#25080E" />
            <stop offset="60" stopColor="#4A131E" />
            <stop offset="100" stopColor="#6E1E2C" />
          </linearGradient>
        </defs>

        {/* ========================================================= */}
        {/* LAYER 0: UNIFIED TORSO & BODY SILHOUETTE                  */}
        {/* Unbroken, pristine continuous vector curves from model.svg */}
        {/* Organic spine follow-through sway with ZERO sharp seams   */}
        {/* ========================================================= */}
        <g
          id="Grounded-Torso-Group"
          style={{
            transform: `translateY(${def.torsoY * 1.5}px) translateX(${def.headYaw * 0.8}px) rotate(${def.headRoll * 0.25}deg)`,
            transformOrigin: '1974px 3808px',
            transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* Path 0: Full Continuous Base Hijab Silhouette */}
          <path fill="#A48784" d={MODEL_SVG_PATHS.hijab} />

          {/* Path 1: Dark Shirt Hem */}
          <path fill="#252122" d={MODEL_SVG_PATHS.shirt} />

          {/* Path 14: Chest Drape Fold */}
          <path fill="url(#fld-m)" d={MODEL_SVG_PATHS.foldChestGrad} />

          {/* Path 13 (Subpath 1): Deep Chest Crease */}
          <path fill="#604439" d={MODEL_SVG_PATHS.foldChest} />
        </g>

        {/* ========================================================= */}
        {/* LAYER 1: INDEPENDENT HEAD & FACE RIG                      */}
        {/* Pivots organically at the anatomical neck joint.           */}
        {/* Sits naturally inside the hijab opening with zero cut seams*/}
        {/* ========================================================= */}
        <g
          id="Head-Rig-Group"
          style={{
            transform: `translate(${def.headYaw * 3.2}px, ${def.headPitch * 4.2}px) rotate(${def.headRoll * 0.75}deg) scale(${def.headScale})`,
            transformOrigin: '1974px 2350px',
            transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* 1. Path 2: Face Skin Base */}
          <path fill="#FDD7CE" d={MODEL_SVG_PATHS.faceSkin} />

          {/* 2. Path 3: Shadows Under Hijab */}
          <path fill="#7B6360" d={MODEL_SVG_PATHS.shadowsUnderHijab} />

          {/* 3. Path 4: Right Cheek Linear Gradient */}
          <path fill="url(#chk-m)" d={MODEL_SVG_PATHS.cheekGrad} />

          {/* 4. Path 5: Chin Wrap Overlap */}
          <path fill="#A48784" d={MODEL_SVG_PATHS.chinWrap} />

          {/* 5. Path 6: Face Light Base */}
          <path fill="#FDD7CE" d={MODEL_SVG_PATHS.faceLightBase} />

          {/* 6. Path 7: Forehead & Bridge Highlight */}
          <path fill="#FEE4DC" d={MODEL_SVG_PATHS.foreheadHighlight} />

          {/* 7. Path 13 (Subpaths 0 & 2): Left and Right Cheek Fold Creases */}
          <path fill="#604439" d={MODEL_SVG_PATHS.foldCheekLeft} />
          <path fill="#604439" d={MODEL_SVG_PATHS.foldCheekRight} />

          {/* 8. EYES LAYER (Paths 8 & 9) with Smooth Organic Curvature Blinking */}
          <g id="Eyes-Rig-Layer">
            {/* Left Eye Group */}
            <g
              id="Left-Eye-Group"
              style={{
                transform: `translate(${def.gazeX * 4}px, ${def.gazeY * 3}px)`,
                transition: 'transform 0.12s ease-out',
              }}
            >
              {/* Left Eye Socket */}
              <g
                style={{
                  transform: `scale(1, ${Math.max(0.12, 1 - def.blink * 0.88 - (def.squint || 0) * 0.35)})`,
                  transformOrigin: '1355px 1700px',
                  opacity: Math.max(0.18, 1 - def.blink * 0.82),
                  transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.15s ease-out',
                }}
              >
                <path fill="#7B6360" d={MODEL_SVG_PATHS.eyeSocketLeft} />
              </g>

              {/* Left Eye Lashes & Pupils */}
              <g
                style={{
                  transform: `scale(1, ${Math.max(0.08, 1 - def.blink * 0.92 - (def.squint || 0) * 0.4)}) translateY(${def.blink * 26}px)`,
                  transformOrigin: '1355px 1700px',
                  transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              >
                <path fill="#604439" d={MODEL_SVG_PATHS.eyeLashesLeft} />
              </g>
            </g>

            {/* Right Eye Group */}
            <g
              id="Right-Eye-Group"
              style={{
                transform: `translate(${def.gazeX * 4}px, ${def.gazeY * 3}px)`,
                transition: 'transform 0.12s ease-out',
              }}
            >
              {/* Right Eye Socket */}
              <g
                style={{
                  transform: `scale(1, ${Math.max(0.12, 1 - def.blink * 0.88 - (def.squint || 0) * 0.35)})`,
                  transformOrigin: '2625px 1700px',
                  opacity: Math.max(0.18, 1 - def.blink * 0.82),
                  transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.15s ease-out',
                }}
              >
                <path fill="#7B6360" d={MODEL_SVG_PATHS.eyeSocketRight} />
              </g>

              {/* Right Eye Lashes & Pupils */}
              <g
                style={{
                  transform: `scale(1, ${Math.max(0.08, 1 - def.blink * 0.92 - (def.squint || 0) * 0.4)}) translateY(${def.blink * 26}px)`,
                  transformOrigin: '2625px 1700px',
                  transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              >
                <path fill="#604439" d={MODEL_SVG_PATHS.eyeLashesRight} />
              </g>
            </g>
          </g>

          {/* 9. EYEBROWS LAYER (Path 10) */}
          <g id="Eyebrows-Rig-Layer">
            {/* Left Eyebrow (Pivot around 1377px 1330px) */}
            <g
              style={{
                transform: `translate(0px, ${def.eyebrowLY * 5.5}px) rotate(${def.eyebrowLRotate}deg)`,
                transformOrigin: '1377px 1330px',
                transition: 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <path fill="#580D2B" d={MODEL_SVG_PATHS.eyebrowLeft} />
            </g>

            {/* Right Eyebrow (Pivot around 2637px 1340px) */}
            <g
              style={{
                transform: `translate(0px, ${def.eyebrowRY * 5.5}px) rotate(${def.eyebrowRRotate}deg)`,
                transformOrigin: '2637px 1340px',
                transition: 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <path fill="#580D2B" d={MODEL_SVG_PATHS.eyebrowRight} />
            </g>
          </g>

          {/* 10. WIRE GLASSES FRAMES (Path 11) with Subdued 3D Depth Parallax */}
          <g
            id="Glasses-Rig-Layer"
            style={{
              transform: `translate(${def.glassesParallaxX}px, ${def.glassesParallaxY}px)`,
              transition: 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            <path fill="#580D2B" d={MODEL_SVG_PATHS.glasses} />
          </g>

          {/* 11. MOUTH & SMILE (Path 12) with Continuous Smooth Viseme Transition */}
          <g id="Mouth-Rig-Layer">
            {/* Dynamic Pearlescent Teeth / Oral Cavity behind lips */}
            {(jawAperture > 0.02 || (def.teethVisible && def.teethVisible > 0.02)) && (
              <g
                style={{
                  transform: `translate(0px, ${def.mouthY || 0}px)`,
                  opacity: Math.min(1, Math.max(def.teethVisible || 0, jawAperture * 2.8)),
                  transition: 'transform 0.15s ease-out, opacity 0.12s ease-out',
                }}
              >
                {/* Oral Depth Chamber */}
                {jawAperture > 0.05 && (
                  <ellipse
                    cx={mouthCenterX}
                    cy={mouthCenterY}
                    rx={175 * lipScale}
                    ry={jawAperture * 80}
                    fill="url(#oral-depth-m)"
                  />
                )}
                {/* Upper Teeth Crescent */}
                <path
                  fill="#FAF3F0"
                  d={`M ${mouthCenterX - 130 * lipScale} ${mouthCenterY - jawAperture * 15} Q ${mouthCenterX} ${mouthCenterY - 18 - jawAperture * 40} ${mouthCenterX + 130 * lipScale} ${mouthCenterY - jawAperture * 15} Q ${mouthCenterX} ${mouthCenterY + 12 - jawAperture * 5} ${mouthCenterX - 130 * lipScale} ${mouthCenterY - jawAperture * 15} Z`}
                />
                {/* Soft Tongue Floor */}
                {jawAperture > 0.15 && (
                  <path
                    fill="#DF5A67"
                    d={`M ${mouthCenterX - 100 * lipScale} ${mouthCenterY + jawAperture * 30} Q ${mouthCenterX} ${mouthCenterY + jawAperture * 12} ${mouthCenterX + 100 * lipScale} ${mouthCenterY + jawAperture * 30} Q ${mouthCenterX} ${mouthCenterY + jawAperture * 65} ${mouthCenterX - 100 * lipScale} ${mouthCenterY + jawAperture * 30} Z`}
                  />
                )}
              </g>
            )}

            {/* Authentic Coral Smile Lip Contour (Preserves 100% Vector Parity) */}
            <g
              style={{
                transform: `translate(0px, ${def.mouthY || 0}px) scale(${lipScale}, ${1 + smileVal * 0.22 + jawAperture * 0.45})`,
                transformOrigin: '1974px 2006px',
                transition: 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <path fill="#E5605F" d={MODEL_SVG_PATHS.smile} />
            </g>
          </g>
        </g>

        {/* 13. SKELETAL RIGGING OVERLAY */}
        {showBones && (
          <g className="opacity-90 pointer-events-none">
            {/* Spine (Torso Grounded) */}
            <line x1="1974" y1="3808" x2="1974" y2="2700" stroke="#f59e0b" strokeWidth="24" strokeDasharray="16 8" />
            <circle cx="1974" cy="3808" r="28" fill="#f59e0b" />

            {/* Neck Joint Pivot */}
            <line x1="1974" y1="2700" x2="1974" y2="2350" stroke="#3b82f6" strokeWidth="24" />
            <circle cx="1974" cy="2700" r="32" fill="#3b82f6" />
            <circle cx="1974" cy="2350" r="36" fill="#6366f1" />

            {/* Cranial Head Bone */}
            <line
              x1="1974"
              y1="2350"
              x2={1974 + def.headYaw * 3.2}
              y2={1700 + def.headPitch * 4.2}
              stroke="#ec4899"
              strokeWidth="24"
            />
            <circle cx={1974 + def.headYaw * 3.2} cy={1700 + def.headPitch * 4.2} r="38" fill="#ec4899" />

            {/* Eyebrows */}
            <line
              x1={1974 + def.headYaw * 3.2}
              y1={1700 + def.headPitch * 4.2}
              x2="1377"
              y2={1330 + def.eyebrowLY * 5.5}
              stroke="#10b981"
              strokeWidth="18"
            />
            <line
              x1={1974 + def.headYaw * 3.2}
              y1={1700 + def.headPitch * 4.2}
              x2="2637"
              y2={1340 + def.eyebrowRY * 5.5}
              stroke="#10b981"
              strokeWidth="18"
            />
            <circle cx="1377" cy={1330 + def.eyebrowLY * 5.5} r="26" fill="#10b981" />
            <circle cx="2637" cy={1340 + def.eyebrowRY * 5.5} r="26" fill="#10b981" />

            {/* Eyes */}
            <line
              x1={1974 + def.headYaw * 3.2}
              y1={1700 + def.headPitch * 4.2}
              x2={1332 + def.gazeX * 4}
              y2={1693 + def.gazeY * 3}
              stroke="#06b6d4"
              strokeWidth="18"
            />
            <line
              x1={1974 + def.headYaw * 3.2}
              y1={1700 + def.headPitch * 4.2}
              x2={2627 + def.gazeX * 4}
              y2={1702 + def.gazeY * 3}
              stroke="#06b6d4"
              strokeWidth="18"
            />
            <circle cx={1332 + def.gazeX * 4} cy={1693 + def.gazeY * 3} r="30" fill="#06b6d4" />
            <circle cx={2627 + def.gazeX * 4} cy={1702 + def.gazeY * 3} r="30" fill="#06b6d4" />

            {/* Mouth */}
            <line
              x1={1974 + def.headYaw * 3.2}
              y1={1700 + def.headPitch * 4.2}
              x2={mouthCenterX}
              y2={mouthCenterY}
              stroke="#f43f5e"
              strokeWidth="20"
            />
            <circle cx={mouthCenterX} cy={mouthCenterY} r="32" fill="#f43f5e" />
          </g>
        )}
      </svg>
    </div>
  );
};

import { ApiClient } from 'adminjs';
import { Box, H2, H5, Illustration, Text } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'adminjs';
const pageHeaderHeight = 284;
const pageHeaderPaddingY = 74;
const pageHeaderPaddingX = 250;
export const DashboardHeader = () => {
    const { translateMessage } = useTranslation();
    return (React.createElement(Box, { position: "relative", overflow: "hidden", "data-css": "default-dashboard" },
        React.createElement(Box, { position: "absolute", top: 50, left: -10, opacity: [0.2, 0.4, 1], animate: true },
            React.createElement(Illustration, { variant: "Rocket" })),
        React.createElement(Box, { position: "absolute", top: -70, right: -15, opacity: [0.2, 0.4, 1], animate: true },
            React.createElement(Illustration, { variant: "Moon" })),
        React.createElement(Box, { bg: "grey100", height: pageHeaderHeight, py: pageHeaderPaddingY, px: ['default', 'lg', pageHeaderPaddingX] },
            React.createElement(Text, { textAlign: "center", color: "white" },
                React.createElement(H2, null, "M-Konnect Dashboard"),
                React.createElement(Text, { opacity: 0.8 }, "Stay connected with Konnect.")))));
};
let d;
const CurrencyFormatter = ({ amount }) => {
    if (!amount || isNaN(amount)) {
        return null;
    }
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
    }).format(amount);
    return React.createElement("span", null, formattedAmount);
};
const boxes = ({ translateMessage }) => [{
        variant: 'Astronaut',
        title: d && d.userCount,
        subtitle: "Active Users",
        href: '/admin/resources/User',
    }, {
        variant: 'DocumentCheck',
        title: d && d.TransactionCount,
        subtitle: 'Transactions',
        href: '/admin/resources/transaction',
    }, {
        variant: 'Folders',
        title: d && d.conversationCount,
        subtitle: 'Conversations',
        href: '/admin/resources/Conversation',
    }, {
        variant: 'FlagInCog',
        title: d && d.depositecount,
        subtitle: "Deposits",
        href: '/admin/resources/deposite',
    }, {
        variant: 'Planet',
        title: d && d.DataPlanCount,
        subtitle: "Data Plans",
        href: '/admin/resources/DataPlan',
    }, {
        variant: 'FileSearch',
        title: d && d.planSelectcount,
        subtitle: "Tracking",
        href: '/admin/resources/plan_select',
    }];
const Card = styled(Box) `
  display: ${({ flex }) => (flex ? 'flex' : 'block')};
  color: ${({ theme }) => theme.colors.grey100};
  height: 100%;
  text-color: green;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.space.md};
  transition: all 0.1s ease-in;
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.primary100};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }
`;
Card.defaultProps = {
    variant: 'container',
    boxShadow: 'card',
};
export const Dashboard = () => {
    const { translateMessage, translateButton } = useTranslation();
    const [data, setData] = useState(null);
    const api = new ApiClient();
    useEffect(() => {
        api.getDashboard()
            .then((response) => {
            setData(response.data);
            // console.log(response);
        })
            .catch((error) => {
            // console.log(error);
        });
    }, []);
    let color;
    if (data && data.wallet_balance > data.deposits) {
        color = "#25d366";
    }
    else {
        color = "red";
    }
    // console.log(data);
    if (data) {
        d = data;
        // console.log(d);
    }
    return (React.createElement(Box, null,
        React.createElement(DashboardHeader, null),
        React.createElement(Box, { mt: ['xl', 'xl', '-100px'], mb: "xl", mx: [0, 0, 0, 'auto'], px: ['default', 'lg', 'xxl', '0'], position: "relative", flex: true, flexDirection: "row", flexWrap: "wrap", width: [1, 1, 1, 1024] },
            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#"},
                    React.createElement(Box, { ml: "lg" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && React.createElement(CurrencyFormatter, { amount: data.deposits })),
                        React.createElement(Text, null, "Total Deposits")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#" },
                    React.createElement(Box, { ml: "xl" },
                        React.createElement(H5, { style: { color: color } }, data && React.createElement(CurrencyFormatter, { amount: data.wallet_balance })),
                        React.createElement(Text, null, "Vendor Balance")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#" },
                    React.createElement(Box, { ml: "xl" },
                        React.createElement(H5, { style: { color: color } }, data && React.createElement(CurrencyFormatter, { amount: data.wallet_balance_second_vendor })),
                        React.createElement(Text, null, "Second Vendor Balance")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#" },
                    React.createElement(Box, { ml: "xl" },
                        React.createElement(H5, { style: { color: "#25d366" } },
                            data && data.totalData,
                            " TB"),
                        React.createElement(Text, null, "Data Purchased")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#"},
                    React.createElement(Box, { ml: "lg" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && React.createElement(CurrencyFormatter, { amount: data.totalAirtime })),
                        React.createElement(Text, null, "Airtime Purchased")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#" },
                    React.createElement(Box, { ml: "xl" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && data.dailyUsers),
                        React.createElement(Text, null, "Daily Signup")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#" },
                    React.createElement(Box, { ml: "xl" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && data.WeeklyUserCount),
                        React.createElement(Text, null, "Weekly Signup")))),                        

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#"},
                    React.createElement(Box, { ml: "lg" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && React.createElement(CurrencyFormatter, { amount: data.revenue })),
                        React.createElement(Text, null, "Monthly Revenue")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#"},
                    React.createElement(Box, { ml: "lg" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && React.createElement(CurrencyFormatter, { amount: data.dataProfit })),
                        React.createElement(Text, null, "Monthly Data Profit")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#"},
                    React.createElement(Box, { ml: "lg" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && React.createElement(CurrencyFormatter, { amount: data.airtimeProfit })),
                        React.createElement(Text, null, "Monthly Airtime Profits")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#"},
                    React.createElement(Box, { ml: "lg" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && React.createElement(CurrencyFormatter, { amount: data.powerProfit })),
                        React.createElement(Text, null, "Monthly Electricity Profits")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#"},
                    React.createElement(Box, { ml: "lg" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && React.createElement(CurrencyFormatter, { amount: data.getMonthlytransactionFee })),
                        React.createElement(Text, null, "Transaction Fee Profits")))),

            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#"},
                    React.createElement(Box, { ml: "lg" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && React.createElement(CurrencyFormatter, { amount: data.pending_transfer })),
                        React.createElement(Text, null, "Pending Transfer")))),
    
            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "#"},
                    React.createElement(Box, { ml: "lg" },
                        React.createElement(H5, { style: { color: "#25d366" } }, data && React.createElement(CurrencyFormatter, { amount: data.totalRevenue })),
                        React.createElement(Text, null, "Generated Revenue")))),

            boxes({ translateMessage }).map((box, index) => (React.createElement(Box, { key: index, width: [1, 1 / 2, 1 / 2, 1 / 3], p: "lg" },
                React.createElement(Card, { as: "a", href: box.href },
                    React.createElement(Text, { textAlign: "center" },
                        React.createElement(Illustration, { variant: box.variant, width: 100, height: 70 }),
                        React.createElement(H5, { mt: "lg" }, box.title),
                        React.createElement(H5, { mt: "lg" }, box.subtitle)))))))));
};
export default Dashboard;

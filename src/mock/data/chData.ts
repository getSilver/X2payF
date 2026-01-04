function getDate(dayString: string) {
    const today = new Date()
    const year = today.getFullYear().toString()
    let month = (today.getMonth() + 1).toString()

    if (month.length === 1) {
        month = '0' + month
    }

    return dayString.replace('YEAR', year).replace('MONTH', month)
}

export const chDashboardData = {
    statisticData: [
        {
            key: 'newLeads',
            label: 'New Leads',
            value: 63,
            growShrink: 2.6,
        },
        {
            key: 'emailResponse',
            label: 'Email',
            value: 25,
            growShrink: 5.5,
        },
        {
            key: 'proposals',
            label: 'Proposals',
            value: 49,
            growShrink: -0.7,
        },
        {
            key: 'appointment',
            label: 'Appointment',
            value: 12,
            growShrink: 2.6,
        },
    ],
    leadByRegionData: [
        {
            name: 'United States of America',
            value: 37.61,
        },
        {
            name: 'Brazil',
            value: 16.79,
        },
        {
            name: 'India',
            value: 12.42,
        },
        {
            name: 'China',
            value: 9.85,
        },
        {
            name: 'Algeria',
            value: 7.68,
        },
        {
            name: 'Indonesia',
            value: 5.11,
        },
    ],
    recentLeadsData: [
        {
            id: 1,
            name: 'Eileen Horton',
            avatar: '/img/avatars/thumb-1.jpg',
            status: 0,
            createdTime: 1623430400,
            email: 'eileen_h@hotmail.com',
            assignee: 'Carrie Harris',
        },
        {
            id: 2,
            name: 'Terrance Moreno',
            avatar: '/img/avatars/thumb-2.jpg',
            status: 1,
            createdTime: 1632393600,
            email: 'terrance_moreno@infotech.io',
            assignee: 'Toni Lane',
        },
        {
            id: 3,
            name: 'Ron Vargas',
            avatar: '/img/avatars/thumb-3.jpg',
            status: 1,
            createdTime: 1632393600,
            email: 'ronnie_vergas@infotech.io',
            assignee: 'Joanne Mendoza',
        },
        {
            id: 4,
            name: 'Luke Cook',
            avatar: '/img/avatars/thumb-4.jpg',
            status: 2,
            createdTime: 1632761600,
            email: 'cookie_lukie@hotmail.com',
            assignee: 'Lorraine Carr',
        },
        {
            id: 5,
            name: 'Joyce Freeman',
            avatar: '/img/avatars/thumb-5.jpg',
            status: 3,
            createdTime: 1632416000,
            email: 'joyce991@infotech.io',
            assignee: 'Myrtle Mason',
        },
        {
            id: 6,
            name: 'Samantha Phillips',
            avatar: '/img/avatars/thumb-6.jpg',
            status: 0,
            createdTime: 1633107200,
            email: 'samanthaphil@infotech.io',
            assignee: 'Perry Ward',
        },
    ],
    emailSentData: {
        precent: 73,
        opened: 893,
        unopen: 330,
        total: 1223,
    },
}


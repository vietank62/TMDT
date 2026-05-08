import SessionsList, { type UpcomingSession, type PastSession } from './SessionsList';

const UPCOMING: UpcomingSession[] = [
  {
    id: 101,
    expert: 'Phạm Minh D',
    date: '11/05/2026',
    time: '08:00 - 09:00',
    problem: 'Học về các kỹ thuật Digital Marketing nâng cao: SEO, Google Ads và phân tích dữ liệu người dùng.',
    documents: [
      { name: 'SEO_Checklist_2026.pdf', url: '#' },
      { name: 'Google_Ads_Guide.pdf',   url: '#' },
    ],
  },
  {
    id: 102,
    expert: 'Hoàng Văn E',
    date: '13/05/2026',
    time: '15:00 - 16:00',
    problem: 'Thực hành thiết kế hệ thống UI/UX cho ứng dụng di động, tập trung vào Figma và Design System.',
    documents: [
      { name: 'UI_Components_Kit.fig' },
    ],
  },
];

const PAST: PastSession[] = [
  { id: 103, expert: 'Đặng Thu F', date: '02/05/2026', time: '09:00 - 10:00', status: 'Hoàn thành' },
];

const StudyTab = () => (
  <SessionsList
    sessionLabel="Học với"
    historyTitle="Lịch sử học"
    upcomingSessions={UPCOMING}
    pastSessions={PAST}
    allowEdit
  />
);

export default StudyTab;

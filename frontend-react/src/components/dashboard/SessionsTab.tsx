import SessionsList, { type UpcomingSession, type PastSession } from './SessionsList';

const UPCOMING: UpcomingSession[] = [
  {
    id: 1,
    expert: 'Nguyễn Văn A',
    date: '10/05/2026',
    time: '09:00 - 10:00',
    problem: 'Cần tư vấn về chiến lược phát triển thị trường và định vị thương hiệu cho startup giai đoạn đầu.',
    documents: [
      { name: 'Business_Plan_2026.pdf', url: '#' },
      { name: 'Market_Research.docx',   url: '#' },
    ],
  },
  {
    id: 2,
    expert: 'Trần Thị B',
    date: '12/05/2026',
    time: '14:00 - 15:00',
    problem: 'Định hướng lộ trình trở thành Software Architect và các kỹ năng cần trau dồi.',
    documents: [],
  },
];

const PAST: PastSession[] = [
  { id: 3, expert: 'Lê Văn C', date: '01/05/2026', time: '10:00 - 11:00', status: 'Hoàn thành' },
];

const SessionsTab = () => (
  <SessionsList
    sessionLabel="Tư vấn với"
    historyTitle="Lịch sử tư vấn"
    expertColumnLabel="Học viên"
    upcomingSessions={UPCOMING}
    pastSessions={PAST}
  />
);

export default SessionsTab;

import type { Go } from '../App';
import { Footer, Header } from '../components/ui';

// shortcut: 초안 문구. 출시 전 운영자 정보·문의처를 넣고 법률 검토 후 확정.
export function PrivacyPage({ go }: { go: Go }) {
  return (
    <div className="page">
      <Header go={go} back={() => history.back()} />
      <main className="prose">
        <h1>개인정보처리방침</h1>
        <p>짜주께는 회원가입 없이 쓰는 서비스이며, 이름·연락처 같은 개인을 알아볼 수 있는 정보를 받지 않아요.</p>
        <h2>저장하는 정보</h2>
        <ul>
          <li>코스를 만들면 공유 링크를 위해 입력값(출발지 이름·좌표, 장소, 시간, 성향 선택)을 서버에 90일 동안 저장해요. 90일이 지나면 자동으로 지워져요.</li>
          <li>마지막으로 고른 성향과 작성 중인 코스는 이 기기의 브라우저 저장소에만 남아요.</li>
          <li>서비스 개선을 위해 화면 진입·버튼 클릭 같은 익명 이용 기록을 모을 수 있어요.</li>
        </ul>
        <h2>외부 서비스</h2>
        <p>장소 검색에 카카오 로컬 API를 써요. 검색어와 기준 좌표가 카카오로 전달돼요.</p>
      </main>
      <Footer go={go} />
    </div>
  );
}

// 현재 URL에서 호스트명(도메인)을 가져옴 (예: ashchord.github.io)
const hostname = window.location.hostname;

// 호스트명이 ashchord.github.io인지 확인
if (hostname.toLowerCase() === "ashchord.github.io") {
  // 대소문자 구분 없이 첫 번째 글자만 대문자로 수정
  const formattedHost = "AshChord.github.io";

  // 새로운 URL로 변경 (대소문자 수정된 hostname)
  const newUrl = window.location.href.replace(hostname, formattedHost);

  // history.replaceState()로 브라우저의 주소 표시줄만 업데이트 (새로 고침 없이)
  window.history.replaceState({}, '', newUrl);
}